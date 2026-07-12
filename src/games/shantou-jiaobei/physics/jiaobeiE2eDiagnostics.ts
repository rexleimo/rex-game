export type JiaobeiE2eStatus = 'idle' | 'throwing' | 'settled' | 'disposed';

export interface JiaobeiE2eScreenBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface JiaobeiE2ePieceSnapshot {
  index: number;
  landed: boolean;
  assistCount: number;
  upDot: number;
  position: { x: number; y: number; z: number };
  screenBounds: JiaobeiE2eScreenBounds;
}

export interface JiaobeiE2eEvent {
  sequence: number;
  type: 'throw-start' | 'attempt-start' | 'impact' | 'assist' | 'retry' | 'settled' | 'dispose';
  atMs: number;
  attempt?: number;
  pieceIndex?: number;
  magnitude?: number;
  reason?: string;
}

export interface JiaobeiE2eSnapshot {
  runId: string;
  status: JiaobeiE2eStatus;
  attemptCount: number;
  retryCount: number;
  activePhysicsElapsedMs: number;
  settlementSampleCount: number;
  stillChecks: number;
  pieces: JiaobeiE2ePieceSnapshot[];
  events: JiaobeiE2eEvent[];
}

export interface JiaobeiE2eDiagnostics {
  startThrow(atMs: number): void;
  startAttempt(attempt: number, atMs: number): void;
  impact(pieceIndex: number, atMs: number): void;
  assist(pieceIndex: number, atMs: number, magnitude: number): void;
  retry(atMs: number, reason: string, activePhysicsElapsedMs: number): void;
  settle(atMs: number, activePhysicsElapsedMs: number): void;
  updateActivePhysics(activePhysicsElapsedMs: number): void;
  updateSettlement(activePhysicsElapsedMs: number, stillChecks: number): void;
  updatePieces(pieces: readonly JiaobeiE2ePieceSnapshot[]): void;
  snapshot(): JiaobeiE2eSnapshot;
  dispose(atMs: number): void;
}

export interface JiaobeiE2eGlobal {
  snapshot(): JiaobeiE2eSnapshot;
}

declare global {
  interface Window {
    __JIAOBEI_E2E__?: JiaobeiE2eGlobal;
  }
}

const MAX_EVENTS = 64;

export function createJiaobeiE2eDiagnostics(
  runId: string,
  ownerWindow?: Window,
): JiaobeiE2eDiagnostics {
  let status: JiaobeiE2eStatus = 'idle';
  let attemptCount = 0;
  let retryCount = 0;
  let activePhysicsElapsedMs = 0;
  let settlementSampleCount = 0;
  let stillChecks = 0;
  let pieces: JiaobeiE2ePieceSnapshot[] = [];
  let sequence = 0;
  const events: JiaobeiE2eEvent[] = [];
  let globalFacade: JiaobeiE2eGlobal | undefined;

  const record = (event: Omit<JiaobeiE2eEvent, 'sequence'>) => {
    events.push({ ...event, sequence: ++sequence });
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  };

  const diagnostics: JiaobeiE2eDiagnostics = {
    startThrow(atMs) {
      status = 'throwing';
      attemptCount = 0;
      retryCount = 0;
      activePhysicsElapsedMs = 0;
      settlementSampleCount = 0;
      stillChecks = 0;
      pieces = [];
      events.length = 0;
      sequence = 0;
      record({ type: 'throw-start', atMs });
    },
    startAttempt(attempt, atMs) {
      status = 'throwing';
      attemptCount = Math.max(attemptCount, attempt);
      activePhysicsElapsedMs = 0;
      settlementSampleCount = 0;
      stillChecks = 0;
      pieces = [];
      record({ type: 'attempt-start', atMs, attempt });
    },
    impact(pieceIndex, atMs) {
      record({ type: 'impact', atMs, pieceIndex });
    },
    assist(pieceIndex, atMs, magnitude) {
      record({ type: 'assist', atMs, pieceIndex, magnitude });
    },
    retry(atMs, reason, elapsedMs) {
      retryCount++;
      activePhysicsElapsedMs = elapsedMs;
      record({ type: 'retry', atMs, reason });
    },
    settle(atMs, elapsedMs) {
      status = 'settled';
      activePhysicsElapsedMs = elapsedMs;
      record({ type: 'settled', atMs });
    },
    updateActivePhysics(elapsedMs) {
      activePhysicsElapsedMs = elapsedMs;
    },
    updateSettlement(elapsedMs, nextStillChecks) {
      activePhysicsElapsedMs = elapsedMs;
      settlementSampleCount++;
      stillChecks = nextStillChecks;
    },
    updatePieces(nextPieces) {
      pieces = nextPieces.map((piece) => ({
        ...piece,
        position: { ...piece.position },
        screenBounds: { ...piece.screenBounds },
      }));
    },
    snapshot() {
      return {
        runId,
        status,
        attemptCount,
        retryCount,
        activePhysicsElapsedMs,
        settlementSampleCount,
        stillChecks,
        pieces: pieces.map((piece) => ({
          ...piece,
          position: { ...piece.position },
          screenBounds: { ...piece.screenBounds },
        })),
        events: events.map((event) => ({ ...event })),
      };
    },
    dispose(atMs) {
      if (status === 'throwing') record({ type: 'dispose', atMs });
      status = 'disposed';
      if (ownerWindow && ownerWindow.__JIAOBEI_E2E__ === globalFacade) {
        delete ownerWindow.__JIAOBEI_E2E__;
      }
    },
  };

  if (ownerWindow) {
    globalFacade = { snapshot: () => diagnostics.snapshot() };
    ownerWindow.__JIAOBEI_E2E__ = globalFacade;
  }
  return diagnostics;
}

export function installJiaobeiE2eDiagnostics(): JiaobeiE2eDiagnostics | null {
  if (typeof window === 'undefined') return null;
  const runId = new URL(window.location.href).searchParams.get('e2e');
  if (!runId) return null;
  return createJiaobeiE2eDiagnostics(runId, window);
}
