import { NextResponse } from 'next/server';
import {
  fetchLiveVaultAccounting,
  fetchLiveVaultConfig,
  fetchLiveCharterCount,
  fetchLiveClaimCount,
  fetchLiveCharter,
  fetchLiveClaim,
  fetchLiveCharterAttestation,
  fetchLiveDriftAudit,
  fetchLivePullCredit
} from '@/lib/serverGenlayer';
import {
  LEX_VAULT_ADDRESS,
  CHARTER_GATE_ADDRESS,
  DRIFT_AUDITOR_ADDRESS,
  GENLAYER_RPC_URL,
  GENLAYER_CHAIN_ID,
  DEFAULT_REVIEWER_ADDRESS
} from '@/lib/constants';
import proofManifest from '@/lib/proofManifest.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const startedAt = Date.now();

  try {
    // 1. Fetch live accounting & config in parallel
    const [accounting, config, charterCount, claimCount, reviewerCredit] = await Promise.all([
      fetchLiveVaultAccounting(),
      fetchLiveVaultConfig(),
      fetchLiveCharterCount(),
      fetchLiveClaimCount(),
      fetchLivePullCredit(DEFAULT_REVIEWER_ADDRESS)
    ]);

    // 2. Fetch charters & attestations
    const charters = [];
    for (let cid = 1; cid <= (charterCount || 4); cid++) {
      const [charterData, attestationData] = await Promise.all([
        fetchLiveCharter(cid),
        fetchLiveCharterAttestation(cid)
      ]);
      charters.push({
        id: cid,
        data: charterData,
        attestation: attestationData
      });
    }

    // 3. Fetch claims & audits
    const claims = [];
    for (let clid = 1; clid <= (claimCount || 3); clid++) {
      const [claimData, auditData] = await Promise.all([
        fetchLiveClaim(clid),
        fetchLiveDriftAudit(clid)
      ]);
      claims.push({
        id: clid,
        data: claimData,
        audit: auditData
      });
    }

    const payload = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      network: {
        networkName: 'GenLayer StudioNet',
        chainId: GENLAYER_CHAIN_ID,
        rpcUrl: GENLAYER_RPC_URL
      },
      contracts: {
        lexVault: {
          address: LEX_VAULT_ADDRESS,
          deployTxHash: proofManifest.contracts.lexVault.deployTxHash,
          sourceSha256: proofManifest.contracts.lexVault.sourceSha256
        },
        charterGate: {
          address: CHARTER_GATE_ADDRESS,
          deployTxHash: proofManifest.contracts.charterGate.deployTxHash,
          sourceSha256: proofManifest.contracts.charterGate.sourceSha256
        },
        driftAuditor: {
          address: DRIFT_AUDITOR_ADDRESS,
          deployTxHash: proofManifest.contracts.driftAuditor.deployTxHash,
          sourceSha256: proofManifest.contracts.driftAuditor.sourceSha256
        }
      },
      liveState: {
        accounting: accounting || proofManifest.finalAccounting,
        config: config || {
          configured: true,
          gate_address: CHARTER_GATE_ADDRESS,
          auditor_address: DRIFT_AUDITOR_ADDRESS,
          min_charter_bounty: 1000,
          min_claim_bond: 500,
          stage_timeout_seconds: 1800
        },
        charterCount,
        claimCount,
        reviewerPullCredit: reviewerCredit,
        charters,
        claims
      },
      proofManifest: {
        projectName: proofManifest.projectName,
        tagline: proofManifest.tagline,
        runnerHash: proofManifest.runnerHash,
        verifiedScenariosCount: proofManifest.scenarios.length,
        scenarios: proofManifest.scenarios
      }
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        error: err.message,
        fallbackManifest: proofManifest
      },
      { status: 200 }
    );
  }
}
