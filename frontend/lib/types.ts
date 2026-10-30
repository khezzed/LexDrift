export interface AccountingState {
  total_escrow: number;
  total_credits: number;
  total_pending_outbound: number;
  total_value_locked: number;
  invariant_valid: boolean;
}

export interface ConfigState {
  bootstrapper: string;
  gate_address: string;
  auditor_address: string;
  configured: boolean;
  min_charter_bounty: number;
  min_claim_bond: number;
  stage_timeout_seconds: number;
}

export interface CharterGateAttestation {
  charter_id: number;
  observable_criterion: boolean;
  specific_scope: boolean;
  falsifiable_condition: boolean;
  baseline_entails_guarantee: boolean;
  admissible: boolean;
  baseline_quote: string;
  baseline_digest: string;
  reason: string;
}

export interface Charter {
  charter_id: number;
  sponsor: string;
  baseline_url: string;
  covenant_rule: string;
  bounty: number;
  created_at: number;
  status: 'PENDING_ATTESTATION' | 'ACTIVE' | 'SETTLED_DRIFT' | 'REJECTED_CHARTER' | 'EXPIRED_UNATTESTED' | 'EXPIRED_DRAINED';
  deadline: number;
  baseline_quote?: string;
  baseline_digest?: string;
  rejection_reason?: string;
}

export interface DriftAuditVerdict {
  claim_id: number;
  charter_id: number;
  same_subject: boolean;
  chronology_valid: boolean;
  baseline_granted_right: boolean;
  candidate_modifies_clause: boolean;
  materially_adverse_shift: boolean;
  not_carved_out: boolean;
  verdict: 'MATERIAL_DRIFT' | 'BENIGN_REVISION' | 'REJECTED_EVIDENCE';
  candidate_quote: string;
  candidate_digest: string;
  closure_basis: string;
  explanation: string;
}

export interface Claim {
  claim_id: number;
  charter_id: number;
  challenger: string;
  commitment_hash: string;
  candidate_url?: string;
  salt?: string;
  bond: number;
  status: 'SEALED' | 'DISCLOSED' | 'SETTLED_MATERIAL_DRIFT' | 'REJECTED_BENIGN_REVISION' | 'REJECTED_EVIDENCE' | 'EXPIRED_UNDISCLOSED';
  verdict?: string;
  created_at: number;
  reveal_deadline: number;
  audit_deadline: number;
  candidate_quote?: string;
  candidate_digest?: string;
  closure_basis?: string;
}

export interface WithdrawalRecord {
  withdrawal_id: number;
  recipient: string;
  amount: number;
  requested_at: number;
  status: 'REQUESTED' | 'RECONCILED' | 'CANCELLED';
  parent_tx_hash?: string;
  child_tx_hash?: string;
}

export interface ProofScenario {
  id: string;
  title: string;
  charterId?: number;
  claimId?: number;
  txHash: string;
  workerTxHash?: string;
  charterOpenTx?: string;
  charterAttestTx?: string;
  claimSealTx?: string;
  claimDiscloseTx?: string;
  driftAuditTx?: string;
  requestWithdrawalTx?: string;
  reconcileWithdrawalTx?: string;
  advanceTimeTx?: string;
  expireStageTx?: string;
  outcome: string;
  statusOnChain?: string;
  claimStatus?: string;
  charterStatus?: string;
  bounty?: number;
  augmentedBounty?: number;
  sponsorRefundCredit?: number;
  payoutAmount?: number;
  bountyAfterTimeout?: number;
  reason?: string;
  baselineQuote?: string;
  closureBasis?: string;
  withdrawalStatus?: string;
  accountingInvariantValid: boolean;
  explorerLink: string;
}

export interface ProofManifest {
  projectName: string;
  tagline: string;
  gitCommit?: string;
  commitSha?: string;
  network: {
    networkName: string;
    chainId: number;
    rpcUrl: string;
  };
  runnerHash: string;
  contracts: {
    lexVault: {
      address: string;
      deployTxHash: string;
      sourceSha256: string;
      onChainSha256: string;
      verified: boolean;
    };
    charterGate: {
      address: string;
      deployTxHash: string;
      sourceSha256: string;
      onChainSha256: string;
      verified: boolean;
    };
    driftAuditor: {
      address: string;
      deployTxHash: string;
      sourceSha256: string;
      onChainSha256: string;
      verified: boolean;
    };
  };
  bootstrapping: {
    configureTxHash: string;
    bootstrapper: string;
    stageTimeoutSeconds: number;
  };
  scenarios: ProofScenario[];
  accountingLog: any[];
  updatedAt: string;
  finalAccounting: AccountingState;
}

export type TxStepState = 'submitted' | 'pending' | 'accepted' | 'finalized-success' | 'finalized-error';

export interface TrackedTx {
  hash: string;
  action: string;
  step: TxStepState;
  submittedAt: number;
  acceptedAt?: number;
  appealWindowEndsAt?: number;
  finalizedAt?: number;
  error?: string;
  details?: Record<string, any>;
}
