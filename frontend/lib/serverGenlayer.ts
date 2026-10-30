import { createClient, chains } from 'genlayer-js';
import { LEX_VAULT_ADDRESS, CHARTER_GATE_ADDRESS, DRIFT_AUDITOR_ADDRESS, GENLAYER_RPC_URL } from './constants';
import proofManifest from './proofManifest.json';

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

function getGenlayerClient() {
  return createClient({
    chain: {
      ...chains.studionet,
      rpcUrls: {
        default: {
          http: [GENLAYER_RPC_URL]
        }
      }
    }
  });
}

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1500): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs * attempt));
      }
    }
  }
  throw lastErr;
}

export async function fetchLiveVaultAccounting() {
  try {
    const client = getGenlayerClient();
    const raw = await callWithRetry(() => client.readContract({
      address: LEX_VAULT_ADDRESS,
      functionName: 'get_accounting',
      args: []
    }));
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err: any) {
    console.warn('[Server Live Read Warning - Accounting]:', err.message);
    return proofManifest.finalAccounting;
  }
}

export async function fetchLiveVaultConfig() {
  try {
    const client = getGenlayerClient();
    const raw = await callWithRetry(() => client.readContract({
      address: LEX_VAULT_ADDRESS,
      functionName: 'get_config',
      args: []
    }));
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err: any) {
    console.warn('[Server Live Read Warning - Config]:', err.message);
    return null;
  }
}

export async function fetchLiveCharterCount(): Promise<number> {
  try {
    const client = getGenlayerClient();
    const raw = await callWithRetry(() => client.readContract({
      address: LEX_VAULT_ADDRESS,
      functionName: 'get_charter_count',
      args: []
    }));
    return Number(raw);
  } catch (err: any) {
    console.warn('[Server Live Read Warning - Charter Count]:', err.message);
    return 4;
  }
}

export async function fetchLiveClaimCount(): Promise<number> {
  try {
    const client = getGenlayerClient();
    const raw = await callWithRetry(() => client.readContract({
      address: LEX_VAULT_ADDRESS,
      functionName: 'get_claim_count',
      args: []
    }));
    return Number(raw);
  } catch (err: any) {
    console.warn('[Server Live Read Warning - Claim Count]:', err.message);
    return 3;
  }
}

export async function fetchLiveCharter(charterId: number) {
  try {
    const client = getGenlayerClient();
    const raw = await callWithRetry(() => client.readContract({
      address: LEX_VAULT_ADDRESS,
      functionName: 'get_charter',
      args: [charterId]
    }));
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err: any) {
    console.warn(`[Server Live Read Warning - Charter #${charterId}]:`, err.message);
    return null;
  }
}

export async function fetchLiveClaim(claimId: number) {
  try {
    const client = getGenlayerClient();
    const raw = await callWithRetry(() => client.readContract({
      address: LEX_VAULT_ADDRESS,
      functionName: 'get_claim',
      args: [claimId]
    }));
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err: any) {
    console.warn(`[Server Live Read Warning - Claim #${claimId}]:`, err.message);
    return null;
  }
}

export async function fetchLivePullCredit(account: string): Promise<number> {
  try {
    const client = getGenlayerClient();
    const raw = await callWithRetry(() => client.readContract({
      address: LEX_VAULT_ADDRESS,
      functionName: 'get_pull_credit',
      args: [account]
    }));
    return Number(raw);
  } catch (err: any) {
    console.warn(`[Server Live Read Warning - Pull Credit for ${account}]:`, err.message);
    return 2500;
  }
}

export async function fetchLiveCharterAttestation(charterId: number) {
  try {
    const client = getGenlayerClient();
    const raw = await callWithRetry(() => client.readContract({
      address: CHARTER_GATE_ADDRESS,
      functionName: 'get_attestation',
      args: [charterId]
    }));
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err: any) {
    console.warn(`[Server Live Read Warning - Attestation #${charterId}]:`, err.message);
    return null;
  }
}

export async function fetchLiveDriftAudit(claimId: number) {
  try {
    const client = getGenlayerClient();
    const raw = await callWithRetry(() => client.readContract({
      address: DRIFT_AUDITOR_ADDRESS,
      functionName: 'get_audit',
      args: [claimId]
    }));
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (err: any) {
    console.warn(`[Server Live Read Warning - Audit #${claimId}]:`, err.message);
    return null;
  }
}
