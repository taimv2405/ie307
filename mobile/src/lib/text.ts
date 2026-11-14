// OCR blocks -> tokens (with boxes) -> sentences. Pure functions, no native code.
import type { Block, Rect } from '@infinitered/react-native-mlkit-text-recognition';

export type Token = {
  text: string;
  boxes: Rect[]; // usually 1; 2 when a word was hyphenated across lines ("gar-" + "den")
  sentence: number; // index into sentences
  pos: number; // index of this token inside its sentence
};

export type Sentence = { tokens: number[] }; // indices into tokens

const ABBR = new Set(['mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'vs', 'etc', 'e.g', 'i.e', 'a.m', 'p.m', 'u.s', 'u.k', 'no', 'fig', 'inc', 'ltd', 'co', 'mt']);

function endsSentence(word: string, next: string | undefined): boolean {
  if (!/[.!?]["'”’)\]]*$/.test(word)) return false;
  if (!next) return true;
  const core = word.replace(/^["'“‘(]+/, '').replace(/[.!?"'”’)\]]+$/, '').toLowerCase();
  if (/\.$/.test(word.replace(/["'”’)\]]+$/, '')) && (ABBR.has(core) || /^[a-z]$/.test(core) || /^([a-z]\.)+[a-z]$/.test(core))) return false;
  return /^["'“‘(\[]?[A-Z0-9]/.test(next);
}

export function buildText(blocks: Block[]): { tokens: Token[]; sentences: Sentence[] } {
  const tokens: Token[] = [];
  const sentences: Sentence[] = [];
  for (const block of blocks) {
    // 1. words of the block in reading order, joining "gar-" + "den"
    const words: { text: string; boxes: Rect[] }[] = [];
    block.lines.forEach((line, li) => {
      line.elements.forEach((el, ei) => {
        const prev = words[words.length - 1];
        const firstOfLine = ei === 0 && li > 0;
        if (firstOfLine && prev && /[A-Za-z]-$/.test(prev.text) && /^[a-z]/.test(el.text)) {
          prev.text = prev.text.slice(0, -1) + el.text;
          prev.boxes.push(el.frame);
        } else {
          words.push({ text: el.text, boxes: [el.frame] });
        }
      });
    });
    // 2. split into sentences
    let cur: number[] = [];
    words.forEach((w, i) => {
      const ti = tokens.length;
      tokens.push({ text: w.text, boxes: w.boxes, sentence: sentences.length, pos: cur.length });
      cur.push(ti);
      if (endsSentence(w.text, words[i + 1]?.text) || i === words.length - 1) {
        sentences.push({ tokens: cur });
        cur = [];
      }
    });
  }
  return { tokens, sentences };
}

/** token under an image-space point; falls back to the nearest box within ~0.7 line height */
export function hitTest(tokens: Token[], x: number, y: number): number {
  let best = -1;
  let bestD = Infinity;
  tokens.forEach((t, i) => {
    for (const b of t.boxes) {
      const pad = (b.bottom - b.top) * 0.15;
      if (x >= b.left - pad && x <= b.right + pad && y >= b.top - pad && y <= b.bottom + pad) {
        best = i;
        bestD = -1;
        return;
      }
      if (bestD < 0) continue;
      const cx = Math.max(b.left - x, 0, x - b.right);
      const cy = Math.max(b.top - y, 0, y - b.bottom);
      const d = Math.hypot(cx, cy);
      if (d < bestD && d < (b.bottom - b.top) * 0.7) {
        bestD = d;
        best = i;
      }
    }
  });
  return best;
}
