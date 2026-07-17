import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { createJiaobeiVisual } from '../src/games/shantou-jiaobei/physics/JiaobeiMesh.ts';
import { createThrowSetup } from '../src/games/shantou-jiaobei/physics/throwSetup.ts';

test('procedural jiaobei has a curved lacquer crown and an open crescent silhouette', () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const mesh = createJiaobeiVisual(scene, 0);
  const positions = mesh.getVerticesData('position');

  assert.ok(positions && positions.length > 600, 'the cup needs a detailed crescent silhouette');
  const centerlineZ: number[] = [];
  let highestY = -Infinity;
  let lowestX = Infinity;
  let highestX = -Infinity;
  let lowestZ = Infinity;
  let highestZ = -Infinity;
  for (let index = 0; index < positions.length; index += 3) {
    const x = positions[index];
    const y = positions[index + 1];
    const z = positions[index + 2];
    if (Math.abs(x) < 0.0001) centerlineZ.push(z);
    highestY = Math.max(highestY, y);
    lowestX = Math.min(lowestX, x);
    highestX = Math.max(highestX, x);
    lowestZ = Math.min(lowestZ, z);
    highestZ = Math.max(highestZ, z);
  }
  assert.ok(highestX - lowestX > 3.1, 'the cup needs a long blade profile');
  assert.ok(highestZ - lowestZ > 0.75, 'the blade needs a clearly curved centerline');
  assert.ok(
    Math.min(...centerlineZ) > 0.5,
    'the inner arc must leave an open crescent instead of filling a half-disc',
  );
  assert.equal(mesh.material?.name, 'jiaobei_materials_0');
  assert.equal(mesh.metadata.convexLocalNormal.y, 1);
  assert.equal(mesh.metadata.silhouette, 'crescent');
  assert.ok(highestY > 0.35, 'the cup needs a visible convex crown');

  mesh.dispose();
  scene.dispose();
  engine.dispose();
});

test('the visual silhouette tapers to blade tips instead of ending as a thick crescent block', () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const mesh = createJiaobeiVisual(scene, 0);
  const positions = mesh.getVerticesData('position');

  assert.ok(positions, 'the cup needs vertex positions');
  const rowSize = 9;
  const lastRowStart = 48 * rowSize * 3;
  const point = (offset: number) => [
    positions[offset],
    positions[offset + 1],
    positions[offset + 2],
  ];
  const distance = (left: number[], right: number[]) => Math.hypot(
    left[0] - right[0],
    left[1] - right[1],
    left[2] - right[2],
  );
  const firstTipWidth = distance(point(0), point((rowSize - 1) * 3));
  const lastTipWidth = distance(
    point(lastRowStart),
    point(lastRowStart + (rowSize - 1) * 3),
  );
  const xs = positions.filter((_, index) => index % 3 === 0);
  const zs = positions.filter((_, index) => index % 3 === 2);
  const aspect = (Math.max(...xs) - Math.min(...xs)) / (Math.max(...zs) - Math.min(...zs));

  assert.ok(firstTipWidth < 0.08, 'the heel must taper instead of exposing a broad end cap');
  assert.ok(lastTipWidth < 0.08, 'the forward end must finish as a sharp blade tip');
  assert.ok(aspect > 2.15, 'the silhouette must read as a long curved blade');
  assert.equal(mesh.metadata.profile, 'curved-blade');

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
  const lacquerEnd = mesh.subMeshes[0].verticesStart + mesh.subMeshes[0].verticesCount;

  assert.ok(positions && normals, 'the cup needs positions and normals');
  const crownNormals: number[] = [];
  const baseNormals: number[] = [];
  for (let vertex = 0; vertex < positions.length / 3; vertex++) {
    const offset = vertex * 3;
    const y = positions[offset + 1];
    if (vertex < lacquerEnd && y > 0.2) crownNormals.push(normals[offset + 1]);
    if (vertex >= mesh.metadata.baseVertexStart && y === 0) baseNormals.push(normals[offset + 1]);
  }
  assert.ok(crownNormals.length > 100, 'the crown needs enough smooth vertices');
  assert.ok(baseNormals.length > 100, 'the base needs enough flat vertices');
  assert.ok(crownNormals.every((normal) => normal > 0.6), 'crown normals must face upward');
  assert.ok(baseNormals.every((normal) => normal < -0.99), 'base normals must face downward');

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
