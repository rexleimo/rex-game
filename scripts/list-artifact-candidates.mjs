import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dir = 'src/games/shanhai-shiyi/content';
const files = readdirSync(dir).filter((f) => f.startsWith('artifacts') && f.endsWith('.ts'));
const existing = new Set([
  'A-R01-SR-001',
  'A-R01-SR-004',
  'A-R02-SR-001',
  'A-R02-R-002',
  'A-R03-SR-001',
  'A-R03-SR-002',
  'A-R04-SR-001',
  'A-R04-SR-004',
  'A-R05-SR-001',
  'A-R06-SR-001',
  'A-R07-R-003',
  'A-R08-SR-001',
]);

const cards = [];
for (const f of files) {
  const t = readFileSync(join(dir, f), 'utf8');
  const blocks = t.split(/\{\s*\n\s*id:/);
  for (const b of blocks.slice(1)) {
    const id = b.match(/^\s*'([^']+)'/)?.[1];
    const name = b.match(/name:\s*'([^']+)'/)?.[1];
    const rarity = b.match(/rarity:\s*'([^']+)'/)?.[1];
    const one = b.match(/oneLiner:\s*'([^']+)'/)?.[1];
    const types = b.match(/types:\s*\[([^\]]+)\]/)?.[1] || '';
    if (id && name) cards.push({ id, name, rarity, one, types, file: f });
  }
}

function isConcept(c) {
  if (/小谱|知一张|名录|通识/.test(c.name)) return true;
  if (c.types.includes('concept')) return true;
  return false;
}

const candidates = cards.filter(
  (c) => !existing.has(c.id) && !isConcept(c) && (c.rarity === 'SR' || c.rarity === 'R'),
);

console.log('total', cards.length, 'candidates', candidates.length);
for (const c of candidates) {
  console.log([c.rarity, c.id, c.name, (c.one || '').slice(0, 48)].join('\t'));
}
