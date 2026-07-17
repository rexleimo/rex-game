import {
  Color3,
  Mesh,
  MultiMaterial,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsShapeType,
  Quaternion,
  RawTexture,
  Scene,
  Texture,
  SubMesh,
  Vector3,
  VertexData,
} from '@babylonjs/core';

const SEGMENTS = 48;
const CROSS_SEGMENTS = 8;
const BASE_THICKNESS = 0.11;
const DOME_HEIGHT = 0.28;

// A scimitar-like centerline with a tapered cross section. Unlike two offset
// circles, both edges meet at the ends, so the silhouette reads as a blade.
const BLADE_HALF_LENGTH = 1.62;
const BLADE_CURVE = 0.68;
const BLADE_HALF_WIDTH = 0.36;

export interface JiaobeiInitialPose {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

type Point = { x: number; z: number };

function arcPoint(step: number, inner: boolean): Point {
  const progress = step / SEGMENTS;
  const t = -1 + 2 * progress;
  const centerX = BLADE_HALF_LENGTH * t;
  const centerZ = 0.18 + BLADE_CURVE * (1 - t * t);
  const tangentX = 2 * BLADE_HALF_LENGTH;
  const tangentZ = -4 * BLADE_CURVE * t;
  const tangentLength = Math.hypot(tangentX, tangentZ);
  const normalX = -tangentZ / tangentLength;
  const normalZ = tangentX / tangentLength;
  const taper = 0.018 + 0.982 * Math.pow(Math.sin(Math.PI * progress), 0.72);
  const width = BLADE_HALF_WIDTH * taper * (1.04 - 0.08 * progress);
  const side = inner ? -1 : 1;
  return {
    x: centerX + normalX * width * side,
    z: centerZ + normalZ * width * side,
  };
}

function interpolatePoint(step: number, crossStep: number): Point {
  const outer = arcPoint(step, false);
  const inner = arcPoint(step, true);
  const t = crossStep / CROSS_SEGMENTS;
  return {
    x: outer.x + (inner.x - outer.x) * t,
    z: outer.z + (inner.z - outer.z) * t,
  };
}

function domeY(step: number, crossStep: number): number {
  const progress = step / SEGMENTS;
  const across = Math.sin((crossStep / CROSS_SEGMENTS) * Math.PI);
  const along = Math.sin(Math.PI * progress);
  const crown = Math.pow(Math.max(0, across), 0.72) * (0.82 + 0.18 * along);
  const tipThickness = 0.08 + 0.92 * Math.pow(Math.max(0, along), 0.55);
  const softened = crown > 0.93 ? 0.93 : crown;
  return (BASE_THICKNESS + DOME_HEIGHT * softened) * tipThickness;
}

/** Create one blood-red crescent jiaobei with a lacquer crown and flat base. */
export function createJiaobeiVisual(
  scene: Scene,
  index: number,
  initialPose?: JiaobeiInitialPose,
): Mesh {
  const mesh = new Mesh(`jiaobei_visual_${index}`, scene);
  const positions: number[] = [];
  const lacquerIndices: number[] = [];
  const woodIndices: number[] = [];

  const pushVertex = (x: number, y: number, z: number) => {
    positions.push(x, y, z);
    return positions.length / 3 - 1;
  };
  const pushQuad = (
    target: number[],
    a: number,
    b: number,
    c: number,
    d: number,
    flip = false,
  ) => {
    if (flip) target.push(a, c, b, a, d, c);
    else target.push(a, b, c, a, c, d);
  };

  // Crown: a gridded strip between the outer and inner arcs. Vertices are kept
  // separate from the walls so the polished face retains smooth normals.
  const crown: number[][] = [];
  for (let step = 0; step <= SEGMENTS; step++) {
    const row: number[] = [];
    for (let cross = 0; cross <= CROSS_SEGMENTS; cross++) {
      const point = interpolatePoint(step, cross);
      row.push(pushVertex(point.x, domeY(step, cross), point.z));
    }
    crown.push(row);
  }
  for (let step = 0; step < SEGMENTS; step++) {
    for (let cross = 0; cross < CROSS_SEGMENTS; cross++) {
      pushQuad(
        lacquerIndices,
        crown[step][cross],
        crown[step + 1][cross],
        crown[step + 1][cross + 1],
        crown[step][cross + 1],
        true,
      );
    }
  }

  // Outer and inner lacquer walls.
  for (const inner of [false, true]) {
    const top: number[] = [];
    const bottom: number[] = [];
    const cross = inner ? CROSS_SEGMENTS : 0;
    for (let step = 0; step <= SEGMENTS; step++) {
      const point = arcPoint(step, inner);
      top.push(pushVertex(point.x, domeY(step, cross), point.z));
      bottom.push(pushVertex(point.x, 0, point.z));
    }
    for (let step = 0; step < SEGMENTS; step++) {
      pushQuad(
        lacquerIndices,
        top[step],
        inner ? bottom[step] : top[step + 1],
        inner ? bottom[step + 1] : bottom[step + 1],
        inner ? top[step + 1] : bottom[step],
        inner,
      );
    }
  }

  // Seal both pointed ends of the crescent.
  for (const step of [0, SEGMENTS]) {
    const outer = arcPoint(step, false);
    const inner = arcPoint(step, true);
    const outerTop = pushVertex(outer.x, domeY(step, 0), outer.z);
    const innerTop = pushVertex(inner.x, domeY(step, CROSS_SEGMENTS), inner.z);
    const innerBottom = pushVertex(inner.x, 0, inner.z);
    const outerBottom = pushVertex(outer.x, 0, outer.z);
    pushQuad(
      lacquerIndices,
      outerTop,
      step === 0 ? outerBottom : innerTop,
      innerBottom,
      step === 0 ? innerTop : outerBottom,
      step === SEGMENTS,
    );
  }

  // Flat base: its own strip keeps every wooden normal facing away from the solid.
  const base: number[][] = [];
  for (let step = 0; step <= SEGMENTS; step++) {
    const row: number[] = [];
    for (let cross = 0; cross <= CROSS_SEGMENTS; cross++) {
      const point = interpolatePoint(step, cross);
      row.push(pushVertex(point.x, 0, point.z));
    }
    base.push(row);
  }
  for (let step = 0; step < SEGMENTS; step++) {
    for (let cross = 0; cross < CROSS_SEGMENTS; cross++) {
      pushQuad(
        woodIndices,
        base[step][cross],
        base[step][cross + 1],
        base[step + 1][cross + 1],
        base[step + 1][cross],
        true,
      );
    }
  }

  const indices = [...lacquerIndices, ...woodIndices];
  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = [];
  VertexData.ComputeNormals(positions, indices, vertexData.normals);
  const uvs: number[] = [];
  for (let vertex = 0; vertex < positions.length; vertex += 3) {
    uvs.push((positions[vertex] + BLADE_HALF_LENGTH) / (BLADE_HALF_LENGTH * 2));
    uvs.push((positions[vertex + 2] + 0.25) / 1.2);
  }
  vertexData.uvs = uvs;
  vertexData.applyToMesh(mesh);
  mesh.releaseSubMeshes();

  const lacquer = new PBRMaterial(`jiaobei_lacquer_${index}`, scene);
  lacquer.albedoColor = Color3.FromHexString('#8d0718');
  lacquer.emissiveColor = Color3.FromHexString('#220006');
  lacquer.metallic = 0.04;
  lacquer.roughness = 0.17;
  lacquer.clearCoat.isEnabled = true;
  lacquer.clearCoat.intensity = 0.92;
  lacquer.clearCoat.roughness = 0.08;

  const wood = new PBRMaterial(`jiaobei_wood_${index}`, scene);
  wood.albedoColor = Color3.FromHexString('#9a512d');
  wood.emissiveColor = Color3.FromHexString('#1b0703');
  wood.metallic = 0;
  wood.roughness = 0.78;
  const grain = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const offset = (y * 64 + x) * 4;
      const wave = Math.sin(y * 0.72 + Math.sin(x * 0.19) * 2.4);
      const knot = Math.sin(Math.hypot(x - 42, (y - 31) * 1.8) * 0.62);
      const tone = Math.round(112 + wave * 18 + knot * 8);
      grain[offset] = tone + 34;
      grain[offset + 1] = tone - 18;
      grain[offset + 2] = tone - 42;
      grain[offset + 3] = 255;
    }
  }
  const woodTexture = RawTexture.CreateRGBATexture(grain, 64, 64, scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
  woodTexture.name = `jiaobei_wood_grain_${index}`;
  woodTexture.uScale = 1.15;
  woodTexture.vScale = 3.2;
  wood.albedoTexture = woodTexture;

  const materials = new MultiMaterial(`jiaobei_materials_${index}`, scene);
  materials.subMaterials.push(lacquer, wood);
  mesh.material = materials;
  new SubMesh(0, 0, positions.length / 3, 0, lacquerIndices.length, mesh);
  new SubMesh(1, 0, positions.length / 3, lacquerIndices.length, woodIndices.length, mesh);

  mesh.metadata = {
    convexLocalNormal: new Vector3(0, 1, 0),
    silhouette: 'crescent',
    profile: 'curved-blade',
    faces: { rounded: 'red-lacquer', flat: 'wood-grain' },
    baseVertexStart: base[0][0],
  };
  if (initialPose) {
    mesh.position.set(initialPose.position.x, initialPose.position.y, initialPose.position.z);
    mesh.rotationQuaternion = Quaternion.FromEulerAngles(
      initialPose.rotation.x,
      initialPose.rotation.y,
      initialPose.rotation.z,
    );
  }
  mesh.computeWorldMatrix(true);
  return mesh;
}


