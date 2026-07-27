import type { OracleSource } from '../core/types.ts';
import { OPEN_ORACLE_CATALOG, OPEN_ORACLE_CATALOG_HEAD_COUNT } from './oracleCatalog.generated.ts';

/**
 * Source registry for the public reference corpus.
 *
 * Reference forms deliberately stay separate from the reviewed teaching deck:
 * an upstream character label is useful for browsing but is not enough evidence
 * to generate an explanation, a quiz answer, or a reconstructed SVG.
 */
export const ORACLE_SOURCES: OracleSource[] = [
  {
    id: 'curriculum',
    name: '甲骨问契教学字表',
    url: '/culture/jiagu/',
    license: 'Project-authored teaching metadata',
    role: 'curriculum',
    note: '已人工编写释义、象形提示与教学题目；字形图为教学示意，不作摹本或释文证据。',
  },
  {
    id: 'xiaoxue',
    name: '小學堂・漢字古今字資料庫',
    url: 'https://xiaoxue.iis.sinica.edu.tw/',
    license: 'CC0 1.0 Universal（官网查询字形图片与字形属性声明）',
    role: 'reference',
    note: '中研院与台大共同开发；官网查询接口返回认证限制，正式导入须保留查询记录、来源索引和取得日期。',
  },
  {
    id: 'jgw-open',
    name: 'Chinese-Traditional-Culture/JiaGuWen',
    url: 'https://github.com/Chinese-Traditional-Culture/JiaGuWen',
    license: 'MIT（上游 README 声明）',
    role: 'reference',
    note: '1602 个公开图像样本、793 个上游释读字头；仅供检索与比看，不自动生成字义、断代或卜辞。',
  },
];

export const ORACLE_CATALOG_FORMS = OPEN_ORACLE_CATALOG;
export const ORACLE_CATALOG_FORM_COUNT = ORACLE_CATALOG_FORMS.length;
export const ORACLE_CATALOG_HEAD_COUNT = OPEN_ORACLE_CATALOG_HEAD_COUNT;
