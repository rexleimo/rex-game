// 从站点源码提取用字 → scripts/font-charset.txt(供 pyftsubset --text-file)
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const files = execSync(
  "git ls-files 'app/*.ts' 'app/*.tsx' 'src/*.ts' 'src/*.tsx' 'public/manifest.json'",
  { encoding: 'utf8' },
)
  .trim()
  .split('\n');

const chars = new Set();
for (let i = 0x20; i <= 0x7e; i += 1) chars.add(String.fromCharCode(i)); // ASCII 可见字符
for (const c of '　、。,「」『』《》〈〉【】…—～·:;!?()[]{}%#@&*+-/=→←↑↓〇壹贰叁肆伍陆柒捌玖') {
  chars.add(c);
}

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const c of text) {
    if ((c.codePointAt(0) ?? 0) > 0x2000) chars.add(c); // CJK 与全角符号
  }
}

writeFileSync('scripts/font-charset.txt', [...chars].join(''));
console.log(`charset: ${chars.size} chars -> scripts/font-charset.txt`);
