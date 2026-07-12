# Jiaobei SubMesh Z-Fighting Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the radial black rendering seams by ensuring each jiaobei triangle is rendered by exactly one material submesh.

**Architecture:** Keep the existing single procedural `Mesh` as both the visual and Havok convex-hull source. Release Babylon's automatically created full-range submesh after applying vertex data, then create exactly two explicit, contiguous material ranges.

**Tech Stack:** TypeScript 5.7, Babylon.js 7.54 MultiMaterial/SubMesh, Node test runner, Next.js 15, Chrome CDP.

## Global Constraints

- Preserve all positions, indices, normals, materials, physical parameters, throw behavior, camera behavior, and result rules.
- Do not use two-sided rendering, depth-write suppression, polygon offset, or separate child meshes.
- The final mesh must have exactly two non-overlapping submeshes whose index ranges cover the full index buffer once.
- This workspace is not a Git repository; use file-level checkpoints instead of commit steps.

---

### Task 1: Add a SubMesh Coverage Regression

**Files:**
- Modify: `tests/jiaobei-mesh.test.ts`

**Interfaces:**
- Consumes: `createJiaobeiVisual(scene, index)` and Babylon `mesh.subMeshes`.
- Produces: a regression that verifies exact material partition coverage.

- [ ] **Step 1: Write the failing test**

Add a test that reads `mesh.getIndices()`, sorts `mesh.subMeshes` by `indexStart`, and asserts:

```ts
assert.equal(mesh.subMeshes.length, 2);
assert.deepEqual(mesh.subMeshes.map((subMesh) => subMesh.materialIndex), [0, 1]);
assert.equal(mesh.subMeshes[0].indexStart, 0);
assert.equal(mesh.subMeshes[0].indexCount, mesh.subMeshes[1].indexStart);
assert.equal(
  mesh.subMeshes[0].indexCount + mesh.subMeshes[1].indexCount,
  indices.length,
);
```

- [ ] **Step 2: Run the focused test and capture RED**

Run:

```bash
node --experimental-strip-types --test tests/jiaobei-mesh.test.ts
```

Expected: FAIL because the mesh currently contains the automatic full-range submesh plus the two explicit material submeshes.

### Task 2: Remove the Automatic Full-Range SubMesh

**Files:**
- Modify: `src/games/shantou-jiaobei/physics/JiaobeiMesh.ts`

**Interfaces:**
- Consumes: the existing `domeIndexCount`, `sideIndexCount`, and `bottomIndexCount` ranges.
- Produces: exactly two explicit `SubMesh` instances with material indices 0 and 1.

- [ ] **Step 1: Implement the minimal fix**

Immediately after `vertexData.applyToMesh(mesh)`, release the automatically created submesh before constructing the two explicit ranges:

```ts
mesh.releaseSubMeshes();
```

Do not change any geometry or physics construction.

- [ ] **Step 2: Run the focused test and capture GREEN**

Run:

```bash
node --experimental-strip-types --test tests/jiaobei-mesh.test.ts
```

Expected: all mesh tests pass and the material ranges cover the index buffer exactly once.

### Task 3: Full and Visual Verification

**Files:**
- Verify: `src/games/shantou-jiaobei/physics/JiaobeiMesh.ts`
- Verify: `tests/jiaobei-mesh.test.ts`
- Evidence: `aios/temp/jiaobei-e2e/<run-id>/`

**Interfaces:**
- Consumes: the production build and existing CDP E2E diagnostics.
- Produces: fresh automated and screenshot evidence.

- [ ] **Step 1: Run engineering verification**

```bash
npm test
npx tsc --noEmit
npm run build
node --check aios/temp/jiaobei_cdp_e2e.mjs
```

Expected: every command exits 0.

- [ ] **Step 2: Run fresh desktop and mobile rendering evidence**

```bash
MODE=desktop node aios/temp/jiaobei_cdp_e2e.mjs
MODE=mobile node aios/temp/jiaobei_cdp_e2e.mjs
```

Expected: both modes exit 0 and save fresh throwing and settled screenshots.

- [ ] **Step 3: Inspect the screenshots**

Reject the change if either wooden base shows radial black triangles, material flicker, missing faces, physical overlap, or a side-standing result.
