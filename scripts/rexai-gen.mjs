// RexAI 生图管线:提交 → 轮询 → 下载(替代 rexai-image-macos.sh 的轮询实现)
// 用法: node scripts/rexai-gen.mjs <outName> <size> <prompt>
import { mkdir, writeFile } from 'node:fs/promises';

const [outName, size, ...promptParts] = process.argv.slice(2);
const prompt = promptParts.join(' ');
const KEY = process.env.REXAI_API_KEY;
if (!KEY) {
  console.error('REXAI_API_KEY missing');
  process.exit(1);
}
const BASE = 'https://coding.rexai.top';

async function submit() {
  const res = await fetch(`${BASE}/v1/images/generations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt, n: 1, size }),
  });
  if (!res.ok) throw new Error(`submit ${res.status}: ${await res.text()}`);
  return res.json();
}

async function poll(id) {
  for (let i = 0; i < 90; i += 1) {
    await new Promise((r) => setTimeout(r, 4000));
    const res = await fetch(`${BASE}/v1/images/jobs/${id}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    const job = await res.json();
    if (job.status === 'succeeded') return job;
    if (job.status === 'failed') throw new Error(`job failed: ${JSON.stringify(job)}`);
    if (i % 5 === 0) console.log(`  … ${job.status} (${i * 4}s)`);
  }
  throw new Error('poll timeout');
}

const job = await submit();
console.log(`job ${job.id} submitted (${outName})`);
const done = await poll(job.id);
const url = done.result?.url;
const b64 = done.result?.b64_json;
await mkdir(new URL(`../generated/rexai-scenes/${outName}`, import.meta.url).pathname, { recursive: true });
const outPath = new URL(`../generated/rexai-scenes/${outName}/${outName}.png`, import.meta.url).pathname;

if (url) {
  const img = await fetch(url);
  await writeFile(outPath, Buffer.from(await img.arrayBuffer()));
} else if (b64) {
  await writeFile(outPath, Buffer.from(b64, 'base64'));
} else {
  throw new Error('no result payload');
}
console.log(`OK ${outPath}`);