const PHYSICS_SEGMENTS = 32;
const PHYSICS_RADIAL_STEPS = 6;
const PHYSICS_HALF_WIDTH = 0.72;
const PHYSICS_HALF_LENGTH = 1.02;
const PHYSICS_BASE_THICKNESS = 0.16;
const PHYSICS_DOME_HEIGHT = 0.38;
const PHYSICS_LANDING_PATCH_RADIUS = 0.22;


function createJiaobeiPhysicsProxy(
  scene: Scene,
  index: number,
  initialPose?: JiaobeiInitialPose,
): Mesh {
  const mesh = new Mesh(`jiaobei_visual_${index}`, scene);
  const positions: number[] = [];
  const indices: number[] = [];

  const pushVertex = (x: number, y: number, z: number) => {
    positions.push(x, y, z);
    return positions.length / 3 - 1;
  };
  const moonPoint = (step: number, radius: number, y: number) => {
    const theta = (step / PHYSICS_SEGMENTS) * Math.PI;
    return pushVertex(
      PHYSICS_HALF_WIDTH * radius * Math.cos(theta),
      y,
      PHYSICS_HALF_LENGTH * radius * Math.sin(theta),
    );
  };
  const domeY = (radius: number) => {
    if (radius <= PHYSICS_LANDING_PATCH_RADIUS) return PHYSICS_BASE_THICKNESS + PHYSICS_DOME_HEIGHT;
    const falloff = (radius - PHYSICS_LANDING_PATCH_RADIUS) / (1 - PHYSICS_LANDING_PATCH_RADIUS);
    return PHYSICS_BASE_THICKNESS + PHYSICS_DOME_HEIGHT * (1 - falloff * falloff);
  };

  // 红漆凸面是一个半椭圆月牙，而非完整椭圆；六圈细分让高光连续移动。
  const domeCenter = pushVertex(0, PHYSICS_BASE_THICKNESS + PHYSICS_DOME_HEIGHT, 0);
  const domeRings: number[][] = [];
  for (let ring = 1; ring <= PHYSICS_RADIAL_STEPS; ring++) {
    const radius = ring / PHYSICS_RADIAL_STEPS;
    const y = domeY(radius);
    const vertices: number[] = [];
    for (let step = 0; step <= PHYSICS_SEGMENTS; step++) {
      vertices.push(moonPoint(step, radius, y));
    }
    domeRings.push(vertices);
  }

  for (let ring = 0; ring < domeRings.length; ring++) {
    const current = domeRings[ring];
    const previous = domeRings[ring - 1];
    for (let step = 0; step < PHYSICS_SEGMENTS; step++) {
      const next = step + 1;
      if (ring === 0) {
        indices.push(domeCenter, current[next], current[step]);
      } else {
        indices.push(previous[step], previous[next], current[next]);
        indices.push(previous[step], current[next], current[step]);
      }
    }
  }
  const domeIndexCount = indices.length;

  // 外弧与直径边都封口，令红漆凸面和木质平底成为一件真正的半月实体。
  const sideTop: number[] = [];
  const sideBottom: number[] = [];
  for (let step = 0; step <= PHYSICS_SEGMENTS; step++) {
    sideTop.push(moonPoint(step, 1, PHYSICS_BASE_THICKNESS));
    sideBottom.push(moonPoint(step, 1, 0));
  }
  for (let step = 0; step < PHYSICS_SEGMENTS; step++) {
    const next = step + 1;
    indices.push(sideTop[step], sideTop[next], sideBottom[next]);
    indices.push(sideTop[step], sideBottom[next], sideBottom[step]);
  }

  const chordSteps = PHYSICS_RADIAL_STEPS * 2;
  const chordTop: number[] = [];
  const chordBottom: number[] = [];
  const chordIndexStart = indices.length;
  for (let step = 0; step <= chordSteps; step++) {
    const t = -1 + (2 * step) / chordSteps;
    chordTop.push(pushVertex(
      PHYSICS_HALF_WIDTH * t,
      domeY(Math.abs(t)),
      0,
    ));
    chordBottom.push(pushVertex(PHYSICS_HALF_WIDTH * t, 0, 0));
  }
  for (let step = 0; step < chordSteps; step++) {
    const next = step + 1;
    indices.push(chordTop[step], chordBottom[next], chordTop[next]);
    indices.push(chordTop[step], chordBottom[step], chordBottom[next]);
  }
  const chordIndexCount = indices.length - chordIndexStart;
  const sideIndexCount = indices.length - domeIndexCount;

  // 平整木底是阴面；翻到这一面时，玩家能直接看到明确的平面结果。
  const bottomCenter = pushVertex(0, 0, 0);
  const bottomRim: number[] = [];
  for (let step = 0; step <= PHYSICS_SEGMENTS; step++) bottomRim.push(moonPoint(step, 1, 0));
  for (let step = 0; step < PHYSICS_SEGMENTS; step++) {
    const next = step + 1;
    indices.push(bottomCenter, bottomRim[step], bottomRim[next]);
  }
  const bottomIndexCount = indices.length - domeIndexCount - sideIndexCount;

  const vertexData = new VertexData();
  for (let index = 0; index < indices.length; index += 3) {
    [indices[index + 1], indices[index + 2]] = [indices[index + 2], indices[index + 1]];
  }
  // The straight chord is already clockwise in Babylon's left-handed render space.
  for (let index = chordIndexStart; index < chordIndexStart + chordIndexCount; index += 3) {
    [indices[index + 1], indices[index + 2]] = [indices[index + 2], indices[index + 1]];
  }
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = [];
  VertexData.ComputeNormals(positions, indices, vertexData.normals);
  vertexData.applyToMesh(mesh);
  mesh.releaseSubMeshes();

  const lacquer = new PBRMaterial(`jiaobei_lacquer_${index}`, scene);
  lacquer.albedoColor = Color3.FromHexString('#8d211c');
  lacquer.metallic = 0;
  lacquer.roughness = 0.28;
  lacquer.clearCoat.isEnabled = true;
  lacquer.clearCoat.intensity = 0.42;
  lacquer.clearCoat.roughness = 0.2;

  const wood = new PBRMaterial(`jiaobei_wood_${index}`, scene);
  wood.albedoColor = Color3.FromHexString('#9b5a2c');
  wood.metallic = 0;
  wood.roughness = 0.7;

  const materials = new MultiMaterial(`jiaobei_materials_${index}`, scene);
  materials.subMaterials.push(lacquer, wood);
  mesh.material = materials;
  new SubMesh(0, 0, positions.length / 3, 0, domeIndexCount + sideIndexCount, mesh);
  new SubMesh(1, 0, positions.length / 3, domeIndexCount + sideIndexCount, bottomIndexCount, mesh);

  mesh.metadata = { convexLocalNormal: new Vector3(0, 1, 0) };
  if (initialPose) {
    mesh.position.set(initialPose.position.x, initialPose.position.y, initialPose.position.z);
    mesh.rotationQuaternion = Quaternion.FromEulerAngles(
      initialPose.rotation.x,
      initialPose.rotation.y,
      initialPose.rotation.z,
    );
  }
  mesh.isVisible = false;
  mesh.computeWorldMatrix(true);
  return mesh;
}


