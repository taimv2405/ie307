import Constants from 'expo-constants';

export type Lookup = {
  head: string;
  word_fixed: string;
  phrase: number[]; // token positions inside the sentence
  pos: string;
  meaning_vi: string;
  ipa: string;
  ipa_source: 'cmudict' | 'llm';
  model: string;
  ms_llm: number;
  ms_server: number;
  cached: boolean;
  errors?: string[];
};

const API_URL: string = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ?? 'http://127.0.0.1:8787';

export async function lookup(tokens: string[], index: number, signal?: AbortSignal): Promise<Lookup> {
  const r = await fetch(`${API_URL}/lookup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tokens, index }),
    signal,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j as Lookup;
}

export const POS_VI: Record<string, string> = {
  NOUN: 'danh từ',
  VERB: 'động từ',
  ADJ: 'tính từ',
  ADV: 'trạng từ',
  ADP: 'giới từ',
  PHRASAL_VERB: 'cụm động từ',
  IDIOM: 'thành ngữ',
  PROPN: 'tên riêng',
};
