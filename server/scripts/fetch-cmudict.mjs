// Tải CMUdict (giấy phép kiểu BSD) về server/data/cmudict.dict
import fs from 'node:fs';
const url = 'https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict';
const r = await fetch(url);
if (!r.ok) throw new Error('download failed ' + r.status);
fs.writeFileSync(new URL('../data/cmudict.dict', import.meta.url), await r.text());
console.log('saved data/cmudict.dict');
