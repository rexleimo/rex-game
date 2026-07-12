import {
  Color3,
  Mesh,
  MultiMaterial,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsShapeType,
  Quaternion,
  Scene,
  SubMesh,
  Vector3,
  VertexData,
} from '@babylonjs/core';

const SEGMENTS = 32;
const RADIAL_STEPS = 6;
const HALF_WIDTH = 0.72;
const HALF_LENGTH = 1.02;
const BASE_THICKNESS = 0.16;
const DOME_HEIGHT = 0.38;
const LANDING_PATCH_RADIUS = 0.22;

export interface JiaobeiInitialPose {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

/**
 * 用代码绘制一片筊杯：平整原木底、弧形红漆面和略厚的木质侧边。
 * 同一封闭几何同时用于渲染和凸包碰撞，避免视觉模型与物理体错位。
 */
export function createJiaobeiVisual(
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
    const theta = (step / SEGMENTS) * Math.PI;
    return pushVertex(
      HALF_WIDTH * radius * Math.cos(theta),
      y,
      HALF_LENGTH * radius * Math.sin(theta),
    );
  };
  const domeY = (radius: number) => {
    if (radius <= LANDING_PATCH_RADIUS) return BASE_THICKNESS + DOME_HEIGHT;
    const falloff = (radius - LANDING_PATCH_RADIUS) / (1 - LANDING_PATCH_RADIUS);
    return BASE_THICKNESS + DOME_HEIGHT * (1 - falloff * falloff);
  };

  // 红漆凸面是一个半椭圆月牙，而非完整椭圆；六圈细分让高光连续移动。
  const domeCenter = pushVertex(0, BASE_THICKNESS + DOME_HEIGHT, 0);
  const domeRings: number[][] = [];
  for (let ring = 1; ring <= RADIAL_STEPS; ring++) {
    const radius = ring / RADIAL_STEPS;
    const y = domeY(radius);
    const vertices: number[] = [];
    for (let step = 0; step <= SEGMENTS; step++) {
      vertices.push(moonPoint(step, radius, y));
    }
    domeRings.push(vertices);
  }

  for (let ring = 0; ring < domeRings.length; ring++) {
    const current = domeRings[ring];
    const previous = domeRings[ring - 1];
    for (let step = 0; step < SEGMENTS; step++) {
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
  for (let step = 0; step <= SEGMENTS; step++) {
    sideTop.push(moonPoint(step, 1, BASE_THICKNESS));
    sideBottom.push(moonPoint(step, 1, 0));
  }
  for (let step = 0; step < SEGMENTS; step++) {
    const next = step + 1;
    indices.push(sideTop[step], sideTop[next], sideBottom[next]);
    indices.push(sideTop[step], sideBottom[next], sideBottom[step]);
  }

  const chordSteps = RADIAL_STEPS * 2;
  const chordTop: number[] = [];
  const chordBottom: number[] = [];
  const chordIndexStart = indices.length;
  for (let step = 0; step <= chordSteps; step++) {
    const t = -1 + (2 * step) / chordSteps;
    chordTop.push(pushVertex(
      HALF_WIDTH * t,
      domeY(Math.abs(t)),
      0,
    ));
    chordBottom.push(pushVertex(HALF_WIDTH * t, 0, 0));
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
  for (let step = 0; step <= SEGMENTS; step++) bottomRim.push(moonPoint(step, 1, 0));
  for (let step = 0; step < SEGMENTS; step++) {
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
  mesh.computeWorldMatrix(true);
  return mesh;
}

/** 一片可参与 Havok 物理的程序化筊杯。 */
export class JiaobeiMesh {
  readonly mesh!: Mesh;
  readonly aggregate!: PhysicsAggregate;
  readonly body!: Mesh;

  constructor(scene: Scene, index: number) {
    throw new Error('JiaobeiMesh requires asynchronous initialization; use JiaobeiMesh.create()');
  }

  /** 工厂在同一任务内完成，避免卸载时遗留尚未登记的刚体。 */
  static create(
    scene: Scene,
    index: number,
    initialPose?: JiaobeiInitialPose,
  ): JiaobeiMesh {
    const instance = Object.create(JiaobeiMesh.prototype) as JiaobeiMesh;
    // Havok 在 PhysicsBody 构造时读取世界变换；必须先摆位，再创建刚体。
    const mesh = createJiaobeiVisual(scene, index, initialPose);
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
    (instance as any).aggregate = aggregate;
    return instance;
  }

  dispose() {
    this.aggregate.dispose();
    this.mesh.dispose();
  }
}
