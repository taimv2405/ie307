// Lookup backend: holds the Gemini key(s), the app never sees them.
// POST /lookup { tokens: string[], index: number }  ->  { head, pos, meaning_vi, word_fixed, phrase: number[], ipa, ... }
import http from 'node:http';
import fs from 'node:fs';
import { ipaOf } from './ipa.mjs';

// --- config (.env next to this file) ---
const envFile = new URL('./.env', import.meta.url);
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}
const KEYS = (process.env.GEMINI_KEYS || '').split(',').map((s) => s.trim()).filter(Boolean);
const PORT = Number(process.env.PORT || 8787);
// first model, then fallback when it is overloaded / rate limited / too slow
const MODELS = [
  { id: 'gemini-3.1-flash-lite', timeout: 6000 },
  { id: 'gemini-3.5-flash-lite', timeout: 8000 },
];
if (!KEYS.length) console.warn('!! GEMINI_KEYS is empty — copy .env.example to .env');

const SYS = `You help Vietnamese learners read English. The user tapped one token in a sentence; the sentence is given as numbered tokens and the tapped one is marked [[like this]].
The text comes from OCR of a photo and may contain misread words (e.g. "stod" for "stood"); work on the corrected text.
Return JSON:
- word_fixed: the tapped token as really printed (fix OCR errors; same text if correct).
- head: if the tapped token is part of a multi-word expression whose meaning is not just the sum of its words (phrasal verb, also when separated like "picked it up"; prepositional verb like "look into", "give up on"; idiom like "break the ice", "in no uncertain terms"; fixed compound noun like "ice cream"; fixed phrase like "in short", "because of"), give that expression in dictionary form ("pick up", "give up on"). Literal verb + preposition ("walked into the room", "ran up the hill") is NOT an expression: give the lemma of the tapped word alone. Otherwise give the lemma of the tapped word ("children" -> "child", "best" -> "good").
- phrase: the token numbers in the sentence that belong to head as it appears in the sentence (e.g. for "picked it up" the numbers of "picked" and "up"; for a single word just the tapped number).
- pos: one of NOUN, VERB, ADJ, ADV, ADP, PHRASAL_VERB, IDIOM, PROPN (names; then meaning_vi is "").
- meaning_vi: the Vietnamese meaning of head AS USED IN THIS SENTENCE, short like a dictionary gloss (2-8 words), no explanation.
- ipa: IPA of head (American), like /ɡɪv ʌp ɑn/.`;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    word_fixed: { type: 'STRING' }, head: { type: 'STRING' }, phrase: { type: 'ARRAY', items: { type: 'INTEGER' } },
    pos: { type: 'STRING' }, meaning_vi: { type: 'STRING' }, ipa: { type: 'STRING' },
  },
  required: ['word_fixed', 'head', 'phrase', 'pos', 'meaning_vi', 'ipa'],
};

let keyIx = 0;
const cache = new Map();

function decodeEntities(s) {
  return (s || '').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&amp;/g, '&');
}

async function callGemini(model, userText) {
  const key = KEYS[keyIx++ % KEYS.length];
  const t0 = Date.now();
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYS }] },
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: SCHEMA, temperature: 0 },
    }),
    signal: AbortSignal.timeout(model.timeout),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`${model.id} ${r.status} ${j.error?.status || ''}`);
  const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  return { data: JSON.parse(text), ms: Date.now() - t0, usage: j.usageMetadata };
}

async function lookup(tokens, index) {
  const userText = 'Tokens: ' + tokens.map((t, i) => (i === index ? `${i}=[[${t}]]` : `${i}=${t}`)).join(' ');
  const errors = [];
  for (const model of MODELS) {
    for (let attempt = 0; attempt < Math.min(2, KEYS.length); attempt++) {
      try {
        const { data, ms, usage } = await callGemini(model, userText);
        data.meaning_vi = decodeEntities(data.meaning_vi);
        const phrase = (data.phrase || []).filter((n) => Number.isInteger(n) && n >= 0 && n < tokens.length);
        if (!phrase.includes(index)) phrase.push(index);
        const dictIpa = ipaOf(data.head);
        return {
          ...data, phrase: [...new Set(phrase)].sort((a, b) => a - b),
          ipa: dictIpa || data.ipa, ipa_source: dictIpa ? 'cmudict' : 'llm',
          model: model.id, ms_llm: ms, tokens_in: usage?.promptTokenCount, tokens_out: usage?.candidatesTokenCount, errors,
        };
      } catch (e) {
        errors.push(e.name === 'TimeoutError' ? `${model.id} timeout` : String(e.message || e));
      }
    }
  }
  const err = new Error('all models failed'); err.details = errors; throw err;
}

const server = http.createServer(async (req, res) => {
  const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
  if (req.method === 'GET' && req.url === '/health') return send(200, { ok: true, keys: KEYS.length });
  if (req.method !== 'POST' || req.url !== '/lookup') return send(404, { error: 'not found' });
  let body = '';
  for await (const chunk of req) body += chunk;
  const t0 = Date.now();
  try {
    const { tokens, index } = JSON.parse(body);
    if (!Array.isArray(tokens) || !Number.isInteger(index) || index < 0 || index >= tokens.length) return send(400, { error: 'bad request' });
    const key = tokens.join('\u0001') + '#' + index;
    let out = cache.get(key);
    const hit = !!out;
    if (!out) { out = await lookup(tokens, index); cache.set(key, out); }
    const total = Date.now() - t0;
    console.log(`${new Date().toISOString().slice(11, 19)} "${tokens[index]}" -> ${out.head} | ${out.meaning_vi} | ${out.model} ${hit ? 'cache' : out.ms_llm + 'ms'}${out.errors?.length ? ' | ' + out.errors.join('; ') : ''}`);
    send(200, { ...out, cached: hit, ms_server: total });
  } catch (e) {
    console.log('lookup failed', e.message, e.details || '');
    send(502, { error: e.message, details: e.details });
  }
});
server.listen(PORT, () => console.log(`nhat server on http://0.0.0.0:${PORT} (keys: ${KEYS.length})`));
