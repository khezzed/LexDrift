import { TrackedTx, TxStepState } from './types';

const STORAGE_KEY = 'lexdrift_tracked_transactions_v1';

export function getTrackedTransactions(): TrackedTx[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTrackedTransactions(txs: TrackedTx[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
  } catch (err) {
    console.error('Failed to save tracked transactions', err);
  }
}

export function addTrackedTransaction(
  hash: string,
  action: string,
  details?: Record<string, any>
): TrackedTx {
  const existing = getTrackedTransactions();
  const newTx: TrackedTx = {
    hash,
    action,
    step: 'submitted',
    submittedAt: Date.now(),
    details
  };
  const updated = [newTx, ...existing.filter(t => t.hash !== hash)];
  saveTrackedTransactions(updated);
  return newTx;
}

export function updateTrackedTransaction(
  hash: string,
  step: TxStepState,
  meta?: Partial<TrackedTx>
): TrackedTx | null {
  const existing = getTrackedTransactions();
  const idx = existing.findIndex(t => t.hash.toLowerCase() === hash.toLowerCase());
  if (idx === -1) return null;

  const current = existing[idx];
  const now = Date.now();

  const updated: TrackedTx = {
    ...current,
    ...meta,
    step,
    acceptedAt: step === 'accepted' && !current.acceptedAt ? now : current.acceptedAt,
    // GenLayer StudioNet appeal window typically 10-30s
    appealWindowEndsAt:
      step === 'accepted' && !current.appealWindowEndsAt
        ? now + 15000
        : current.appealWindowEndsAt,
    finalizedAt:
      (step === 'finalized-success' || step === 'finalized-error') && !current.finalizedAt
        ? now
        : current.finalizedAt
  };

  existing[idx] = updated;
  saveTrackedTransactions(existing);
  return updated;
}
