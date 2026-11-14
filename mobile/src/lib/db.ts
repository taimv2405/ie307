// Lưu thẻ (bản vừa phải): một thẻ = cụm/từ + một nghĩa, kèm danh sách câu. Ảnh không được lưu, chỉ ghi mã ảnh.
import { openDatabaseSync } from 'expo-sqlite';
import type { Lookup } from './api';

const db = openDatabaseSync('nhat.db');
db.execSync(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    head TEXT NOT NULL, head_key TEXT NOT NULL, meaning_key TEXT NOT NULL,
    pos TEXT, meaning_vi TEXT, ipa TEXT,
    created_photo TEXT, created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS cards_head ON cards(head_key);
  CREATE TABLE IF NOT EXISTS sentences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    text TEXT NOT NULL, phrase TEXT NOT NULL, photo_id TEXT, created_at INTEGER NOT NULL
  );
`);

const key = (s: string) => s.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}' ]/gu, '').replace(/\s+/g, ' ').trim();

export type Saved = { cardId: number; sentenceId: number | null; createdCard: boolean; head: string };

/**
 * Same head AND same meaning text -> add the sentence to that card; otherwise a new card.
 * (Simplified: the full rule compares meanings with the LLM.)
 */
export function saveLookup(r: Lookup, sentence: string[], photoId: string): Saved {
  const now = Date.now();
  const text = sentence.join(' ');
  let saved: Saved | null = null;
  db.withTransactionSync(() => {
    const existing = db.getFirstSync<{ id: number }>('SELECT id FROM cards WHERE head_key = ? AND meaning_key = ?', key(r.head), key(r.meaning_vi));
    let cardId = existing?.id;
    const createdCard = !cardId;
    if (!cardId) {
      cardId = db.runSync(
        'INSERT INTO cards (head, head_key, meaning_key, pos, meaning_vi, ipa, created_photo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        r.head, key(r.head), key(r.meaning_vi), r.pos, r.meaning_vi, r.ipa, photoId, now,
      ).lastInsertRowId;
    }
    const dup = db.getFirstSync<{ id: number }>('SELECT id FROM sentences WHERE card_id = ? AND text = ?', cardId, text);
    const sentenceId = dup ? null : db.runSync('INSERT INTO sentences (card_id, text, phrase, photo_id, created_at) VALUES (?, ?, ?, ?, ?)', cardId, text, JSON.stringify(r.phrase), photoId, now).lastInsertRowId;
    saved = { cardId, sentenceId, createdCard, head: r.head };
  });
  return saved!;
}

/** Bỏ lưu: a card created from this photo is deleted with all its sentences; for an older card only the added sentence goes. */
export function unsave(s: Saved) {
  if (s.createdCard) db.runSync('DELETE FROM cards WHERE id = ?', s.cardId);
  else if (s.sentenceId != null) db.runSync('DELETE FROM sentences WHERE id = ?', s.sentenceId);
}

export function countCards(): number {
  return db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM cards')?.n ?? 0;
}
