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
    url: 'https://raw.githubusercontent.com/hashicorp/terraform/c10eb21b390627a6259eef9cd883e6ddeccc5716/LICENSE',
    covenant: 'The software repository LICENSE must remain under the Mozilla Public License 2.0 (MPL-2.0) and must not transition to a Business Source License (BSL) or prohibit competitive commercial offerings.',
    bountyWei: 1000,
    expectedOutcome: 'ADMISSIBLE (Case 4 Baseline)'
  },
  {
    id: 'benign-revision-express',
    title: 'Benign-Revision Baseline (Express.js v4.18.2 MIT)',
    description: 'Permissive MIT grant protected against commercial usage restrictions.',
    url: 'https://raw.githubusercontent.com/expressjs/express/8368dc178af16b91b576c4c1d135f701a0007e5d/Readme.md',
    covenant: 'The project README must explicitly maintain the MIT License grant under the License section without adding commercial usage restrictions.',
    bountyWei: 1000,
    expectedOutcome: 'ADMISSIBLE (Case 2 Baseline)'
  },
  {
    id: 'vague-covenant-rejection',
    title: 'Vague Covenant Test (Rejected by CharterGate)',
    description: 'Intentionally vague subjective language lacking falsifiable condition.',
    url: 'https://raw.githubusercontent.com/expressjs/express/8368dc178af16b91b576c4c1d135f701a0007e5d/Readme.md',
    covenant: 'Keep the framework fast, modern, and developer-friendly at all times.',
    bountyWei: 1000,
    expectedOutcome: 'REJECTED (Case 1 Vague Covenant)'
  }
];

export const EVIDENCE_PRESETS = [
  {
    id: 'tf-v160-bsl',
    title: 'Terraform v1.6.0 BSL-1.1 Snapshot (40-Hex SHA)',
    charterId: 3,
    url: 'https://raw.githubusercontent.com/hashicorp/terraform/edb8ea4baa43421a73d7ba50fed957e6be599b45/LICENSE',
    description: 'Material shift introducing Business Source License 1.1 restricting competitive commercial production.',
    verbatimShift: 'Mozilla Public License v2.0 -> Business Source License 1.1',
    expectedVerdict: 'MATERIAL_DRIFT (Payout Settled)'
  },
  {
    id: 'express-v4191',
    title: 'Express.js v4.19.1 Snapshot (40-Hex SHA)',
    charterId: 2,
    url: 'https://raw.githubusercontent.com/expressjs/express/4f0f6cc67d531431c096ea006c2191b92931bbc3/Readme.md',
    description: 'Benign maintenance update preserving original MIT licensing terms in full.',
    verbatimShift: 'Protocol URL modernization without modifying MIT license grant',
    expectedVerdict: 'BENIGN_REVISION (Challenger Bond Forfeited)'
  },
  {
    id: 'naughty-adversarial',
    title: 'Adversarial Naughty Strings Snapshot (40-Hex SHA)',
    charterId: 2,
    url: 'https://raw.githubusercontent.com/minimaxir/big-list-of-naughty-strings/db33ec7b1d5d9616a88c76394b7d0897bd0b97eb/README.md',
    description: 'Completely unrelated adversarial payload testing subject-matter boundary enforcement.',
    verbatimShift: 'Unrelated subject matter; fails same_subject predicate',
    expectedVerdict: 'REJECTED_EVIDENCE (Challenger Bond Forfeited)'
  }
];
