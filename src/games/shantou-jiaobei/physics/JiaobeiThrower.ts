import {
  ArcRotateCamera, Color3, Color4, DirectionalLight, Engine, HemisphericLight,
  Matrix, MeshBuilder, PhysicsActivationControl, PhysicsAggregate, PhysicsShapeType, Scene,
  ShadowGenerator, StandardMaterial, Vector3, HavokPlugin, Mesh,
} from '@babylonjs/core';
// 物理 v2 side-effect 注册（HavokPlugin / PhysicsAggregate / PhysicsBody 等）
import '@babylonjs/core/Physics/physicsEngineComponent.js';
import '@babylonjs/core/Physics/v2/physicsEngine.js';
import '@babylonjs/core/Physics/v2/physicsBody.js';
import '@babylonjs/core/Physics/v2/physicsShape.js';
import '@babylonjs/core/Physics/v2/physicsMaterial.js';
import '@babylonjs/core/Physics/v2/physicsAggregate.js';
import '@babylonjs/core/Physics/v2/Plugins/havokPlugin.js';
import '@babylonjs/core/Meshes/groundMesh.js';
import '@babylonjs/core/Cameras/arcRotateCamera.js';
import '@babylonjs/core/Lights/directionalLight.js';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent.js';
import { loadHavok } from './havokLoader.ts';
import { JiaobeiMesh } from './JiaobeiMesh.ts';
import { computeCameraGoal, type CameraGoal } from './cameraDirector.ts';
import { createEdgeAssistImpulse, measureEdgeRoll } from './edgeAssist.ts';
import {
  classifyCupFace,
  createThrowPieceAssistState,
  getSubmittedPhysicsDeltaMs,
  isGroundCollision,
  isRenderWatchdogExpired,
  shouldApplyFaceContactBraking,
  stepThrowSettlement,
  THROW_FACE_CONTACT_ANGULAR_DAMPING,
  THROW_FACE_CONTACT_LINEAR_DAMPING,
  THROW_GROUND_SIZE,
  THROW_GROUND_THICKNESS,
  THROW_LANDING_ANGULAR_DAMPING,
  THROW_LANDING_LINEAR_DAMPING,
  THROW_PHYSICS_SUBSTEP_MS,
  THROW_SETTLEMENT_SAMPLE_MS,
  type CupFace,
  type ThrowPieceAssistState,
  type ThrowProgress,
} from './throwRuntime.ts';
import { createThrowSetup } from './throwSetup.ts';
import {
  installJiaobeiE2eDiagnostics,
  type JiaobeiE2eDiagnostics,
  type JiaobeiE2ePieceSnapshot,
} from './jiaobeiE2eDiagnostics.ts';

/** 一次掷杯的单杯结果（每片筊杯的朝向）。 */
export type { CupFace } from './throwRuntime.ts';

/** 组合后的三象结果 */
export type CupResult = 'sheng' | 'xiao' | 'yin';

/**
 * 判定三象：
 *   凸面朝上 = 阳(正)  ；平面朝上 = 阴(反)
 *   一正一反 → 圣杯
 *   两反（皆平面朝上）→ 笑杯
 *   两正（皆凸面朝上）→ 阴杯
 */
export function judgeCup(a: CupFace, b: CupFace): CupResult {
  const aSheng = a === 'sheng-face';
  const bSheng = b === 'sheng-face';
  if (aSheng !== bSheng) return 'sheng';
  if (!aSheng && !bSheng) return 'xiao'; // 皆平面朝上
  return 'yin'; // 皆凸面朝上
}

// —— 掷杯手感参数（集中调优） ——
const GRAVITY_Y = -19.6; // 接近真实重力 2g（快速自然坠落）
const MAX_THROW_ATTEMPTS = 2;

/**
 * Babylon.js + Havok 掷杯场景控制器。
 *
 * 生命周期：createScene → throwOnce → (等静止) → 结果回调 → 可再次 throwOnce → dispose
 */
