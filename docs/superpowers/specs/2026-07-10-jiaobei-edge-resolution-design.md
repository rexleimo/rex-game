# 筊杯真实碰撞与边立消解设计

- 日期：2026-07-10
- 状态：用户已选择方案 A，待书面规范复核
- 范围：程序化筊杯碰撞体、边立停滞恢复、三态朝向判定与物理验收

## 1. 问题与实证

现有实现为了避免筊杯停在直边上，将所有 `z < 0.6` 的碰撞顶点推到 `z = 0.6`，再附加一条半径 `0.025` 的横向 capsule。这个不可见代理与程序化可见模型并不重合。

前台浏览器对固定 seed 的运行时读数为：

- 两片都已收到地面碰撞，速度已归零；
- 两片最终 `upDot` 分别约为 `-0.7686` 和 `-0.7688`；
- 两片离真正平躺仍约 `40` 度，却因当前阈值 `0.75` 被判为笑杯；
- UI 结果约在 `1.2s` 出现，但结果帧仍明显像两片斜立的薄片。

静态支撑包络扫描还证明当前代理会带来：

- 翻滚过程最大可见穿台约 `0.387`；
- 部分方向由隐形代理提前接触，最大悬空约 `0.125`；
- 平底状态被 capsule 固定抬高约 `0.025`。

缩小内切量、移动 capsule、换单点 sphere 或调整质心均不能被动消除直边稳定点。1024-seed 扫描中，`inset = 0.04` 有 994 次请求重试，完整可见凸包加旧 rocker 有 975 次请求重试。因此继续调隐形碰撞体不是可接受方向。

## 2. 目标与非目标

### 2.1 目标

- 可见模型与碰撞模型使用同一组顶点，不再引入代理几何误差；运行时接触误差只允许来自 Havok solver epsilon。
- 保留 Havok 自由落体、碰撞、摩擦和翻滚；不直接修改 mesh transform。
- 直边低速停滞时，在同一次投掷中施加一次小角冲量，使其继续真实翻落。
- 只有每片 `|upDot| >= 0.90` 时才允许返回杯象，即最终面与世界竖直方向夹角不超过约 `26` 度。
- 两片仍保持独立刚体和可见间距，三种杯象都能自然出现。
- 正常前台投掷快速结束，页面隐藏期间不消耗虚假的物理时限。

### 2.2 非目标

- 不制作或引入外部 3D 模型。
- 不使用关键帧动画、位置 tween 或结果后强制摆正。
- 不预先选定圣杯、笑杯或阴杯再反推刚体姿态。
- 不修改三象含义、三掷业务规则、结果文案、摄像头生命周期或移动端布局。
- 不添加依赖。

## 3. 方案选择

采用用户确认的方案 A：`exact visual hull + edge-stall angular impulse`。

拒绝继续扩大或斜切隐形碰撞代理，因为它只能用穿模和悬空换取数值稳定。拒绝整组等待超时后自动重抛作为主要机制，因为它会重新造成“很久不落地”。保留最多一次整组重试，仅作为冲量后仍无法得到明确面的安全兜底。

## 4. 架构与状态流

### 4.1 完全一致的碰撞体

`JiaobeiMesh` 直接以 `createJiaobeiVisual()` 生成的封闭网格，通过 `PhysicsShapeType.CONVEX_HULL` 创建 Havok convex hull：

- 删除 `z = 0.6` 顶点改写；
- 删除额外 capsule、sphere 和 shape container；
- 质量保持 `0.18`；
- 不再调用自定义 `setMassProperties({ centerOfMass })`，让 Havok 根据真实凸包和 `mass: 0.18` 计算质心与惯量；
- 由 `PhysicsAggregate` 创建并持有 shape，`dispose()` 不再重复手工释放外部 shape；
- 保留现有摩擦 `0.78`、恢复系数 `0.12` 和程序化材质。

这样任意方向的理论支撑值都来自可见网格本身；浏览器动态接触仍按 Havok 的正常 solver epsilon 验收，而不是要求浮点意义上的绝对零穿透。

