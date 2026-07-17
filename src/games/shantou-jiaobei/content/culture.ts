import type { CupResult } from '../JiaobeiGame';

export type JiaobeiSign = {
  result: CupResult;
  name: string;
  faces: string;
  meaning: string;
  roundedFaceCount: number;
  flatFaceCount: number;
};

export const JIAOBEI_SIGNS: readonly JiaobeiSign[] = [
  { result: 'sheng', name: '圣杯', faces: '一平一凸', meaning: '常见解释为允准与肯定', roundedFaceCount: 1, flatFaceCount: 1 },
  { result: 'yin', name: '阴杯', faces: '两面皆凸', meaning: '常见解释为否定或时机未到', roundedFaceCount: 2, flatFaceCount: 0 },
  { result: 'xiao', name: '笑杯', faces: '两面皆平', meaning: '常见解释为问题未明或带有笑意', roundedFaceCount: 0, flatFaceCount: 2 },
];

export const JIAOBEI_QUICK_ANSWER = '潮汕民间常把掷筊称为“跋杯”或“掷杯”。一对筊杯各有红漆凸面与木质平面；两杯落地后，一平一凸、双凸、双平分别形成圣杯、阴杯与笑杯。不同庙宇、地区和家庭的称法与礼序可能不同，本页仅作文化互动展示。';
