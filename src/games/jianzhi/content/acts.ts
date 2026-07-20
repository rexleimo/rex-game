// 纸上剧场 · 幕配置:4 幕,按课程顺序映射;端午等时令主题走 commissions 委托
export interface ActCharacter {
  name: string;
  avatar: string; // 单字头像
  role: string; // 角色定位(台词条署名)
}

export interface Act {
  id: 'newyear' | 'wedding' | 'silkroad' | 'reunion';
  order: number;
  no: string; // 第一幕 …
  theme: string; // 年夜 · 窗花
  curtainHint: string; // 门帘副题
  scene: {
    art: 'newyear' | 'wedding' | 'silk' | 'reunion';
    caption: string; // 场景题字
    image?: string; // T5 场景大图生成后填入 /assets/jianzhi/scenes/*.webp
  };
  character: ActCharacter;
  lessonIds: string[];
}

export const ACTS: Act[] = [
  {
    id: 'newyear',
    order: 1,
    no: '第一幕',
    theme: '年夜 · 窗花',
    curtainHint: '对折起剪,福到窗前',
    scene: { art: 'newyear', caption: '年三十 · 窗外落雪' },
    character: { name: '奶奶', avatar: '奶', role: '第一幕向导' },
    lessonIds: ['awaken', 'symmetry'],
  },
  {
    id: 'wedding',
    order: 2,
    no: '第二幕',
    theme: '新婚 · 双喜',
    curtainHint: '纹样成句,喜上眉梢',
    scene: { art: 'wedding', caption: '喜房 · 红烛高照' },
    character: { name: '喜娘', avatar: '喜', role: '第二幕向导' },
    lessonIds: ['rebus-intro', 'window-four'],
  },
  {
    id: 'silkroad',
    order: 3,
    no: '第三幕',
    theme: '丝路 · 团花',
    curtainHint: '一折一世界,团团绽开',
    scene: { art: 'silk', caption: '灯下 · 驼铃渐远' },
    character: { name: '老艺人', avatar: '艺', role: '第三幕向导' },
    lessonIds: ['silk-rosette'],
  },
  {
    id: 'reunion',
    order: 4,
    no: '第四幕',
    theme: '福寿 · 团圆',
    curtainHint: '吉语大考,出师一剪',
    scene: { art: 'reunion', caption: '团圆夜 · 灯下围坐' },
    character: { name: '纸灵', avatar: '灵', role: '第四幕向导' },
    lessonIds: ['fu-shou', 'graduate'],
  },
];
