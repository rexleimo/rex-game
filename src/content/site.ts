export const SITE_ORIGIN = 'https://game.rexai.top';

export const SITE_DISCLAIMER =
  '本站为文化展示与互动娱乐，不构成宗教、医疗、法律、财务或人生决策建议。地方称法、礼序与判读可能不同，请以当地传统为准。';

export const SITE_NAV = [
  { href: '/#exhibits', label: '展品' },
  { href: '/culture/', label: '文化馆' },
  { href: '/about/', label: '关于' },
] as const;

export const TRUST_METRICS = [
  { value: '4', label: '可玩文化展品' },
  { value: '0', label: '下载安装' },
  { value: '本地', label: '进度保存' },
  { value: '免费', label: '即开即玩' },
] as const;
