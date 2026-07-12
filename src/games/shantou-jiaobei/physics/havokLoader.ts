/**
 * Havok 物理 WASM 加载（运行时脚本注入版）。
 *
 * 为什么不用 `import HavokPhysics from '@babylonjs/havok'`：
 *   该包 ESM 入口是 emscripten 自执行模块，经 webpack 打包后在浏览器里
 *   常因 `import.meta.url` / WASM instantiation 抛错，导致整个物理 chunk 加载失败。
 *
 * 本方案：运行时用 <script> 注入 UMD（不经过 webpack），UMD 会注册
 *   self.HavokPhysics 工厂函数；再调用它拿到 HavokPhysics 实例。
 *   WASM 文件经 locateFile 指向 public/wasm/。
 *
 * 浏览器 API，仅在客户端调用。
 */

const UMD_URL = '/wasm/HavokPhysics_umd.js';
const WASM_URL = '/wasm/HavokPhysics.wasm';

let havokPromise: Promise<any> | null = null;

/** 返回一个绝对/相对基准路径，保证从子路由也能取到 wasm */
function wasmBase(): string {
  // 用站点根的绝对路径；dev 与 Gitee Pages 根部署都适用。
  // 若将来部署到子路径，改这里为对应前缀即可。
  return '';
}

export function loadHavok(): Promise<any> {
  if (havokPromise) return havokPromise;
  havokPromise = (async () => {
    const base = wasmBase();
    // 1) 注入 UMD 脚本（若已注入则复用）
    await injectScriptOnce(`${base}${UMD_URL}`);
    const factory = (self as any).HavokPhysics;
    if (typeof factory !== 'function') {
      throw new Error('HavokPhysics UMD 未正确注册');
    }
    // 2) 实例化，wasm 经 locateFile 解析
    return factory({ locateFile: () => `${base}${WASM_URL}` });
  })().catch((e) => {
    // 失败则清空缓存，允许下次重试
    havokPromise = null;
    throw e;
  });
  return havokPromise;
}

function injectScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = `havok-script`;
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === '1') resolve();
      else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('HavokPhysics 脚本加载失败')));
      }
      return;
    }
    const s = document.createElement('script');
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = '1';
      resolve();
    };
    s.onerror = () => reject(new Error(`无法加载 ${src}`));
    document.head.appendChild(s);
  });
}
