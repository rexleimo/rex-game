import {
  Color3,
  Color4,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  PBRMaterial,
  PointLight,
  Scene,
  SceneLoader,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF/index.js';

/** 祭台需覆盖经过 1024 个固定种子验证的落杯包络，并为旋转后的杯身保留余量。 */
export const ALTAR_TABLE_WIDTH = 11.6;
export const ALTAR_TABLE_DEPTH = 9;
export const ALTAR_CUP_FOOTPRINT_MARGIN = 0.8;

/** 程序化生成潮汕庙宇风格的祭坛元素：木质台面、香炉、烛台、烟雾粒子。 */
export function createAltarElements(scene: Scene, shadowCaster: (mesh: Mesh) => void) {
  const altarRoot = new Mesh('altarRoot', scene);

  // 祭桌主体：厚重木质桌面 + 四足
  // 桌面顶部与 ground (y=0) 齐平，杯片落在桌面上；桌腿插入地面以下，视觉上接地。
  const tableWidth = ALTAR_TABLE_WIDTH;
  const tableDepth = ALTAR_TABLE_DEPTH;
  const tableThickness = 0.18;
  const legHeight = 0.55;
  const tableTopY = -0.085; // 桌面顶部略高于 ground (y=0)，避免共面闪烁

  const tableTop = MeshBuilder.CreateBox(
    'altarTableTop',
    { width: tableWidth, height: tableThickness, depth: tableDepth },
    scene,
  );
  tableTop.position.y = tableTopY;
  tableTop.parent = altarRoot;

  const silkMat = new PBRMaterial('altarSilk', scene);
  silkMat.albedoColor = Color3.FromHexString('#2b0b13');
  silkMat.metallic = 0;
  silkMat.roughness = 0.58;
  silkMat.sheen.isEnabled = true;
  silkMat.sheen.color = Color3.FromHexString('#7b2638');
  silkMat.sheen.roughness = 0.72;
  const silkTexture = new Texture(
    'data:image/svg+xml;base64,' +
      btoa(
        `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='256'>
          <defs>
            <linearGradient id='base' x1='0' y1='0' x2='1' y2='1'>
              <stop stop-color='#100508' />
              <stop offset='0.46' stop-color='#2a0d14' />
              <stop offset='1' stop-color='#0d0507' />
            </linearGradient>
            <filter id='folds'>
              <feTurbulence type='fractalNoise' baseFrequency='0.012 0.08' numOctaves='3' seed='8' />
              <feColorMatrix values='0.7 0 0 0 0 0 0.18 0 0 0 0 0 0.2 0 0 0 0 0.5 0' />
            </filter>
          </defs>
          <rect width='100%25' height='100%25' fill='url(%23base)' />
          <rect width='100%25' height='100%25' filter='url(%23folds)' opacity='0.48' />
        </svg>`,
      ),
    scene,
  );
  silkTexture.uScale = 1.4;
  silkTexture.vScale = 1.15;
  silkMat.albedoTexture = silkTexture;
  tableTop.material = silkMat;
  tableTop.receiveShadows = true;

  const woodMat = new StandardMaterial('altarWood', scene);
  woodMat.diffuseColor = Color3.FromHexString('#260d0c');
  woodMat.specularColor = new Color3(0.12, 0.05, 0.04);

  // 金箔包边：稍粗的台面边缘条，避免像细线框
  const edgeColor = Color3.FromHexString('#8f682c');
  const edgeMat = new StandardMaterial('altarEdgeMat', scene);
  edgeMat.diffuseColor = edgeColor;
  edgeMat.emissiveColor = edgeColor.scale(0.16);
  edgeMat.specularColor = new Color3(0.4, 0.35, 0.15);

  const edgeThickness = 0.045;
  const edgeHeight = tableThickness + 0.02;
  const createEdge = (name: string, w: number, d: number, x: number, z: number) => {
    const edge = MeshBuilder.CreateBox(name, { width: w, height: edgeHeight, depth: d }, scene);
    edge.position.set(x, tableTopY, z);
    edge.parent = altarRoot;
    edge.material = edgeMat;
  };
  createEdge('altarEdgeL', edgeThickness, tableDepth, -tableWidth / 2 + edgeThickness / 2, 0);
  createEdge('altarEdgeR', edgeThickness, tableDepth, tableWidth / 2 - edgeThickness / 2, 0);
  createEdge('altarEdgeF', tableWidth - edgeThickness * 2, edgeThickness, 0, tableDepth / 2 - edgeThickness / 2);
  createEdge('altarEdgeB', tableWidth - edgeThickness * 2, edgeThickness, 0, -tableDepth / 2 + edgeThickness / 2);

  // 桌腿
  const legSize = 0.28;
  const legPositions = [
    { x: -tableWidth / 2 + legSize, z: -tableDepth / 2 + legSize },
    { x: tableWidth / 2 - legSize, z: -tableDepth / 2 + legSize },
    { x: -tableWidth / 2 + legSize, z: tableDepth / 2 - legSize },
    { x: tableWidth / 2 - legSize, z: tableDepth / 2 - legSize },
  ];
  for (let i = 0; i < legPositions.length; i++) {
    const leg = MeshBuilder.CreateBox(
      `altarLeg${i}`,
      { width: legSize, height: legHeight, depth: legSize },
      scene,
    );
    leg.position.set(legPositions[i].x, tableTopY - tableThickness / 2 - legHeight / 2, legPositions[i].z);
    leg.parent = altarRoot;
    leg.material = woodMat;
    shadowCaster(leg);
  }

  // Keep decor behind the verified landing envelope without pushing it out of camera view.
  const decorZ = 3.58;
  const burnerGroup = new Mesh('burnerGroup', scene);
  burnerGroup.position.set(0, tableTopY + tableThickness / 2, decorZ);
  burnerGroup.parent = altarRoot;

  const burnerBase = MeshBuilder.CreateCylinder(
    'burnerBase',
    { diameter: 0.55, height: 0.22, tessellation: 28 },
    scene,
  );
  burnerBase.position.y = 0.11;
  burnerBase.parent = burnerGroup;
  const burnerMat = new StandardMaterial('burnerMat', scene);
  burnerMat.diffuseColor = Color3.FromHexString('#4c3422');
  burnerMat.specularColor = new Color3(0.15, 0.1, 0.06);
  burnerBase.material = burnerMat;
  shadowCaster(burnerBase);

  const burnerBowl = MeshBuilder.CreateCylinder(
    'burnerBowl',
    { diameterTop: 0.62, diameterBottom: 0.45, height: 0.28, tessellation: 28 },
    scene,
  );
  burnerBowl.position.y = 0.36;
  burnerBowl.parent = burnerGroup;
  const bowlMat = new StandardMaterial('bowlMat', scene);
  bowlMat.diffuseColor = Color3.FromHexString('#241812');
  burnerBowl.material = bowlMat;
  shadowCaster(burnerBowl);

  // 香灰/香头
  const incense = MeshBuilder.CreateCylinder(
    'incense',
    { diameter: 0.32, height: 0.07, tessellation: 20 },
    scene,
  );
  incense.position.y = 0.52;
  incense.parent = burnerGroup;
  const ashMat = new StandardMaterial('ashMat', scene);
  ashMat.diffuseColor = Color3.FromHexString('#9e8565');
  ashMat.emissiveColor = Color3.FromHexString('#c9a24b').scale(0.35);
  incense.material = ashMat;

  // 烟雾粒子
  const lightweight = scene.getEngine().getRenderWidth() < 720;
  const smoke = new ParticleSystem('smoke', lightweight ? 54 : 140, scene);
  smoke.emitter = new Vector3(0, tableTopY + tableThickness / 2 + 0.55, decorZ);
  smoke.particleTexture = new Texture(
    'data:image/svg+xml;base64,' +
      btoa(
        `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
          <radialGradient id='g'>
            <stop offset='0%25' stop-color='rgba(244,236,216,0.4)' />
            <stop offset='100%25' stop-color='rgba(244,236,216,0)' />
          </radialGradient>
          <circle cx='32' cy='32' r='30' fill='url(%23g)' />
        </svg>`,
      ),
    scene,
  );
  smoke.minEmitBox = new Vector3(-0.06, 0, -0.06);
  smoke.maxEmitBox = new Vector3(0.06, 0, 0.06);
  smoke.color1 = new Color4(0.96, 0.92, 0.85, 0.32);
  smoke.color2 = new Color4(0.9, 0.85, 0.75, 0.22);
  smoke.colorDead = new Color4(0.85, 0.8, 0.7, 0);
  smoke.minSize = 0.06;
  smoke.maxSize = 0.2;
  smoke.minLifeTime = 1.5;
  smoke.maxLifeTime = 3.0;
  smoke.emitRate = lightweight ? 7 : 18;
  smoke.blendMode = ParticleSystem.BLENDMODE_STANDARD;
  smoke.gravity = new Vector3(0, 0.22, 0);
  smoke.direction1 = new Vector3(-0.06, 0.9, -0.04);
  smoke.direction2 = new Vector3(0.06, 1.1, 0.04);
  smoke.minAngularSpeed = -0.25;
  smoke.maxAngularSpeed = 0.25;
  smoke.minEmitPower = 0.06;
  smoke.maxEmitPower = 0.15;
  smoke.updateSpeed = 0.016;
  smoke.start();

  // 两侧烛台固定在后缘，避免无碰撞装饰与落杯区域交叉
  const createCandle = (name: string, x: number, z: number) => {
    const candleGroup = new Mesh(name + 'Group', scene);
    candleGroup.position.set(x, tableTopY + tableThickness / 2, z);
    candleGroup.parent = altarRoot;

    const holder = MeshBuilder.CreateCylinder(
      name + 'Holder',
      { diameter: 0.16, height: 0.42, tessellation: 20 },
      scene,
    );
    holder.position.y = 0.21;
    holder.parent = candleGroup;
    const holderMat = new StandardMaterial(name + 'HolderMat', scene);
    holderMat.diffuseColor = Color3.FromHexString('#7a5230');
    holder.material = holderMat;
    shadowCaster(holder);

    const flame = MeshBuilder.CreateSphere(
      name + 'Flame',
      { diameter: 0.09, segments: 10 },
      scene,
    );
    flame.position.y = 0.45;
    flame.parent = candleGroup;
    const flameMat = new StandardMaterial(name + 'FlameMat', scene);
    flameMat.diffuseColor = Color3.FromHexString('#ffcc66');
    flameMat.emissiveColor = Color3.FromHexString('#ffaa33').scale(1.0);
    flame.material = flameMat;

    const light = new PointLight(name + 'Light', new Vector3(x, tableTopY + 0.75, z), scene);
    light.diffuse = Color3.FromHexString('#ffcc88');
    light.intensity = 0.8;
    light.range = 4.5;
    light.parent = altarRoot;

    return { holder, flame, light };
  };

  const leftCandle = createCandle('leftCandle', -2.18, decorZ);
  const rightCandle = createCandle('rightCandle', 2.18, decorZ);

  let decorDisposed = false;
  const loadDecorModel = async (
    fileName: string,
    parent: Mesh,
    fallback: Mesh,
    scale: number,
    yOffset = 0,
  ) => {
    try {
      const result = await SceneLoader.ImportMeshAsync('', '/assets/models/jiaobei/', fileName, scene);
      if (decorDisposed) {
        result.meshes.forEach((mesh) => mesh.dispose());
        return;
      }
      const root = result.meshes[0];
      root.parent = parent;
      root.position.set(0, yOffset, 0);
      root.scaling.setAll(scale);
      result.meshes.forEach((mesh) => {
        mesh.receiveShadows = true;
        if (mesh instanceof Mesh) shadowCaster(mesh);
      });
      fallback.setEnabled(false);
    } catch {
      fallback.setEnabled(true);
    }
  };

  void loadDecorModel('xianglu.glb', burnerGroup, burnerBase, 0.72, 0.02);
  void loadDecorModel('lotus-candle-stand.glb', leftCandle.holder.parent as Mesh, leftCandle.holder, 0.42);
  void loadDecorModel('lotus-candle-stand.glb', rightCandle.holder.parent as Mesh, rightCandle.holder, 0.42);

  // 烛光微弱闪烁动画
  let frame = 0;
  const flicker = () => {
    frame++;
    if (frame % 4 !== 0) return;
    const t = performance.now() * 0.001;
    leftCandle.light.intensity = 0.7 + Math.sin(t * 2.3) * 0.08 + Math.sin(t * 5.7) * 0.04;
    rightCandle.light.intensity = 0.7 + Math.sin(t * 2.7 + 1) * 0.08 + Math.sin(t * 6.1 + 2) * 0.04;
  };
  scene.onBeforeRenderObservable.add(flicker);

  return {
    root: altarRoot,
    dispose: () => {
      decorDisposed = true;
      scene.onBeforeRenderObservable.removeCallback(flicker);
      smoke.stop();
      smoke.dispose();
      altarRoot.dispose();
    },
  };
}

export default createAltarElements;
