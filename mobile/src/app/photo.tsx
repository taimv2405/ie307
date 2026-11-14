// Màn "Ảnh đã chụp" + "Tra từ": chạm một từ trên ảnh -> tô cụm, hiện nghĩa, IPA, phát âm.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Image, type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recognizeText } from '@infinitered/react-native-mlkit-text-recognition';
import { buildText, hitTest, type Sentence, type Token } from '@/lib/text';
import { lookup, type Lookup } from '@/lib/api';
import { LookupSheet, fmt } from '@/components/LookupSheet';
import { SavedList, type SavedEntry } from '@/components/SavedList';
import { saveLookup, unsave } from '@/lib/db';
import { C } from '@/lib/theme';

type Tap = { token: number; result: Lookup | null; error: string | null; msClient: number | null };
const entryKey = (sentence: number, phrase: number[]) => `${sentence}|${phrase.join(',')}`;

export default function PhotoScreen() {
  const { uri, w, h, msPrepare } = useLocalSearchParams<{ uri: string; w: string; h: string; msPrepare?: string }>();
  const imgW = Number(w), imgH = Number(h);
  const insets = useSafeAreaInsets();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [ocr, setOcr] = useState<{ tokens: Token[]; sentences: Sentence[]; ms: number } | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [tap, setTap] = useState<Tap | null>(null);
  const abort = useRef<AbortController | null>(null);
  // "Đã lưu" of this photo only (starts empty for every new photo)
  const [saved, setSaved] = useState<Record<string, SavedEntry>>({});
  const [showSaved, setShowSaved] = useState(false);
  const savedList = Object.values(saved);

  // Đóng / Back: ask "Bỏ ảnh?" only when something was saved from this photo
  const hasSaved = savedList.length > 0;
  const leave = useCallback(() => {
    if (!hasSaved) {
      router.back();
      return;
    }
    Alert.alert('Bỏ ảnh này?', 'Từ đã lưu vẫn giữ.', [
      { text: 'Ở lại', style: 'cancel' },
      { text: 'Bỏ ảnh', style: 'destructive', onPress: () => router.back() },
    ]);
  }, [hasSaved]);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showSaved) setShowSaved(false);
      else if (tap) setTap(null);
      else leave();
      return true;
    });
    return () => sub.remove();
  }, [leave, showSaved, tap]);

  const doSave = (sentence: number, result: Lookup) => {
    if (!ocr) return;
    const tokens = ocr.sentences[sentence].tokens.map((i) => ocr.tokens[i].text);
    const s = saveLookup(result, tokens, uri);
    setSaved((m) => ({ ...m, [entryKey(sentence, result.phrase)]: { ...s, sentence, phrase: result.phrase, meaning: result.meaning_vi } }));
  };
  const doUnsave = (e: SavedEntry) => {
    unsave(e);
    const k = entryKey(e.sentence, e.phrase);
    if (Object.keys(saved).filter((x) => x !== k).length === 0) setShowSaved(false); // list closes itself when empty
    setSaved((m) => {
      const n = { ...m };
      delete n[k];
      return n;
    });
  };

  useEffect(() => {
    let alive = true;
    const t0 = Date.now();
    recognizeText(uri)
      .then((res) => alive && setOcr({ ...buildText(res.blocks), ms: Date.now() - t0 }))
      .catch((e) => alive && setOcrError(String(e?.message ?? e)));
    return () => {
      alive = false;
    };
  }, [uri]);

  // contain-fit of the image inside the view
  const fit = useMemo(() => {
    if (!box.width || !imgW) return null;
    const scale = Math.min(box.width / imgW, box.height / imgH);
    return { scale, ox: (box.width - imgW * scale) / 2, oy: (box.height - imgH * scale) / 2 };
  }, [box, imgW, imgH]);

  const onLayout = (e: LayoutChangeEvent) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });

  const onPress = async (x: number, y: number) => {
    if (!ocr || !fit) return;
    const ti = hitTest(ocr.tokens, (x - fit.ox) / fit.scale, (y - fit.oy) / fit.scale);
    if (ti < 0) return;
    const tok = ocr.tokens[ti];
    const sent = ocr.sentences[tok.sentence].tokens.map((i) => ocr.tokens[i].text);
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    setTap({ token: ti, result: null, error: null, msClient: null });
    const t0 = Date.now();
    try {
      const result = await lookup(sent, tok.pos, ac.signal);
      if (!ac.signal.aborted) setTap({ token: ti, result, error: null, msClient: Date.now() - t0 });
    } catch (e: any) {
      if (!ac.signal.aborted) setTap({ token: ti, result: null, error: String(e?.message ?? e), msClient: Date.now() - t0 });
    }
  };

  // boxes to highlight: the phrase (or just the tapped token while loading)
  const highlight = useMemo(() => {
    if (!tap || !ocr) return [];
    const tok = ocr.tokens[tap.token];
    const sentTokens = ocr.sentences[tok.sentence].tokens;
    const positions = tap.result?.phrase ?? [tok.pos];
    return positions.map((p) => sentTokens[p]).filter((i) => i != null).map((i) => ({ i, boxes: ocr.tokens[i].boxes }));
  }, [tap, ocr]);

  const tapped = tap && ocr ? ocr.tokens[tap.token] : null;
  const tapSaved = tapped && tap?.result ? saved[entryKey(tapped.sentence, tap.result.phrase)] ?? null : null;

  // thin underline under every saved phrase on the photo
  const underlines = useMemo(() => {
    if (!ocr) return [];
    return savedList.flatMap((e) => e.phrase.map((p) => ocr.sentences[e.sentence].tokens[p]).filter((i) => i != null).flatMap((i) => ocr.tokens[i].boxes));
  }, [savedList, ocr]);

  return (
    <View style={s.root}>
      {/* locationX/Y are relative to the view that received the touch: keep every child
          non-touchable so the target is always this full-screen Pressable (else taps land shifted by the letterbox) */}
      <Pressable style={StyleSheet.absoluteFill} onLayout={onLayout} onPress={(e) => onPress(e.nativeEvent.locationX, e.nativeEvent.locationY)}>
        {fit && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Image source={{ uri }} style={{ position: 'absolute', left: fit.ox, top: fit.oy, width: imgW * fit.scale, height: imgH * fit.scale }} />
            {highlight.map(({ i, boxes }) =>
              boxes.map((b, k) => (
                <View
                  key={`${i}-${k}`}
                  style={{
                    position: 'absolute',
                    left: fit.ox + b.left * fit.scale - 3,
                    top: fit.oy + b.top * fit.scale - 2,
                    width: (b.right - b.left) * fit.scale + 6,
                    height: (b.bottom - b.top) * fit.scale + 4,
                    borderRadius: 6,
                    backgroundColor: i === tap?.token ? C.hlTap : C.hl,
                  }}
                />
              )),
            )}
            {underlines.map((b, k) => (
              <View
                key={`u${k}`}
                style={{
                  position: 'absolute',
                  left: fit.ox + b.left * fit.scale,
                  top: fit.oy + b.bottom * fit.scale + 1,
                  width: (b.right - b.left) * fit.scale,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: C.red,
                }}
              />
            ))}
          </View>
        )}
      </Pressable>

      <View style={[s.top, { top: insets.top + 12 }]} pointerEvents="box-none">
        <Pressable style={s.round} onPress={leave} accessibilityLabel="Đóng">
          <Text style={s.icon}>✕</Text>
        </Pressable>
        <View style={s.status}>
          {!ocr && !ocrError && <ActivityIndicator color="#fff" size="small" />}
          <Text style={s.statusText}>
            {ocrError ? `OCR lỗi: ${ocrError}` : !ocr ? 'Đang đọc chữ…' : ocr.tokens.length ? `${ocr.tokens.length} từ · OCR ${fmt(ocr.ms)}${msPrepare ? ` · xử lý ảnh ${fmt(Number(msPrepare))}` : ''}` : 'Không thấy chữ trong ảnh'}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        {savedList.length > 0 && (
          <Pressable style={s.badge} onPress={() => setShowSaved(true)} accessibilityLabel="Xem các từ đã lưu">
            <Text style={s.badgeText}>Đã lưu</Text>
            <View style={s.badgeNum}>
              <Text style={s.badgeNumText}>{savedList.length}</Text>
            </View>
          </Pressable>
        )}
      </View>

      {tap && tapped && ocr && !showSaved && (
        <LookupSheet
          key={tap.token}
          tapped={tapped.text}
          sentence={ocr.sentences[tapped.sentence].tokens.map((i) => ocr.tokens[i].text)}
          tappedPos={tapped.pos}
          result={tap.result}
          error={tap.error}
          msClient={tap.msClient}
          bottomInset={insets.bottom}
          saved={tapSaved}
          onSave={() => tap.result && doSave(tapped.sentence, tap.result)}
          onUnsave={() => tapSaved && doUnsave(tapSaved)}
          onClose={() => {
            abort.current?.abort();
            setTap(null);
          }}
        />
      )}

      {showSaved && <SavedList items={savedList} bottomInset={insets.bottom} onUnsave={doUnsave} onClose={() => setShowSaved(false)} />}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.backdrop },
  top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18, color: C.ink, fontWeight: '700' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, flexShrink: 1 },
  statusText: { color: '#fff', fontSize: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 22, paddingLeft: 14, paddingRight: 6, height: 40 },
  badgeText: { fontSize: 14, fontWeight: '800', color: C.ink },
  badgeNum: { minWidth: 26, height: 26, borderRadius: 13, backgroundColor: '#1E6B5C', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeNumText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
