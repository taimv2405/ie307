// CMUdict (ARPAbet, US) -> IPA
import fs from 'node:fs';

const V = {
  AA: 'ɑ', AE: 'æ', AH: 'ʌ', AO: 'ɔ', AW: 'aʊ', AY: 'aɪ', EH: 'ɛ', ER: 'ɝ', EY: 'eɪ',
  IH: 'ɪ', IY: 'i', OW: 'oʊ', OY: 'ɔɪ', UH: 'ʊ', UW: 'u',
};
const C = {
  B: 'b', CH: 'tʃ', D: 'd', DH: 'ð', F: 'f', G: 'ɡ', HH: 'h', JH: 'dʒ', K: 'k', L: 'l', M: 'm', N: 'n',
  NG: 'ŋ', P: 'p', R: 'ɹ', S: 's', SH: 'ʃ', T: 't', TH: 'θ', V: 'v', W: 'w', Y: 'j', Z: 'z', ZH: 'ʒ',
};

let DICT = null;
function load() {
  if (DICT) return DICT;
  DICT = new Map();
  const f = new URL('./data/cmudict.dict', import.meta.url);
  if (!fs.existsSync(f)) return DICT;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const [w, ...ph] = line.split('#')[0].trim().split(/\s+/);
    if (!w || w.includes('(')) continue; // keep first pronunciation only
    DICT.set(w, ph);
  }
  return DICT;
}

function toIpa(phones) {
  const nVowels = phones.filter((p) => /\d$/.test(p)).length;
  const out = [];
  phones.forEach((p) => {
    const m = p.match(/^([A-Z]+)(\d)?$/);
    if (!m) return;
    const [, base, stress] = m;
    if (V[base]) {
      let v = V[base];
      if (base === 'AH' && stress === '0') v = 'ə';
      if (base === 'ER' && stress === '0') v = 'ɚ';
      if (nVowels > 1 && (stress === '1' || stress === '2')) {
        // put the stress mark before the onset consonant directly in front of the vowel
        const mark = stress === '1' ? 'ˈ' : 'ˌ';
        // onset = last consonant, plus one more if it forms a legal cluster (pl, tr, kj, st, sp…)
        let k = out.length;
        if (k && !out[k - 1].vowel && !out[k - 1].s.match(/^[ˈˌ]$/)) {
          k--;
          const c1 = out[k - 1], c2 = out[k];
          const glide = c1 && !c1.vowel && ((/^(l|ɹ|w)$/.test(c2.s) && /^(p|b|t|d|k|ɡ|f|θ|ʃ)$/.test(c1.s)) || (c2.s === 'j' && /^(p|b|k|ɡ|f|m|h)$/.test(c1.s)));
          const sStop = c1 && !c1.vowel && c1.s === 's' && /^(p|t|k)$/.test(c2.s);
          if (glide || sStop) k--;
        }
        out.splice(k, 0, { s: mark });
      }
      out.push({ s: v, vowel: true });
    } else if (C[base]) out.push({ s: C[base] });
  });
  return out.map((x) => x.s).join('');
}

const SKIP = new Set(['someone', 'somebody', 'something', "one's", "someone's", 'sb', 'sth']);

/** IPA for a word or phrase; null if any word is unknown */
export function ipaOf(text) {
  const d = load();
  const words = text.toLowerCase().replace(/[^a-z' -]/g, '').split(/[\s-]+/).filter((w) => w && !SKIP.has(w));
  if (!words.length) return null;
  const parts = [];
  for (const w of words) {
    const ph = d.get(w) || d.get(w.replace(/'/g, ''));
    if (!ph) return null;
    parts.push(toIpa(ph));
  }
  return '/' + parts.join(' ') + '/';
}
