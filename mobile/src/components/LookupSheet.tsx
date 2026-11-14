// Thẻ "Tra từ" ở đáy màn Ảnh đã chụp.
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { POS_VI, type Lookup } from '@/lib/api';
import type { Saved } from '@/lib/db';
import { C } from '@/lib/theme';

type Props = {
  tapped: string;
  sentence: string[]; // tokens of the sentence
  tappedPos: number;
  result: Lookup | null;
  error: string | null;
  msClient: number | null;
  bottomInset: number;
  saved: Saved | null;
  onSave: () => void;
  onUnsave: () => void;
  onClose: () => void;
};

export function LookupSheet({ tapped, sentence, tappedPos, result, error, msClient, bottomInset, saved, onSave, onUnsave, onClose }: Props) {
  const [note, setNote] = useState<string | null>(null); // reset by the parent's `key` when another word is tapped
  const hl = new Set(result?.phrase ?? [tappedPos]);
  const speak = () => {
    if (!result) return;
    Speech.stop();
    Speech.speak(result.head, { language: 'en-US', rate: 0.9 });
  };

  return (
    <View style={[s.sheet, { paddingBottom: bottomInset + 16 }]}>
      <View style={s.handle} />
      {!result && !error && (
        <View style={s.loading}>
          <Text style={s.head}>{tapped.replace(/[^\p{L}\p{N}'’-]/gu, '')}</Text>
          <ActivityIndicator color={C.red} />
        </View>
      )}
      {error && (
        <View style={{ gap: 6 }}>
          <Text style={s.head}>{tapped}</Text>
          <Text style={s.error}>Không tra được: {error}</Text>
        </View>
      )}
      {result && (
        <>
          <View style={s.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.head}>{result.head}</Text>
              <View style={s.metaRow}>
                {!!result.ipa && <Text style={s.ipa}>{result.ipa}</Text>}
                <View style={s.chip}>
                  <Text style={s.chipText}>{POS_VI[result.pos] ?? result.pos.toLowerCase()}</Text>
                </View>
              </View>
            </View>
            <Pressable style={s.speaker} onPress={speak} accessibilityLabel="Nghe phát âm">
              <Text style={s.speakerIcon}>🔊</Text>
            </Pressable>
          </View>
          {!!result.meaning_vi && <Text style={s.meaning}>{result.meaning_vi}</Text>}
          {result.word_fixed && result.word_fixed.toLowerCase() !== tapped.replace(/[^\p{L}\p{N}'’-]/gu, '').toLowerCase() && (
            <Text style={s.fixed}>Ảnh đọc ra “{tapped}”, đã sửa thành “{result.word_fixed}”</Text>
          )}
          <Text style={s.label}>Câu mới</Text>
          <View style={s.sentenceBox}>
            <Text style={s.sentence}>
              {sentence.map((t, i) => (
                <Text key={i} style={hl.has(i) ? s.sentenceHl : undefined}>
                  {(i === tappedPos && result.word_fixed ? keepPunct(t, result.word_fixed) : t) + (i < sentence.length - 1 ? ' ' : '')}
                </Text>
              ))}
            </Text>
          </View>
        </>
      )}
      <Text style={s.timing}>
        {msClient != null ? `tra ${fmt(msClient)}` : 'đang tra…'}
        {result ? ` · máy chủ ${fmt(result.ms_server)} · ${result.cached ? 'cache' : result.model}${result.errors?.length ? ' (dự phòng)' : ''}` : ''}
      </Text>
      {saved && (
        <Text style={s.savedLine}>
          {saved.createdCard ? '✓ Đã lưu thành thẻ mới' : saved.sentenceId != null ? `✓ Đã thêm câu vào thẻ “${saved.head}” có sẵn` : `✓ Câu này đã có trong thẻ “${saved.head}”`}
        </Text>
      )}
      {note && <Text style={s.note}>{note}</Text>}
      <View style={s.buttons}>
        {saved ? (
          <Pressable style={[s.btn, s.btnClose, { flex: 1.6 }]} onPress={onUnsave}>
            <Text style={s.btnCloseText}>{saved.createdCard ? 'Bỏ lưu' : 'Bỏ câu này'}</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[s.btn, s.btnSave, !result && { opacity: 0.4 }]}
            disabled={!result}
            onPress={() => {
              try {
                onSave();
              } catch (e: any) {
                setNote(`Lưu lỗi: ${e?.message ?? e}`);
              }
            }}
          >
            <Text style={s.btnSaveText}>Lưu</Text>
          </Pressable>
        )}
        <Pressable style={[s.btn, s.btnClose]} onPress={onClose}>
          <Text style={s.btnCloseText}>Đóng</Text>
        </Pressable>
      </View>
    </View>
  );
}

function keepPunct(orig: string, fixed: string) {
  const lead = orig.match(/^[^\p{L}\p{N}]*/u)?.[0] ?? '';
  const trail = orig.match(/[^\p{L}\p{N}]*$/u)?.[0] ?? '';
  return lead + fixed + trail;
}

export const fmt = (ms: number) => (ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1).replace('.', ',')} s`);

const s = StyleSheet.create({
  sheet: { position: 'absolute', left: 8, right: 8, bottom: 0, backgroundColor: C.sheet, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 8, gap: 8, elevation: 12 },
  handle: { alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: C.line, marginBottom: 6 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  head: { fontSize: 28, fontWeight: '800', color: C.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' },
  ipa: { fontSize: 14, color: C.sub },
  chip: { backgroundColor: C.redSoft, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  chipText: { fontSize: 12, color: C.red, fontWeight: '700' },
  speaker: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  speakerIcon: { fontSize: 20 },
  meaning: { fontSize: 18, fontWeight: '700', color: C.ink },
  fixed: { fontSize: 12, color: C.sub, fontStyle: 'italic' },
  label: { fontSize: 12, fontWeight: '700', color: C.ink, marginTop: 4 },
  sentenceBox: { backgroundColor: C.redSoft, borderRadius: 12, padding: 12 },
  sentence: { fontSize: 15, lineHeight: 22, color: C.ink },
  sentenceHl: { color: C.red, fontWeight: '800' },
  timing: { fontSize: 11, color: C.sub },
  note: { fontSize: 12, color: C.red },
  savedLine: { fontSize: 13, fontWeight: '700', color: '#1E6B5C' },
  error: { fontSize: 14, color: C.red },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  btn: { flex: 1, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  btnSave: { flex: 1.6, backgroundColor: C.red, borderWidth: 1.5, borderColor: C.ink },
  btnSaveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  btnClose: { borderWidth: 1.5, borderColor: C.ink, backgroundColor: '#fff' },
  btnCloseText: { color: C.ink, fontSize: 16, fontWeight: '800' },
});
