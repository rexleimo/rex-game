import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { createJiaobeiVisual } from '../src/games/shantou-jiaobei/physics/JiaobeiMesh.ts';
import { createThrowSetup } from '../src/games/shantou-jiaobei/physics/throwSetup.ts';

test('procedural jiaobei has a curved lacquer face and a flat wooden base', () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const mesh = createJiaobeiVisual(scene, 0);
  const positions = mesh.getVerticesData('position');

  assert.ok(positions && positions.length > 100, 'the cup needs a detailed silhouette');
  assert.ok(
    positions.every((_, index) => index % 3 !== 2 || positions[index] >= -0.0001),
    'the cup outline must remain a half-moon instead of a full oval',
  );
  let highestY = -Infinity;
  for (let index = 1; index < positions.length; index += 3) highestY = Math.max(highestY, positions[index]);
  let plateauVertices = 0;
  for (let index = 1; index < positions.length; index += 3) {
    if (positions[index] >= highestY - 0.0001) plateauVertices++;
  }
  assert.ok(plateauVertices > 16, 'the curved face needs a subtle stable landing patch');
  assert.equal(mesh.material?.name, 'jiaobei_materials_0');
  assert.equal(mesh.metadata.convexLocalNormal.y, 1);
  assert.ok(mesh.getBoundingInfo().boundingBox.extendSize.y > 0.15, 'the cup needs a visible convex face');

  mesh.dispose();
  scene.dispose();
  engine.dispose();
});

test('material submeshes cover every triangle exactly once', () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const mesh = createJiaobeiVisual(scene, 0);
  const indices = mesh.getIndices();
  const subMeshes = [...mesh.subMeshes].sort((left, right) => (
    left.indexStart - right.indexStart
  ));

  assert.ok(indices, 'the cup needs an index buffer');
  assert.equal(subMeshes.length, 2);
  assert.deepEqual(subMeshes.map((subMesh) => subMesh.materialIndex), [0, 1]);
  assert.equal(subMeshes[0].indexStart, 0);
  assert.equal(subMeshes[0].indexCount, subMeshes[1].indexStart);
  assert.equal(
    subMeshes[0].indexCount + subMeshes[1].indexCount,
    indices.length,
  );

  mesh.dispose();
  scene.dispose();
  engine.dispose();
});

test('render-facing normals point outward on both cup faces', () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const mesh = createJiaobeiVisual(scene, 0);
  const positions = mesh.getVerticesData('position');
  const normals = mesh.getVerticesData('normal');

  assert.ok(positions && normals, 'the cup needs positions and normals');
  let bottomCenter = -1;
  let chordCenter = -1;
  for (let vertex = 0; vertex < positions.length / 3; vertex++) {
    const offset = vertex * 3;
    if (
      positions[offset] === 0
      && positions[offset + 1] === 0
      && positions[offset + 2] === 0
    ) bottomCenter = vertex;
    if (
      positions[offset] === 0
      && positions[offset + 1] === 0.54
      && positions[offset + 2] === 0
    ) chordCenter = vertex;
  }

  assert.ok(bottomCenter > 0, 'the wooden base needs a center vertex');
  assert.ok(chordCenter > 0, 'the straight side needs a center vertex');
  assert.ok(normals[1] > 0.99, 'the lacquer dome normal must point away from the solid');
  assert.ok(
    normals[bottomCenter * 3 + 1] < -0.99,
    'the wooden base normal must point away from the solid',
  );
  assert.ok(
    normals[chordCenter * 3 + 2] < -0.99,
    'the straight side normal must point away from the solid',
  );

  mesh.dispose();
  scene.dispose();
  engine.dispose();
});

test('two cups start and travel apart so every cup result remains visible', () => {
  const left = createThrowSetup(0, () => 0.5);
  const right = createThrowSetup(1, () => 0.5);
  const dx = right.position.x - left.position.x;
  const dz = right.position.z - left.position.z;

  assert.ok(Math.hypot(dx, dz) > 1.4, 'the pair needs a readable starting separation');
  assert.ok(left.velocity.x < 0 && right.velocity.x > 0, 'the pair needs outward momentum');
});

test('a cup is placed at its launch transform before its physics body is created', () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const setup = createThrowSetup(0, () => 0.5);
  const mesh = createJiaobeiVisual(scene, 0, setup);

  assert.equal(mesh.position.x, setup.position.x);
  assert.equal(mesh.position.y, setup.position.y);
  assert.equal(mesh.position.z, setup.position.z);
  assert.ok(mesh.rotationQuaternion, 'the initial rotation must exist before physics creation');

  mesh.dispose();
  scene.dispose();
  engine.dispose();
});

test('jiaobei physics source contains no invisible stabilizer geometry', () => {
  const source = readFileSync(new URL(
    '../src/games/shantou-jiaobei/physics/JiaobeiMesh.ts',
    import.meta.url,
  ), 'utf8');

  assert.doesNotMatch(
    source,
    /PhysicsShapeCapsule|PhysicsShapeContainer|COLLISION_CHORD_INSET/,
  );
  assert.doesNotMatch(source, /setMassProperties/);
});