export class JiaobeiThrower {
  private readonly canvas: HTMLCanvasElement | null;
  private engine: Engine;
  private scene: Scene;
  private camera!: ArcRotateCamera;
  private shadowGen!: ShadowGenerator;
  private pieces: JiaobeiMesh[] = [];
  private ground!: Mesh;
  private groundAggregate?: PhysicsAggregate;
  private collisionDisposers: Array<() => void> = [];
  private renderLoopRunning = false;
  private resizeObserver?: ResizeObserver;
  private visibilityChangeHandler?: () => void;
  private settled = true;
  private disposed = false;
  private throwInProgress = false;
  private lifecycleGeneration = 0;
  private physicsInitialization?: Promise<void>;
  private cancelSettling?: () => void;
  private attemptElapsedMs = 0;
  private lastRenderAtMs = 0;
  private renderWatchdogArmed = false;
  // 运镜 / 落地反馈状态
  private animating = false;
  private shake = 0;
  private landed: boolean[] = [];
  private pieceAssistStates: ThrowPieceAssistState[] = [];
  private pieceFaceBrakeActive: boolean[] = [];
  private onImpact?: () => void;
  private e2eDiagnostics: JiaobeiE2eDiagnostics | null = installJiaobeiE2eDiagnostics();

  constructor(canvas: HTMLCanvasElement | null, engine?: Engine) {
    this.canvas = canvas;
    if (engine) {
      this.engine = engine;
    } else {
      if (!canvas) throw new Error('A canvas is required when no Babylon engine is provided');
      this.engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false }, true);
    }
    this.scene = new Scene(this.engine);
    this.setupBasics();
    this.observeCanvasSize();
    this.observePageVisibility();
    // 立即起渲染循环：掷杯前也能看到点亮的神坛台面（含投影），而非一片黑
    this.startRenderLoop();
  }

  /** 初始化相机/灯光/地面/阴影，物理引擎在 throwOnce 前异步注入 */
  private setupBasics() {
    const scene = this.scene;
    scene.clearColor = new Color4(0.09, 0.063, 0.043, 1); // 漆黑褐（呼应新视觉底色）

    const initialGoal = computeCameraGoal([], this.getAspect(), 2);
    const camera = new ArcRotateCamera(
      'cam',
      initialGoal.alpha,
      initialGoal.beta,
      initialGoal.radius,
      new Vector3(initialGoal.target.x, initialGoal.target.y, initialGoal.target.z),
      scene,
    );
    if (this.canvas) camera.attachControl(this.canvas, true);
    camera.lowerRadiusLimit = 3.8;
    camera.upperRadiusLimit = 10;
    camera.lowerBetaLimit = 0.52;
    camera.upperBetaLimit = 1.08;
    camera.panningSensibility = 0;
    this.camera = camera;

    // 环境补光（压低，给方向光的阴影让位）
    const hemi = new HemisphericLight('hemi', new Vector3(0.2, 1, 0.3), scene);
    hemi.intensity = 0.55;
    hemi.groundColor = new Color3(0.18, 0.11, 0.09);

    // 主方向光 —— 产生投影，把筊杯「钉」在台面上，消除悬浮的假感
    const dir = new DirectionalLight('dir', new Vector3(-0.45, -1, -0.35), scene);
    dir.position = new Vector3(3, 8, 2.5);
    dir.intensity = 1.15;

    // 厚实体台面同时承担视觉与物理碰撞，避免杯片飞出薄地板后无限坠落。
    this.ground = MeshBuilder.CreateBox('ground', {
      width: THROW_GROUND_SIZE,
      height: THROW_GROUND_THICKNESS,
      depth: THROW_GROUND_SIZE,
    }, scene);
    this.ground.position.y = -THROW_GROUND_THICKNESS / 2;
    const gmat = new StandardMaterial('gmat', scene);
    gmat.diffuseColor = Color3.FromHexString('#241610');
    gmat.specularColor = new Color3(0.04, 0.03, 0.02);
    this.ground.material = gmat;
    this.ground.receiveShadows = true;
    // 地面物理体（静止刚体，修复穿模）—— 必须在 enablePhysics 后添加
    // 这里只创建 mesh，物理体在 ensurePhysics 后的 throwOnce 里首次添加

    // 柔和投影
    const sg = new ShadowGenerator(1024, dir);
    sg.useBlurExponentialShadowMap = true;
    sg.blurKernel = 32;
    sg.darkness = 0.42;
    this.shadowGen = sg;
  }

  private assertActive(generation: number) {
    if (this.disposed || generation !== this.lifecycleGeneration) {
      throw new Error('JiaobeiThrower was disposed during an asynchronous operation');
    }
  }

  private async createPhysics(generation: number) {
    if (!this.scene.getPhysicsEngine()) {
      const havok = await loadHavok();
      this.assertActive(generation);
      const plugin = new HavokPlugin(true, havok);
      this.scene.enablePhysics(new Vector3(0, GRAVITY_Y, 0), plugin);
    }
    this.assertActive(generation);
    this.scene.getPhysicsEngine()!.setSubTimeStep(THROW_PHYSICS_SUBSTEP_MS);
    if (!this.groundAggregate) {
      this.groundAggregate = new PhysicsAggregate(
        this.ground,
        PhysicsShapeType.BOX,
        { mass: 0 },
        this.scene,
      );
    }
  }

  /** 注入 Havok 物理引擎（异步，仅一次）+ 地面物理体。 */
  private ensurePhysics(generation = this.lifecycleGeneration): Promise<void> {
    this.assertActive(generation);
    if (!this.physicsInitialization) {
      const initialization = this.createPhysics(generation);
      let tracked: Promise<void>;
      tracked = initialization.catch((error) => {
        if (!this.disposed && this.physicsInitialization === tracked) {
          this.physicsInitialization = undefined;
        }
        throw error;
      });
      this.physicsInitialization = tracked;
    }
    return this.physicsInitialization.then(() => this.assertActive(generation));
  }

  /** 让页面只在 Havok 和地面刚体都真正就绪后开放投掷。 */
  async initialize(): Promise<void> {
    const generation = this.lifecycleGeneration;
    await this.ensurePhysics(generation);
    this.assertActive(generation);
  }

  /**
   * 掷一次杯。返回 Promise，resolve 时两片已静止并给出三象结果。
   * @param onImpact 每片筊杯首次触台时回调一次（用于落地音同步真实落点）。
   */
  async throwOnce(onImpact?: () => void): Promise<CupResult> {
    if (this.throwInProgress) throw new Error('A cup throw is already in progress');
    const generation = this.lifecycleGeneration;
    this.assertActive(generation);
    this.throwInProgress = true;

    try {
      await this.ensurePhysics(generation);
      this.assertActive(generation);
      this.onImpact = onImpact;
      this.settled = false;
      this.animating = true;
      this.shake = 0;
      this.detachCameraControls();
      this.e2eDiagnostics?.startThrow(performance.now());

      for (let attempt = 0; attempt < MAX_THROW_ATTEMPTS; attempt++) {
        this.createThrowAttempt(generation);
        this.e2eDiagnostics?.startAttempt(attempt + 1, performance.now());
        this.updateE2ePieces();
        const progress = await this.waitUntilSettled();
        this.assertActive(generation);
        if (progress === 'settled') {
          this.finishCameraMove();
          this.updateE2ePieces();
          this.e2eDiagnostics?.settle(performance.now(), this.attemptElapsedMs);
          return this.detectResult();
        }
      }
    } catch (error) {
      if (!this.disposed && generation === this.lifecycleGeneration) this.finishCameraMove();
      throw error;
    } finally {
      this.throwInProgress = false;
      this.onImpact = undefined;
    }

    this.finishCameraMove();
    throw new Error('The cups could not land safely after an automatic retry');
  }

  private createThrowAttempt(generation: number) {
    this.assertActive(generation);
    this.clearPieces();
    const setups = [createThrowSetup(0), createThrowSetup(1)];
    // 初始位置和旋转必须在刚体创建前写入，否则 Havok 会让两片都出生在原点。
    this.pieces = setups.map((setup, index) => (
      JiaobeiMesh.create(this.scene, index, setup)
    ));
    this.landed = [false, false];
    this.pieceAssistStates = this.pieces.map(() => (
      createThrowPieceAssistState(Math.random() < 0.5 ? -1 : 1)
    ));
    this.pieceFaceBrakeActive = this.pieces.map(() => false);
    this.attemptElapsedMs = 0;
    this.lastRenderAtMs = 0;
    this.renderWatchdogArmed = false;

    this.pieces.forEach((p, i) => {
      const setup = setups[i];

      // 投影：把视觉 mesh 加入投影投射者
      this.shadowGen.addShadowCaster(p.mesh, true);

      const body = p.aggregate.body;
      (this.scene.getPhysicsEngine()!.getPhysicsPlugin() as HavokPlugin).setActivationControl(
        body,
        PhysicsActivationControl.ALWAYS_ACTIVE,
      );
      body.setCollisionCallbackEnabled(true);
      const collisionObservable = body.getCollisionObservable();
      const observer = collisionObservable.add((event) => {
        if (this.landed[i] || !this.groundAggregate) return;
        if (!isGroundCollision(event.type, event.collidedAgainst, this.groundAggregate.body)) return;

        this.landed[i] = true;
        this.e2eDiagnostics?.impact(i, performance.now());
        body.setLinearDamping(THROW_LANDING_LINEAR_DAMPING);
        body.setAngularDamping(THROW_LANDING_ANGULAR_DAMPING);
        this.shake = Math.max(this.shake, 0.13);
        this.onImpact?.();
      });
      this.collisionDisposers.push(() => {
        collisionObservable.remove(observer);
        body.setCollisionCallbackEnabled(false);
      });

      // 低一些的自旋保留木质翻滚感，并让半月轮廓在镜头中可辨。
      body.setLinearVelocity(new Vector3(
        setup.velocity.x,
        setup.velocity.y,
        setup.velocity.z,
      ));
      body.setAngularVelocity(new Vector3(
        setup.angularVelocity.x,
        setup.angularVelocity.y,
        setup.angularVelocity.z,
      ));
    });

    this.applyCameraGoal(this.getCameraGoal(), 1);
    this.startRenderLoop();
  }

  private finishCameraMove() {
    if (this.disposed) return;
    this.settled = true;
    this.animating = false;
    this.shake = 0;
    if (this.pieces.length > 0) this.applyCameraGoal(this.getCameraGoal(), 1);
    if (this.canvas) this.camera.attachControl(this.canvas, true);
  }

  /** 每帧跟随两片杯的真实位置，并叠加短促落地震动。 */
  private updateFrame(deltaMs: number) {
    if (this.animating && this.pieces.length > 0) {
      // 镜头读取杯体实时位置，保持高机位并随两片展开自动扩景。
      const cameraDeltaMs = Math.min(50, deltaMs);
      const smoothing = 1 - Math.exp(-cameraDeltaMs / 110);
      this.applyCameraGoal(this.getCameraGoal(), smoothing);
      const s = this.shake;
      this.camera.beta += (Math.random() - 0.5) * s * 0.35;
      this.camera.radius += (Math.random() - 0.5) * s;
      this.camera.alpha += (Math.random() - 0.5) * s * 0.25;
    }
    // 震动衰减
    if (this.shake > 0) {
      this.shake *= 0.84;
      if (this.shake < 0.003) this.shake = 0;
    }
  }

  private getAspect(): number {
    const height = this.engine.getRenderHeight();
    return height > 0 ? this.engine.getRenderWidth() / height : 1;
  }

  private getCameraGoal(): CameraGoal {
    return computeCameraGoal(
      this.pieces.map((piece) => piece.mesh.position),
      this.getAspect(),
      this.pieces.length > 0 ? this.landed.filter(Boolean).length : 2,
    );
  }

  private applyCameraGoal(goal: CameraGoal, amount: number) {
    this.camera.alpha += (goal.alpha - this.camera.alpha) * amount;
    this.camera.beta += (goal.beta - this.camera.beta) * amount;
    this.camera.radius += (goal.radius - this.camera.radius) * amount;
    this.camera.target.set(
      this.camera.target.x + (goal.target.x - this.camera.target.x) * amount,
      this.camera.target.y + (goal.target.y - this.camera.target.y) * amount,
      this.camera.target.z + (goal.target.z - this.camera.target.z) * amount,
    );
  }

  private detachCameraControls() {
    this.camera.detachControl();
    this.camera.inertialAlphaOffset = 0;
    this.camera.inertialBetaOffset = 0;
    this.camera.inertialRadiusOffset = 0;
    this.camera.inertialPanningX = 0;
    this.camera.inertialPanningY = 0;
  }

  /** 两片都真实碰地后结算；越界或未落地超时则要求自动重掷。 */
  private waitUntilSettled(): Promise<ThrowProgress> {
    return new Promise((resolve) => {
      let stillChecks = 0;
      let finished = false;
      const attemptPieces = this.pieces.slice();
      const finish = (progress: ThrowProgress, retryReason?: string) => {
        if (finished) return;
        finished = true;
        globalThis.clearInterval(interval);
        this.cancelSettling = undefined;
        if (progress === 'retry') {
          this.e2eDiagnostics?.retry(
            performance.now(),
            retryReason ?? 'unknown',
            this.attemptElapsedMs,
          );
        }
        if (progress === 'settled') this.stopPieceMotion();
        resolve(progress);
      };
      const interval = globalThis.setInterval(() => {
        const pageHidden = typeof document !== 'undefined'
          && document.visibilityState === 'hidden';
        if (pageHidden) {
          this.renderWatchdogArmed = false;
          return;
        }
        if (
          this.disposed
          || attemptPieces.length !== this.pieces.length
          || attemptPieces.some((piece, index) => piece !== this.pieces[index])
        ) {
          finish('retry', 'attempt-replaced');
          return;
        }

        const now = performance.now();
        if (isRenderWatchdogExpired(
          this.lastRenderAtMs,
          now,
          false,
          this.renderWatchdogArmed,
        )) {
          finish('retry', 'render-watchdog');
          return;
        }

        const bodySamples = this.pieces.map((piece) => {
          const body = piece.aggregate.body;
          const linearVelocity = body.getLinearVelocity();
          const angularVelocity = body.getAngularVelocity();
          const faceNormalWorld = this.getCupFaceNormalWorld(piece);
          const upDot = Vector3.Dot(faceNormalWorld, Vector3.Up());
          const roll = measureEdgeRoll(faceNormalWorld, angularVelocity);
          return {
            body,
            faceNormalWorld,
            upDot,
            angularVelocity,
            sample: {
              position: piece.mesh.position,
              linearSpeed: linearVelocity.length(),
              angularSpeed: angularVelocity.length(),
              rollSpeed: roll?.rollSpeed ?? 0,
            },
          };
        });
        bodySamples.forEach((bodySample, index) => {
          const shouldBrake = shouldApplyFaceContactBraking(
            this.landed[index],
            bodySample.upDot,
            bodySample.sample,
            this.pieceFaceBrakeActive[index],
          );
          if (this.pieceFaceBrakeActive[index] === shouldBrake) return;
          this.pieceFaceBrakeActive[index] = shouldBrake;
          bodySample.body.setLinearDamping(
            shouldBrake
              ? THROW_FACE_CONTACT_LINEAR_DAMPING
              : THROW_LANDING_LINEAR_DAMPING,
          );
          bodySample.body.setAngularDamping(
            shouldBrake
              ? THROW_FACE_CONTACT_ANGULAR_DAMPING
              : THROW_LANDING_ANGULAR_DAMPING,
          );
        });
        const step = stepThrowSettlement({
          samples: bodySamples.map(({ sample }) => sample),
          landed: this.landed,
          faceUpDots: bodySamples.map(({ upDot }) => upDot),
          pieceStates: this.pieceAssistStates,
          stillChecks,
          elapsedMs: this.attemptElapsedMs,
          pageHidden: false,
        });
        this.pieceAssistStates = step.pieceStates;
        stillChecks = step.stillChecks;
        this.e2eDiagnostics?.updateSettlement(this.attemptElapsedMs, stillChecks);
        this.updateE2ePieces(bodySamples.map(({ upDot }) => upDot));

        if (step.action.type === 'tip') {
          const pieceIndices = step.action.pieceIndices;
          const plans = pieceIndices.map((pieceIndex) => {
            const bodySample = bodySamples[pieceIndex];
            const state = this.pieceAssistStates[pieceIndex];
            const plan = createEdgeAssistImpulse({
              faceNormalWorld: bodySample.faceNormalWorld,
              upDot: bodySample.upDot,
              angularVelocityWorld: bodySample.angularVelocity,
              lastRollSign: state.lastRollSign,
              fallbackSign: state.fallbackSign,
            });
            return plan ? { body: bodySample.body, plan } : null;
          });
          if (plans.some((plan) => plan === null)) {
            finish('retry', 'invalid-axis');
            return;
          }
          plans.forEach((entry, index) => {
            entry!.body.applyAngularImpulse(entry!.plan.impulse);
            this.e2eDiagnostics?.assist(
              pieceIndices[index],
              performance.now(),
              entry!.plan.magnitude,
            );
          });
          return;
        }

        if (step.action.type !== 'continue') {
          finish(
            step.action.type,
            step.action.type === 'retry' ? step.action.reason : undefined,
          );
        }
      }, THROW_SETTLEMENT_SAMPLE_MS);
      this.cancelSettling = () => finish('retry', 'cancelled');
    });
  }

  private stopPieceMotion() {
    this.pieces.forEach((piece) => {
      piece.aggregate.body.setLinearVelocity(Vector3.Zero());
      piece.aggregate.body.setAngularVelocity(Vector3.Zero());
      (this.scene.getPhysicsEngine()!.getPhysicsPlugin() as HavokPlugin).setActivationControl(
        piece.aggregate.body,
        PhysicsActivationControl.SIMULATION_CONTROLLED,
      );
    });
  }

  private clearPieces() {
    this.cancelSettling?.();
    this.collisionDisposers.splice(0).forEach((dispose) => dispose());
    this.pieces.forEach((piece) => this.shadowGen?.removeShadowCaster(piece.mesh));
    this.pieces.forEach((piece) => piece.dispose());
    this.pieces = [];
    this.landed = [];
    this.pieceAssistStates = [];
    this.pieceFaceBrakeActive = [];
  }

  /** 检测两片筊杯落地朝向 → 三象 */
  private detectResult(): CupResult {
    const [first, second] = this.pieces.map(
      (piece) => classifyCupFace(this.getCupFaceUpDot(piece)),
    );
    if (first === 'edge' || second === 'edge') {
      throw new Error('A cup result cannot be detected from an edge orientation');
    }
    return judgeCup(first, second);
  }

  private getCupFaceUpDot(piece: JiaobeiMesh): number {
    return Vector3.Dot(this.getCupFaceNormalWorld(piece), Vector3.Up());
  }

  private getCupFaceNormalWorld(piece: JiaobeiMesh): Vector3 {
    piece.mesh.computeWorldMatrix(true);
    const convexLocal = piece.mesh.metadata.convexLocalNormal as Vector3;
    const worldNormal = Vector3.TransformNormal(convexLocal, piece.mesh.getWorldMatrix());
    return Vector3.Normalize(worldNormal);
  }

  private updateE2ePieces(upDots?: readonly number[]) {
    if (!this.e2eDiagnostics || this.pieces.length === 0) return;
    const viewport = this.camera.viewport.toGlobal(
      this.engine.getRenderWidth(),
      this.engine.getRenderHeight(),
    );
    const transform = this.scene.getTransformMatrix();
    const snapshots = this.pieces.map((piece, index): JiaobeiE2ePieceSnapshot => {
      piece.mesh.computeWorldMatrix(true);
      const projected = piece.mesh.getBoundingInfo().boundingBox.vectorsWorld.map((corner) => (
        Vector3.Project(corner, Matrix.IdentityReadOnly, transform, viewport)
      ));
      return {
        index,
        landed: this.landed[index] ?? false,
        assistCount: this.pieceAssistStates[index]?.assistUsed ? 1 : 0,
        upDot: upDots?.[index] ?? this.getCupFaceUpDot(piece),
        position: {
          x: piece.mesh.position.x,
          y: piece.mesh.position.y,
          z: piece.mesh.position.z,
        },
        screenBounds: {
          left: Math.min(...projected.map((point) => point.x)),
          top: Math.min(...projected.map((point) => point.y)),
          right: Math.max(...projected.map((point) => point.x)),
          bottom: Math.max(...projected.map((point) => point.y)),
        },
      };
    });
    this.e2eDiagnostics.updatePieces(snapshots);
  }

  private readonly renderFrame = () => {
    if (this.disposed) return;
    const pageHidden = typeof document !== 'undefined'
      && document.visibilityState === 'hidden';
    if (pageHidden) {
      this.renderWatchdogArmed = false;
      return;
    }
    const deltaMs = Math.min(1000, Math.max(1, this.engine.getDeltaTime() || 16.67));
    this.updateFrame(deltaMs);
    this.scene.render();
    if (this.animating && this.pieces.length > 0) {
      this.attemptElapsedMs += getSubmittedPhysicsDeltaMs(deltaMs);
      this.e2eDiagnostics?.updateActivePhysics(this.attemptElapsedMs);
      this.renderWatchdogArmed = true;
      this.lastRenderAtMs = performance.now();
    }
  };

  private observeCanvasSize() {
    if (!this.canvas || typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(() => {
      if (this.disposed) return;
      this.engine.resize();
      this.applyCameraGoal(this.getCameraGoal(), 1);
    });
    this.resizeObserver.observe(this.canvas);
  }

  private observePageVisibility() {
    if (typeof document === 'undefined') return;
    this.visibilityChangeHandler = () => {
      this.renderWatchdogArmed = false;
    };
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  private startRenderLoop() {
    if (this.disposed || this.renderLoopRunning) return;
    this.renderLoopRunning = true;
    this.engine.runRenderLoop(this.renderFrame);
  }

  private stopRenderLoop() {
    if (!this.renderLoopRunning) return;
    this.renderLoopRunning = false;
    this.engine.stopRenderLoop(this.renderFrame);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.e2eDiagnostics?.dispose(performance.now());
    this.lifecycleGeneration++;
    this.renderWatchdogArmed = false;
    this.stopRenderLoop();
    this.resizeObserver?.disconnect();
    if (this.visibilityChangeHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }
    this.clearPieces();
    this.groundAggregate?.dispose();
    this.ground?.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }
}