### 4.2 三态朝向

每片继续使用局部凸面法线与世界 `Up` 的点积：

```text
upDot >=  0.90  -> sheng-face
upDot <= -0.90  -> yin-face
otherwise       -> edge
```

`edge` 不是第四种结果，永远不能进入 `judgeCup()`。提高阈值用于保证玩家看见的是明确正面或反面，而不是数值上勉强越线的斜片。

### 4.3 边立停滞检测

只有同时满足下列条件，才允许触发边立恢复：

1. 两片都已经收到与地面刚体的首次碰撞；
2. 当前朝向分类为 `edge`；
3. 线速度不高于 `0.3`，角速度不高于 `0.75`；
4. 条件连续满足 3 个 `33ms` 检查周期；
5. 该片在本次 attempt 中尚未接受过边立角冲量；
6. 页面可见且当前 controller 未被 dispose。
7. 当前物理时间不晚于 `THROW_MAX_DURATION_MS - 700ms`，保证冲量后至少还有 `700ms` 的真实 Havok 滚动窗口。

飞行中、首次碰撞前、仍在明显翻滚时以及后台暂停期间均不得施加冲量。

### 4.4 角冲量

恢复动作使用 Havok `PhysicsBody.applyAngularImpulse()`，不设置位置、旋转或预选结果。

- 世界轴先计算 `axisRaw = cross(faceNormalWorld, worldUp)`；只有长度有限且大于 `1e-6` 时才归一化，异常轴直接进入安全重试。
- 每片持续保存 `roll = dot(angularVelocityWorld, axis)` 的最近一次有效符号。`|roll| > 0.05 rad/s` 时沿该符号继续；历史趋势不可用时使用 `sign(upDot)` 翻向最近一面；完全中性时使用 attempt 创建时为该片保存的受控随机符号。
- 初始校准值按两个能垒分开：翻向 `+Up` 使用 `0.24 N*m*s`，翻向 `-Up` 使用 `0.38 N*m*s`。完整凸包实测理想门槛约为 `0.208 / 0.334 N*m*s`；最终常量只有在 1024-seed 验收满足姿态、时延和一次助推约束后才能锁定。
- 历史滚动符号、随机符号和 assist 状态都按 piece/attempt 创建，并在重试或销毁时清空。
- 每片每个 attempt 最多施加一次；施加后清零稳定计数，由 Havok 继续碰撞和翻滚。
- 已经明确朝上的另一片不受影响。

如果首次 edge-stall 发生得太晚，或同一片在一次冲量后再次满足边立停滞条件，该 attempt 立即返回 `retry`，不再原地等待到长超时。整次 `throwOnce()` 仍最多执行两个 attempt。

`throwRuntime` 增加显式 `tip` 决策，不把助推暗藏在 `continue` 或 `retry` 中。每片维护连续 edge 次数、`assistUsed` 和最后滚动符号；执行顺序固定为：生命周期/隐藏检查 -> 越界与碰地检查 -> 速度和 edge 计数 -> `tip` -> 清零该片 edge 计数与整组 still 计数。

### 4.5 状态流

```text
created
  -> flying
  -> both contacted ground
  -> low-speed sampling
       -> both faces clear -> settled -> result
       -> edge + assist unused -> angular impulse -> physical rolling
       -> edge + assist used -> retry attempt
       -> out of bounds / missing contact at deadline -> retry attempt
```

安全时限继续按实际提交给 Havok 的物理时间累计。页面隐藏时，33ms 轮询在采样、计数、助推和结算前直接返回，同时 watchdog 解除武装；恢复后的首个真实 render 才重新武装并允许结算继续。

## 5. 公平性与错误处理