/** One procedural jiaobei participating in Havok physics. */
export class JiaobeiMesh {
  readonly mesh!: Mesh;
  readonly aggregate!: PhysicsAggregate;
  readonly body!: Mesh;
  readonly visual!: Mesh;

  constructor(scene: Scene, index: number) {
    throw new Error('JiaobeiMesh requires asynchronous initialization; use JiaobeiMesh.create()');
  }

  static create(
    scene: Scene,
    index: number,
    initialPose?: JiaobeiInitialPose,
  ): JiaobeiMesh {
    const instance = Object.create(JiaobeiMesh.prototype) as JiaobeiMesh;
    const mesh = createJiaobeiPhysicsProxy(scene, index, initialPose);
    const visual = createJiaobeiVisual(scene, index);
    visual.parent = mesh;
    visual.position.set(0, 0, 0);
    visual.rotationQuaternion = Quaternion.Identity();
    visual.scaling.set(0.44, 1, 0.82);
    const aggregate = new PhysicsAggregate(
      mesh,
      PhysicsShapeType.CONVEX_HULL,
      {
        mass: 0.18,
        friction: 0.78,
        restitution: 0.12,
      },
      scene,
    );
    (instance as any).mesh = mesh;
    (instance as any).body = mesh;
    (instance as any).visual = visual;
    (instance as any).aggregate = aggregate;
    return instance;
  }

  dispose() {
    this.aggregate.dispose();
    this.mesh.dispose();
  }
}
