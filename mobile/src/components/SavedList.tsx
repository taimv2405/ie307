// Danh sách "Đã lưu" của ảnh đang mở (bản vừa phải: xem + bỏ lưu).
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Saved } from '@/lib/db';
import { C } from '@/lib/theme';

export type SavedEntry = Saved & { sentence: number; phrase: number[]; meaning: string };

type Props = { items: SavedEntry[]; bottomInset: number; onUnsave: (e: SavedEntry) => void; onClose: () => void };

export function SavedList({ items, bottomInset, onUnsave, onClose }: Props) {
  return (
    <View style={[s.sheet, { paddingBottom: bottomInset + 16 }]}>
      <View style={s.handle} />
      <Text style={s.title}>Đã lưu từ ảnh này</Text>
      <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ gap: 10 }}>
        {items.map((e) => (
          <View key={`${e.sentence}|${e.phrase.join(',')}`} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.head}>{e.head}</Text>
              <Text style={s.meaning} numberOfLines={1}>
                {e.meaning}
              </Text>
            </View>
            {!e.createdCard && <Text style={s.tag}>thẻ cũ</Text>}
            <Pressable style={s.unsave} onPress={() => onUnsave(e)}>
              <Text style={s.unsaveText}>{e.createdCard ? 'Bỏ lưu' : 'Bỏ câu'}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
      <Pressable style={s.close} onPress={onClose}>
        <Text style={s.closeText}>Đóng</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  sheet: { position: 'absolute', left: 8, right: 8, bottom: 0, backgroundColor: C.sheet, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 8, gap: 12, elevation: 12 },
  handle: { alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: C.line },
  title: { fontSize: 18, fontWeight: '800', color: C.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.line },
  head: { fontSize: 16, fontWeight: '800', color: C.ink },
  meaning: { fontSize: 14, color: C.sub },
  tag: { fontSize: 11, color: C.sub, borderWidth: 1, borderColor: C.line, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  unsave: { borderWidth: 1.5, borderColor: C.ink, borderRadius: 18, paddingHorizontal: 12, height: 36, justifyContent: 'center' },
  unsaveText: { fontWeight: '700', color: C.ink },
  close: { height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, fontWeight: '800', color: C.ink },
});
