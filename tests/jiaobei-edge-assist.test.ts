import assert from 'node:assert/strict';
import test from 'node:test';
import { Vector3 } from '@babylonjs/core';
import {
  createEdgeAssistImpulse,
  measureEdgeRoll,
  NEGATIVE_FACE_EDGE_IMPULSE,
  POSITIVE_FACE_EDGE_IMPULSE,
} from '../src/games/shantou-jiaobei/physics/edgeAssist.ts';

test('the edge axis is face normal cross world up and remains finite', () => {
  const measurement = measureEdgeRoll(
    new Vector3(0, 0, 1),
    new Vector3(2, 0, 0),
  );

  assert.ok(measurement);
  assert.deepEqual(measurement.axis.asArray(), [-1, 0, 0]);
  assert.equal(measurement.rollSpeed, -2);
});

test('recent roll direction is preserved and selects the destination magnitude', () => {
  const positive = createEdgeAssistImpulse({
    faceNormalWorld: new Vector3(0, 0, 1),
    upDot: -0.1,
    angularVelocityWorld: new Vector3(-0.2, 0, 0),
    lastRollSign: 1,
    fallbackSign: -1,
  });
  assert.ok(positive);
  assert.equal(positive.rollSign, 1);
  assert.equal(positive.magnitude, POSITIVE_FACE_EDGE_IMPULSE);

  const negative = createEdgeAssistImpulse({
    faceNormalWorld: new Vector3(0, 0, 1),
    upDot: 0.1,
    angularVelocityWorld: Vector3.Zero(),
    lastRollSign: -1,
    fallbackSign: 1,
  });
  assert.ok(negative);
  assert.equal(negative.rollSign, -1);
  assert.equal(negative.magnitude, NEGATIVE_FACE_EDGE_IMPULSE);
});

test('up dot chooses the nearest face before the random fallback', () => {
  const towardPositive = createEdgeAssistImpulse({
    faceNormalWorld: new Vector3(0, 0, 1),
    upDot: 0.2,
    angularVelocityWorld: Vector3.Zero(),
    lastRollSign: 0,
    fallbackSign: -1,
  });
  assert.equal(towardPositive?.rollSign, 1);

  const neutral = createEdgeAssistImpulse({
    faceNormalWorld: new Vector3(0, 0, 1),
    upDot: 0,
    angularVelocityWorld: Vector3.Zero(),
    lastRollSign: 0,
    fallbackSign: -1,
  });
  assert.equal(neutral?.rollSign, -1);
});

test('parallel and non-finite normals produce no impulse', () => {
  assert.equal(createEdgeAssistImpulse({
    faceNormalWorld: Vector3.Up(),
    upDot: 1,
    angularVelocityWorld: Vector3.Zero(),
    lastRollSign: 0,
    fallbackSign: 1,
  }), null);
  assert.equal(createEdgeAssistImpulse({
    faceNormalWorld: new Vector3(Number.NaN, 0, 1),
    upDot: 0,
    angularVelocityWorld: Vector3.Zero(),
    lastRollSign: 0,
    fallbackSign: 1,
  }), null);
});
