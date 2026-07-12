import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const homeSource = readFileSync(new URL(
  '../app/page.tsx',
  import.meta.url,
), 'utf8');
const resultSource = readFileSync(new URL(
  '../src/games/shantou-jiaobei/scenes/ResultScene.tsx',
  import.meta.url,
), 'utf8');
const introSource = readFileSync(new URL(
  '../src/games/shantou-jiaobei/scenes/IntroScene.tsx',
  import.meta.url,
), 'utf8');
const heroAsset = new URL('../public/assets/jiaobei-hero.png', import.meta.url);

const cameraPanelSource = readFileSync(new URL(
  '../src/games/shantou-jiaobei/vision/CameraPosePanel.tsx',
  import.meta.url,
), 'utf8');
const offeringSource = readFileSync(new URL(
  '../src/games/shantou-jiaobei/scenes/OfferingScene.tsx',
  import.meta.url,
), 'utf8');

function findMatchingDivEnd(source: string, openingIndex: number): number {
  const divTag = /<\/?div\b[^>]*>/g;
  divTag.lastIndex = openingIndex;
  let depth = 0;

  for (const match of source.matchAll(divTag)) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return match.index + match[0].length;
  }

  throw new Error('Expected a closing div for the 3D stage');
}

test('the camera preview shows the complete source frame', () => {
  assert.match(cameraPanelSource, /object-fit:\s*contain/);
});

test('the compact mobile preview flows below the 3D stage instead of covering it', () => {
  const stageStart = offeringSource.indexOf('<div className="offering__stage">');
  const cameraStart = offeringSource.indexOf('<div className="offering__cam">');
  assert.ok(stageStart >= 0);
  assert.ok(cameraStart >= 0);
  assert.ok(cameraStart > findMatchingDivEnd(offeringSource, stageStart));

  const mediaStart = offeringSource.indexOf('@media (max-width: 480px)');
  assert.ok(mediaStart >= 0);
  const mobileRule = offeringSource.slice(mediaStart, mediaStart + 320);

  assert.match(mobileRule, /\.offering__cam\s*\{[^}]*position:\s*static/);
});

test('manual throwing stays disabled until the physics controller is ready', () => {
  const initializeAt = offeringSource.indexOf('await thrower.initialize()');
  const readyAt = offeringSource.indexOf('setPhysicsReady(true)');
  assert.ok(initializeAt >= 0);
  assert.ok(readyAt > initializeAt);
  assert.match(
    offeringSource,
    /disabled=\{throwing \|\| physicsError \|\| !physicsReady\}/,
  );
});

test('gesture throwing also waits for a ready physics controller', () => {
  assert.match(
    offeringSource,
    /const poseEnabled = physicsReady && !physicsError && !throwing && !done;/,
  );
});

test('the ready stage gives the player a clear idle cue before the first throw', () => {
  assert.match(offeringSource, /筊杯已备/);
});

test('the home exhibition uses a still from the rendered jiaobei scene', () => {
  assert.ok(existsSync(heroAsset), 'the home needs the actual rendered jiaobei hero still');
  assert.match(homeSource, /src="\/assets\/jiaobei-hero\.png"/);
  assert.match(homeSource, /潮汕圣杯，一掷见心/);
  assert.doesNotMatch(homeSource, /GameCard/);
});

test('the result view reveals its interpretation without adding a game phase', () => {
  assert.match(resultSource, /const \[expanded, setExpanded\] = useState\(false\)/);
  assert.match(resultSource, /window\.setTimeout\(\(\) => setExpanded\(true\), 1200\)/);
  assert.match(resultSource, /onClick=\{\(\) => setExpanded\(true\)\}/);
  assert.match(resultSource, /const RESULT_TITLE/);
  assert.match(resultSource, /RESULT_TITLE\[v\.key\]/);
});

test('cup result symbols use the game-consistent vector glyph instead of opaque legacy art', () => {
  assert.match(resultSource, /CupResultGlyph/);
  assert.match(introSource, /CupResultGlyph/);
  assert.match(offeringSource, /CupResultGlyph/);
  assert.doesNotMatch(resultSource, /cup_(sheng|xiao|yin)\.png/);
  assert.doesNotMatch(introSource, /cup_(sheng|xiao|yin)\.png/);
  assert.doesNotMatch(offeringSource, /cup_(sheng|xiao|yin)\.png/);
});
