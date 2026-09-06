/**
 * 素材基址解析：默认走自产像素管线，检测到 override/manifest.json 即切免费包。
 * 免费包来源（CC0，需手动下载放入 override/，不入库）：
 * - Kenney Platformer Art Deluxe / Pixel Platformer（CC0）：地块/平台/水
 * - Kenney Roguelike / Tiny Town（CC0）：灯/祠/碑/拾取
 * - itch.io free（CC0/CC-BY）：主角/兽条带（需 48x64 / 88x80 切片兼容）
 */

export const PIXEL_BASE = '/assets/shanhai-wenshou/pixel/';
export const OVERRIDE_BASE = '/assets/shanhai-wenshou/override/';
export const OVERRIDE_MANIFEST = `${OVERRIDE_BASE}manifest.json`;

export interface OverrideManifest {
  pack: string;
  license: string;
  source: string;
  files: string[];
  /** 示例清单用 disabled:true 占位；为 true 时永不切换。 */
  disabled?: boolean;
}

let cached: string | null = null;

/** 清单可用：未禁用、有文件、且许可证为 CC0/CC-BY（禁 NC/ND）。 */
export function manifestUsable(m: OverrideManifest | null | undefined): boolean {
  if (!m || m.disabled) return false;
  if (!m.files || m.files.length === 0) return false;
  if (!/CC0|CC-BY/i.test(m.license ?? '')) return false;
  return true;
}

export async function resolveAssetBase(): Promise<string> {
  if (cached) return cached;
  try {
    const res = await fetch(OVERRIDE_MANIFEST, { method: 'GET', cache: 'no-store' });
    if (!res.ok) {
      cached = PIXEL_BASE;
      return cached;
    }
    const m = (await res.json()) as OverrideManifest;
    //  manifest 必须启用 + 声明 CC0/CC-BY + 文件清单非空，否则回退自产管线
    cached = manifestUsable(m) ? OVERRIDE_BASE : PIXEL_BASE;
    return cached;
  } catch {
    cached = PIXEL_BASE;
    return cached;
  }
}

/** override 整包切换（按 manifest 开关）；缺文件不断线：清单不可用即回退像素管线。 */
export function fallbackKey(primaryExists: boolean, primary: string, fallback: string): string {
  return primaryExists ? primary : fallback;
}
