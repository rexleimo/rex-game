#!/usr/bin/env node
/**
 * public/ 静态资源引用审计。
 *
 * 区分两种引用来源，因为它们的处置方式不同：
 *   - 运行时（src/、app/）：浏览器真正会请求的资源 → 必须留在 public/。
 *   - 构建期（scripts/、tests/）：生图/转码管线的输入 → 不该躺在 public/ 里被
 *     一起发到 Pages，应移出 public/（本仓库约定为 resources/）。
 *
 * 对每个来源，按三档强度判定命中：
 *   exact   —— 完整 web 路径字面量出现（/assets/yingge/cover.svg）。
 *   name    —— 文件名（含扩展名）出现，覆盖 `${root}/${kind}/idle.webp` 式前缀拼接。
 *   dynamic —— 某个 /assets/... 字面量是其路径前缀，说明它落在一个动态加载根下
 *              （如 `/assets/og/culture-${hub}-${slug}.png` 产生前缀 /assets/og/culture-）。
 *              静态分析无法解析具体文件名，故一律保留，仅计数提示。
 *
 * 输出分三桶：
 *   keep      —— 运行时命中，保留。
 *   build     —— 仅构建期命中，建议移出 public/。
 *   orphan    —— 三档全不命中，删除候选。
 *
 * 用法：
 *   node scripts/assets-audit.mjs            # 人读报告
 *   node scripts/assets-audit.mjs --json     # 机器可读
 *   node scripts/assets-audit.mjs --check    # orphan 或 build 非空则 exit 1（CI 用）
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, posix, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC_DIR = join(ROOT, 'public');
const RUNTIME_DIRS = ['src', 'app'];
const BUILD_DIRS = ['scripts', 'tests'];
const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.json', '.md', '.html']);
const SKIP_DIRS = new Set(['node_modules', '.next', 'out', '.git']);

/** 永远保留：构建/协议/部署约定，不会出现在源码字符串里。 */
const ALWAYS_KEEP = [
  /^\/CNAME$/,              // GitHub Pages 自定义域，删了站就掉
  /^\/\.nojekyll$/,
  /^\/favicon\./,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/llms\.txt$/,
  /^\/manifest\.webmanifest$/,
  /^\/apple-touch-icon/,
  /^\/fonts\//,
];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out; // 目录不存在
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function toWebPath(absPath) {
  return '/' + relative(PUBLIC_DIR, absPath).split(sep).join(posix.sep);
}

function readScope(dirNames) {
  let text = '';
  for (const dirName of dirNames) {
    for (const file of walk(join(ROOT, dirName))) {
      const ext = file.slice(file.lastIndexOf('.'));
      if (!SCAN_EXT.has(ext)) continue;
      text += readFileSync(file, 'utf8') + '\n';
    }
  }
  return { text, roots: [...text.matchAll(/\/assets\/[A-Za-z0-9._/-]+/g)].map((m) => m[0]) };
}

/**
 * 返回 'exact' | 'name' | 'dynamic' | null。
 *
 * dynamic 档要求「前缀根命中」之外再有一个佐证，否则一个浅层根字面量
 * （如 '/assets/yingge/game/characters'）会把它底下所有子目录——包括生图中间产物
 * ——全部误判为运行时资源。两种佐证任一即可：
 *   - 主文件名出现在源码中（`${root}/head-hammer/${pose}.webp` 里的 pose 列表）；
 *   - 根字面量所在目录恰好就是该文件所在目录，说明这个根就是冲着这层目录拼的
 *     （`/assets/og/culture-${hub}.png` 的根 '/assets/og/culture-' 落在 /assets/og）。
 */
function hitStrength(webPath, scope) {
  if (scope.text.includes(webPath)) return 'exact';
  const baseName = webPath.slice(webPath.lastIndexOf('/') + 1);
  if (scope.text.includes(baseName)) return 'name';

  const fileDir = webPath.slice(0, webPath.lastIndexOf('/'));
  const dotIndex = baseName.lastIndexOf('.');
  const stem = dotIndex > 0 ? baseName.slice(0, dotIndex) : baseName;
  const stemHit = stem.length >= 3 && scope.text.includes(stem);

  for (const root of scope.roots) {
    if (root === webPath || !webPath.startsWith(root)) continue;
    const rootDir = root.slice(0, root.lastIndexOf('/'));
    if (stemHit || rootDir === fileDir) return 'dynamic';
  }
  return null;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const runtime = readScope(RUNTIME_DIRS);
  const build = readScope(BUILD_DIRS);

  const buckets = { keep: [], build: [], orphan: [] };
  let totalBytes = 0;

  for (const abs of walk(PUBLIC_DIR)) {
    const webPath = toWebPath(abs);
    const size = statSync(abs).size;
    totalBytes += size;

    if (ALWAYS_KEEP.some((re) => re.test(webPath))) {
      buckets.keep.push({ path: webPath, size, via: 'allowlist' });
      continue;
    }

    const runtimeHit = hitStrength(webPath, runtime);
    if (runtimeHit) {
      buckets.keep.push({ path: webPath, size, via: `runtime:${runtimeHit}` });
      continue;
    }

    const buildHit = hitStrength(webPath, build);
    if (buildHit) buckets.build.push({ path: webPath, size, via: `build:${buildHit}` });
    else buckets.orphan.push({ path: webPath, size, via: null });
  }

  for (const list of Object.values(buckets)) list.sort((a, b) => b.size - a.size);
  const bytes = (list) => list.reduce((sum, item) => sum + item.size, 0);
  const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';

  if (args.has('--json')) {
    console.log(JSON.stringify({ totalBytes, ...buckets }, null, 2));
  } else {
    console.log(`public/ 总计 ${mb(totalBytes)}`);
    console.log(`  keep   ${String(buckets.keep.length).padStart(4)} 个  ${mb(bytes(buckets.keep))}   运行时引用，保留`);
    console.log(`  build  ${String(buckets.build.length).padStart(4)} 个  ${mb(bytes(buckets.build))}   仅构建期引用，建议移出 public/`);
    console.log(`  orphan ${String(buckets.orphan.length).padStart(4)} 个  ${mb(bytes(buckets.orphan))}   无任何引用，删除候选`);

    for (const [name, label] of [['build', '仅构建期引用（移出 public/）'], ['orphan', '无引用（删除候选）']]) {
      if (!buckets[name].length) continue;
      console.log(`\n── ${label} ──`);
      for (const item of buckets[name]) {
        console.log(`  ${(item.size / 1024).toFixed(0).padStart(7)} KB  ${item.path}`);
      }
    }

    const dynamicCount = buckets.keep.filter((item) => item.via === 'runtime:dynamic').length;
    if (dynamicCount) {
      console.log(`\n注：${dynamicCount} 个文件靠动态前缀命中保留，静态分析无法核实具体文件名。`);
    }
  }

  if (args.has('--check') && (buckets.orphan.length || buckets.build.length)) {
    console.error(`\n✗ public/ 含 ${buckets.orphan.length} 个无引用文件、${buckets.build.length} 个构建期文件。`);
    process.exit(1);
  }
}

main();
