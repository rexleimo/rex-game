export interface FirstPlayStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const COMPLETED_VALUE = 'completed';

/** Keep the first-play policy independent from any individual game's progress save. */
export function hasCompletedFirstPlay(storage: FirstPlayStorage, storageKey: string): boolean {
  try {
    return storage.getItem(storageKey) === COMPLETED_VALUE;
  } catch {
    return false;
  }
}

export function completeFirstPlay(storage: FirstPlayStorage, storageKey: string): void {
  try {
    storage.setItem(storageKey, COMPLETED_VALUE);
  } catch {
    // Private browsing or a full quota should not prevent someone from playing.
  }
}
