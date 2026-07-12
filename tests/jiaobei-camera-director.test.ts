import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cameraHeight,
  computeCameraGoal,
} from '../src/games/shantou-jiaobei/physics/cameraDirector.ts';

const launchPair = [
  { x: -0.76, y: 3.2, z: -0.24 },
  { x: 0.76, y: 3.38, z: 0.24 },
];

test('launch camera is above both cups and uses a true high angle', () => {
  const goal = computeCameraGoal(launchPair, 1.6, 0);

  assert.ok(Math.abs(goal.beta - 0.62) < 0.0001);
  assert.ok(goal.beta < Math.PI / 3);
  assert.ok(cameraHeight(goal) > 3.38);
});

test('landed cups use the lower viewing angle', () => {
  const flight = computeCameraGoal(launchPair, 1.6, 0);
  const firstImpact = computeCameraGoal(launchPair, 1.6, 1);
  const landed = computeCameraGoal(launchPair, 1.6, 2);

  assert.ok(Math.abs(landed.beta - 0.84) < 0.0001);
  assert.ok(firstImpact.beta > flight.beta);
  assert.ok(firstImpact.beta < landed.beta);
});

test('camera target follows the live pair midpoint', () => {
  const initial = computeCameraGoal(launchPair, 1.6, 0);
  const shifted = computeCameraGoal(launchPair.map((position) => ({
    x: position.x + 1.4,
    y: position.y - 0.8,
    z: position.z + 0.6,
  })), 1.6, 0);

  assert.ok(Math.abs((shifted.target.x - initial.target.x) - 1.4) < 0.0001);
  assert.ok(Math.abs((shifted.target.z - initial.target.z) - 0.6) < 0.0001);
  assert.ok(shifted.target.y < initial.target.y);
});

test('the shot widens as the cups spread apart', () => {
  const compact = computeCameraGoal([
    { x: -0.3, y: 1.2, z: 0 },
    { x: 0.3, y: 1.2, z: 0 },
  ], 1.6, 0);
  const spread = computeCameraGoal([
    { x: -2.1, y: 1.2, z: -0.5 },
    { x: 2.1, y: 1.2, z: 0.5 },
  ], 1.6, 0);

  assert.ok(spread.radius > compact.radius);
});

test('narrow viewports widen the shot and preserve right-side safety space', () => {
  const desktop = computeCameraGoal(launchPair, 1.6, 0);
  const mobile = computeCameraGoal(launchPair, 0.98, 0);

  assert.ok(mobile.radius > desktop.radius);
  assert.ok(mobile.target.x > desktop.target.x);
  assert.ok(desktop.target.x > 0);
});