- 冲量方向从该片已有运动趋势或 attempt 随机状态得出，不根据目标杯象选择。
- 1024 个固定 seeds 中必须同时出现圣杯、笑杯和阴杯。
- 单片朝向正负比例应分别处于 `35%-65%`，避免恢复机制长期偏向同一面。
- “attempt 重试率”明确指 1024 次 `throwOnce()` 中，首次 attempt 进入第二次 attempt 的比例，目标不高于 `2%`；整次 `throwOnce()` 失败数必须为零。
- 两个 attempt 都失败时保留现有物理错误降级，不返回伪造杯象。
- dispose、卸载或 generation 变化后，等待器和角冲量都必须 no-op/取消，不能访问已销毁 body。

## 6. 测试策略

实施遵循红-绿-重构。

### 6.1 纯状态测试

- `0.89`、`-0.89` 和接近零的点积仍为 `edge`；`+/-0.90` 才是明确面。
- 两片已碰地、低速并连续 3 次 edge 时请求一次显式 `tip`，不是直接结算。
- 飞行中、未碰地、仍在移动或页面隐藏时不请求 `tip`。
- 已使用 assist 后再次 edge-stall 返回 `retry`。
- 明确面维持原有 `settled` 行为，安全时限不把 edge 当结果。

### 6.2 Havok 集成测试

- 对至少 4096 个覆盖球面的方向比较可见顶点与 physics source 的支撑值，差值不高于 `1e-4`；不能只比较 AABB。
- 动态接触允许 Havok solver epsilon，但可见穿台或悬空不得超过 `0.01` 世界单位。
- 512 与 1024 个固定 seeds 中，每个最终杯片都满足 `|upDot| >= 0.90`。
- 两片均在 `1.2s` 内首次接触地面，无越界、穿台或悬空结果。
- 三种杯象都出现，单片正负比例处于 `35%-65%`。
- 结果时间 p95 不高于 `2.6s`，最慢不高于 `3.2s`，重试率不高于 `2%`。
- 明确记录 assist 次数，验证每片每 attempt 不超过一次。

### 6.3 Thrower 生命周期测试

- edge-stall 只调用一次 `applyAngularImpulse`，轴和方向为有限数值。
- 已 clear 的杯片不受冲量。
- dispose、后台隐藏和 attempt 切换不会留下旧 interval 或向旧 body 施加冲量。
- 1000ms 卡顿仍只累计 Havok 实际接受的 100ms 物理时间。

### 6.4 浏览器验收

- 桌面和 390px 手机前台目标必须先证明 `visibilityState = visible`。
- 固定 seed 从点击到 UI 结果可见不高于 `2.6s`。
- 结果帧从运行时刚体读取两片 `upDot`，均满足 `|upDot| >= 0.90`，截图中两片不重叠、不侧立。
- 后台隐藏至少 `4.2s` 时不采样、不累计 stillChecks、不助推也不结算；恢复后继续同一 attempt 并正常落定。
- 手机摄像头继续满足舞台重叠面积为零、DOM 不在 stage 内、video track 为 `live`。

## 7. 预计修改范围

- `src/games/shantou-jiaobei/physics/JiaobeiMesh.ts`
- `src/games/shantou-jiaobei/physics/throwRuntime.ts`
- `src/games/shantou-jiaobei/physics/JiaobeiThrower.ts`
- `tests/jiaobei-mesh.test.ts`
- `tests/jiaobei-physics-runtime.test.ts`
- `tests/jiaobei-thrower-runtime.test.ts`
- `aios/temp/jiaobei_cdp_e2e.mjs`（仅验收诊断，不进入产品运行时）

不修改视觉页面、摄像头组件、手势检测器、三象文案或其他游戏。

## 8. 完成标准

只有同时满足以下条件才能宣布完成：

- 所有新增回归完成 RED -> GREEN 证据；
- `npm test`、`npx tsc --noEmit`、`npm run build` 全部以退出码 0 完成；
- 1024-seed 物理验证满足姿态、时延、分布、重试和边界约束；
- 桌面、手机、后台恢复三组浏览器验收通过；
- 逐帧视觉检查未发现两片重叠、侧立结果、代理穿台或异常悬空。
