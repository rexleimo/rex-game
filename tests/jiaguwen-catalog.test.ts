import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CURRICULUM_GLYPH_COUNT, GLYPHS } from '../src/games/jiaguwen/content/glyphs.ts';
import {
  ORACLE_CATALOG_FORMS,
  ORACLE_CATALOG_FORM_COUNT,
  ORACLE_CATALOG_HEAD_COUNT,
  ORACLE_SOURCES,
} from '../src/games/jiaguwen/content/oracleCatalog.ts';
import { REFERENCE_HEADWORD_BY_FORM_ID, REFERENCE_HEADWORDS } from '../src/games/jiaguwen/content/oracleCorpus.ts';
import { buildReferenceItems } from '../src/games/jiaguwen/core/referenceRound.ts';

describe('oracle-bone catalog', () => {
  it('keeps the teaching deck separate from the large public reference index', () => {
    assert.equal(CURRICULUM_GLYPH_COUNT, GLYPHS.length);
    assert.ok(CURRICULUM_GLYPH_COUNT >= 60, '教学字表不应退回到 MVP 规模');
    assert.ok(ORACLE_CATALOG_FORM_COUNT >= 1000, '公开字形索引应提供千字级样本');
    assert.ok(ORACLE_CATALOG_HEAD_COUNT >= 700, '公开字形索引应保留足够的上游释读字头');
  });

  it('gives every public form a stable id, local asset path, and source id', () => {
    assert.equal(ORACLE_CATALOG_FORMS.length, ORACLE_CATALOG_FORM_COUNT);
    assert.equal(new Set(ORACLE_CATALOG_FORMS.map((form) => form.id)).size, ORACLE_CATALOG_FORM_COUNT);
    for (const form of ORACLE_CATALOG_FORMS) {
      assert.match(form.image, /^\/glyphs\/corpus\/.+\.jpg$/);
      assert.ok(form.modern.length > 0);
      assert.ok(ORACLE_SOURCES.some((source) => source.id === form.sourceId));
    }
  });

  it('models headwords separately from their glyph-form variants', () => {
    assert.equal(REFERENCE_HEADWORDS.length, ORACLE_CATALOG_HEAD_COUNT);
    assert.ok(REFERENCE_HEADWORDS.every((headword) => !headword.gameSafe));
    for (const form of ORACLE_CATALOG_FORMS) {
      const headword = REFERENCE_HEADWORD_BY_FORM_ID.get(form.id);
      assert.equal(headword?.modern, form.modern);
      assert.ok(headword?.formIds.includes(form.id));
      assert.equal(form.formType, 'reference-glyph');
      assert.ok(form.sourceRecordUrl?.startsWith('https://'));
      assert.ok(form.retrievedAt);
    }
  });

  it('samples one variant per headword for each reference round', () => {
    const items = buildReferenceItems(ORACLE_CATALOG_FORMS, 12);
    assert.equal(items.length, 12);
    assert.equal(new Set(items.map((item) => item.form.modern)).size, items.length);
    assert.ok(items.every((item) => item.options[item.answer] === item.form.modern));
  });

  it('does not promote a browse-only source into the game curriculum', () => {
    const publicSource = ORACLE_SOURCES.find((source) => source.id === 'jgw-open');
    assert.equal(publicSource?.role, 'reference');
    assert.ok(!GLYPHS.some((glyph) => glyph.id.startsWith('jgw-')));
  });
});
