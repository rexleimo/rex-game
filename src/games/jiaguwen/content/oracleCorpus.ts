import type { OracleHeadword } from '../core/types.ts';
import { GLYPHS } from './glyphs.ts';
import { ORACLE_CATALOG_FORMS } from './oracleCatalog.ts';

function groupReferenceHeadwords(): OracleHeadword[] {
  const formsByLabel = new Map<string, string[]>();
  for (const form of ORACLE_CATALOG_FORMS) {
    const formIds = formsByLabel.get(form.modern) ?? [];
    formIds.push(form.id);
    formsByLabel.set(form.modern, formIds);
  }

  return [...formsByLabel.entries()].map(([modern, formIds], index) => ({
    id: `jgw-head-${index + 1}`,
    modern,
    readingStatus: 'source-label',
    confidence: 'unreviewed',
    formIds,
    gameSafe: false,
  }));
}

export const REFERENCE_HEADWORDS = groupReferenceHeadwords();

export const TEACHING_HEADWORDS: OracleHeadword[] = GLYPHS.map((glyph) => ({
  id: `course-${glyph.id}`,
  modern: glyph.modern,
  readingStatus: 'editorial-game-label',
  confidence: glyph.tier === 1 ? 'high' : 'medium',
  formIds: [glyph.id],
  gameSafe: true,
}));

export const REFERENCE_HEADWORD_BY_FORM_ID = new Map(
  REFERENCE_HEADWORDS.flatMap((headword) => headword.formIds.map((formId) => [formId, headword] as const)),
);
