/**
 * rex-game 站点级设计 token —— 潮汕金漆木雕 / 漆器描金 · 非遗高级感。
 * 漆底、金箔描线、朱砂，宋体展示字。权威值见 src/styles/globals.css 的 CSS 变量。
 * 各游戏可引用并扩展自己的色板。
 */
export const theme = {
  color: {
    // 主色：祭红 / 朱砂
    primary: '#A6332B',
    primaryDark: '#872520',
    // 木色 / 金箔
    wood: '#7A5230',
    gold: '#C9A24B', // 古铜金箔
    goldBright: '#E4C479', // 漆底上的描线 / 文字
    // 背景（漆黑褐）
    bg: '#17100B',
    bgSoft: '#23160F',
    surface: '#F4ECD8', // 宣纸米
    surface2: '#ECE0C6',
    // 文本
    text: '#2A1B12', // 墨褐（近黑）
    textSoft: '#6E5A46',
    textFaint: '#8A7358',
    textInvert: '#F4ECD8',
    // 杯象三色（克制、和谐）
    sheng: '#5F8A64', // 圣杯 · 竹青
    xiao: '#B8863A', // 笑杯 · 赭黄
    yin: '#455F79', // 阴杯 · 黛蓝
  },
  border: {
    // 金箔发丝描边取代粗描边
    lineGold: 'rgba(201, 162, 75, 0.55)',
    lineGoldStrong: 'rgba(201, 162, 75, 0.92)',
    lineInk: 'rgba(42, 27, 18, 0.14)',
    radius: '14px',
    radiusSm: '9px',
  },
  shadow: {
    // 柔和着色投影（取漆底色调，非纯黑）
    soft: '0 8px 24px -12px rgba(17, 10, 6, 0.55), 0 2px 6px -3px rgba(17, 10, 6, 0.5)',
    panel: '0 30px 70px -28px rgba(0, 0, 0, 0.62), 0 4px 14px -8px rgba(0, 0, 0, 0.5)',
  },
  foil: 'linear-gradient(135deg, #f2dc9a 0%, #d8b25a 34%, #b98a2f 62%, #ecca7c 100%)',
  font: {
    display: '"Noto Serif SC", "Songti SC", "STSong", serif',
    body: '"Noto Sans SC", system-ui, sans-serif',
  },
} as const;

export type Theme = typeof theme;
