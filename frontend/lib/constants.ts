export const LEX_VAULT_ADDRESS = (process.env.NEXT_PUBLIC_LEX_VAULT_ADDRESS || '0x270BBA964dB0C88363de6986Ef8D88090864456b') as `0x${string}`;
export const CHARTER_GATE_ADDRESS = (process.env.NEXT_PUBLIC_CHARTER_GATE_ADDRESS || '0xa7ae55747b61d4Eb9d7024F0C19bd6499262c51c') as `0x${string}`;
export const DRIFT_AUDITOR_ADDRESS = (process.env.NEXT_PUBLIC_DRIFT_AUDITOR_ADDRESS || '0xB6C7bC7cbd182c90cbc814Ec3d80CCEc604E600d') as `0x${string}`;
export const GENLAYER_RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';
export const GENLAYER_CHAIN_ID = Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || 61999);
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer-studio.genlayer.com';

export const DEFAULT_REVIEWER_ADDRESS = '0xc130A7a4C4F22b2644Eaa62F5D13F14c941860aC';

export const CHARTER_PRESETS = [
  {
    id: 'material-drift-tf',
    title: 'Material-Drift Baseline (Terraform v1.5.5 MPL-2.0)',
    description: 'Guarantees open-source terms without restrictive source-available limitations.',
    url: 'https://raw.githubusercontent.com/hashicorp/terraform/v1.5.5/LICENSE',
    covenant: 'The software must remain licensed under Mozilla Public License v2.0 without production commercial use restrictions or source-available clauses.',
    bountyWei: 1000,
    expectedOutcome: 'ADMISSIBLE (Case 4 Baseline)'
  },
  {
    id: 'benign-revision-express',
    title: 'Benign-Revision Baseline (Express.js v4.18.2 MIT)',
    description: 'Permissive MIT grant protected against patent retaliation clauses.',
    url: 'https://raw.githubusercontent.com/expressjs/express/4.18.2/Readme.md',
    covenant: 'The project must maintain its MIT license terms granting unconditional permission to use, copy, modify, merge, publish, distribute, sublicense, and sell.',
    bountyWei: 1000,
    expectedOutcome: 'ADMISSIBLE (Case 2 Baseline)'
  },
  {
    id: 'vague-covenant-rejection',
    title: 'Vague Covenant Test (Rejected by CharterGate)',
    description: 'Intentionally vague subjective language lacking falsifiable condition.',
    url: 'https://raw.githubusercontent.com/hashicorp/terraform/v1.5.5/LICENSE',
    covenant: 'The maintainers will always act ethically and in good faith toward community contributors.',
    bountyWei: 1000,
    expectedOutcome: 'REJECTED (Case 1 Vague Covenant)'
  }
];

export const EVIDENCE_PRESETS = [
  {
    id: 'tf-v160-bsl',
    title: 'Terraform v1.6.0 BSL-1.1 Snapshot',
    charterId: 3,
    url: 'https://raw.githubusercontent.com/hashicorp/terraform/v1.6.0/LICENSE',
    description: 'Material shift introducing Business Source License 1.1 restricting competitive commercial production.',
    verbatimShift: 'Mozilla Public License v2.0 -> Business Source License 1.1',
    expectedVerdict: 'MATERIAL_DRIFT (Payout Settled)'
  },
  {
    id: 'express-v4191',
    title: 'Express.js v4.19.1 Security Bump Snapshot',
    charterId: 2,
    url: 'https://raw.githubusercontent.com/expressjs/express/4.19.1/Readme.md',
    description: 'Benign maintenance update preserving original MIT licensing terms in full.',
    verbatimShift: 'Dependency security bump without modifying license grant',
    expectedVerdict: 'BENIGN_REVISION (Challenger Bond Forfeited)'
  },
  {
    id: 'naughty-adversarial',
    title: 'Adversarial Naughty Strings Snapshot',
    charterId: 2,
    url: 'https://raw.githubusercontent.com/minimaxir/big-list-of-naughty-strings/master/blns.base64.txt',
    description: 'Completely unrelated adversarial payload testing subject-matter boundary enforcement.',
    verbatimShift: 'Unrelated subject matter; fails same_subject predicate',
    expectedVerdict: 'REJECTED_EVIDENCE (Challenger Bond Forfeited)'
  }
];
