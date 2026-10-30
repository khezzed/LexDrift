# LexDrift Deployment Ledger & Network Manifest

> **Network**: GenLayer StudioNet  
> **Chain ID**: `61999`  
> **RPC Endpoint**: `https://studio.genlayer.com/api`  
> **GenLayer Runner Hash**: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`  
> **Deployer Address**: `0xc130A7a4C4F22b2644Eaa62F5D13F14c941860aC`  
> **Deployment Timestamp**: `2026-10-30T21:56:44.440Z`

---

## 1. Verified Contract Deployments

| Contract | Address | Deploy Tx Hash | Explorer Link | Source Bytecode SHA-256 Digest |
| :--- | :--- | :--- | :--- | :--- |
| **`LexVault`** | `0x270BBA964dB0C88363de6986Ef8D88090864456b` | `0x66246c703c419e2394401ad0c53a66fee9518b0db35a6ea3775ac2b52d6d0c86` | [View LexVault on Explorer](https://explorer-studio.genlayer.com/address/0x270BBA964dB0C88363de6986Ef8D88090864456b) | `76efab36bbd714c2e606598317ae3005de757a5862f149f8b668f31147b6ba72` |
| **`CharterGate`** | `0xa7ae55747b61d4Eb9d7024F0C19bd6499262c51c` | `0xab2389771250a24fcaa2f42d6b3833bd4c7e0aba72fa48460ee9eb6ba66246b0` | [View CharterGate on Explorer](https://explorer-studio.genlayer.com/address/0xa7ae55747b61d4Eb9d7024F0C19bd6499262c51c) | `c2bb2e2ed4130b56741eebe435f0039bb423c24666cb21ce11206d8badee299d` |
| **`DriftAuditor`** | `0xB6C7bC7cbd182c90cbc814Ec3d80CCEc604E600d` | `0x589fbe5c1e6e8bc234b9ec0d91a3476bf12df5e359726ad57d4b3f28706d0557` | [View DriftAuditor on Explorer](https://explorer-studio.genlayer.com/address/0xB6C7bC7cbd182c90cbc814Ec3d80CCEc604E600d) | `748403821c926264f9767510037331fae6b67528a69d76b88cde5142accb67cc` |

---

## 2. Two-Phase Bootstrap Configuration

The two-phase bootstrap irreversibly bound `CharterGate` and `DriftAuditor` to `LexVault` and destroyed the bootstrapper key:

- **Configure Transaction Hash**: [`0x83ace986013f4e5938b356edb9c0d9966c94507cd60d468d64c641efad3f3749`](https://explorer-studio.genlayer.com/tx/0x83ace986013f4e5938b356edb9c0d9966c94507cd60d468d64c641efad3f3749)
- **Status**: `FINALIZED` (Consensus: `AGREED`, Execution Result: `SUCCESS`)
- **Stage Timeout Configured**: `1,800` seconds (30 minutes)
- **Post-Bootstrap Bootstrapper Field**: `""` (Empty string, permanently immutable)

---

## 3. Real-World Acceptance Scenarios Transaction Ledger

| Scenario | Target Covenant & Test Scope | Action Transaction Hashes | Outcome & Payout |
| :--- | :--- | :--- | :--- |
| **Case 1: Vague Covenant** | Vague pledge: *"be developer friendly"* | Open: `0x4a19aa...364e`<br>Worker: `0x8c63e1...c56c` | **`REJECTED_CHARTER`**<br>1,000 wei deposit refunded to sponsor pull credit |
| **Case 2: Benign Revision** | Express.js README commit: `git://` $\to$ `https://` repo URL update | Open: `0x08704e...eb51`<br>Attest: `0x790cf9...7484`<br>Seal: `0xd07209...ccde`<br>Disclose: `0xac4da6...9e24`<br>Audit: `0xc78d92...e81c` | **`BENIGN_REVISION`**<br>500 wei challenger bond forfeited to Charter #2 bounty pool ($1,000 \to 1,500$ wei) |
| **Case 3: Unrelated Evidence** | Big List of Naughty Strings prompt injection & unrelated text | Seal: `0x8c1410...16cc`<br>Disclose: `0xf06a75...01ca`<br>Audit: `0xea986f...f437` | **`REJECTED_EVIDENCE`**<br>500 wei bond forfeited directly to sponsor pull credit |
| **Case 4: Verified Drift** | HashiCorp Terraform `v1.5.5` (MPL-2.0) $\to$ `v1.6.0` (BSL-1.1 transition) | Open: `0x2588e7...a319`<br>Attest: `0x5e7566...57d8`<br>Seal: `0x11dd8c...337c`<br>Disclose: `0x820026...a007`<br>Audit: `0x64d0bb...5125`<br>Withdraw: `0x7e867b...e48d`<br>Reconcile: `0xa0bdfa...3315` | **`MATERIAL_DRIFT`**<br>1,500 wei (1,000 bounty + 500 bond) credited, pulled, and reconciled on-chain |
| **Case 5: Stage Timeout** | Unattested Charter #4 stage deadline timeout | Open: `0xe8370f...cddd`<br>Advance: `0x7b14a4...7ef0`<br>Expire: `0x0e4c3c...accb` | **`EXPIRED_UNATTESTED`**<br>1,000 wei deposit refunded to sponsor pull credit |

---

## 4. How to Deploy to a New Network

To deploy a fresh instance of LexDrift to StudioNet or localnet:

```bash
# 1. Install dependencies
npm install

# 2. Deploy all 3 contracts and execute two-phase bootstrap
npm run deploy:studionet

# 3. Run end-to-end acceptance scenarios
npm run e2e:studionet

# 4. Verify proofs
npm run verify:proof
```
