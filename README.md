# LexDrift: Autonomous Legal, License & Governance Policy Drift Sentinel on GenLayer

> **Decentralized, comparative multi-snapshot policy sentinel powered by GenLayer Intelligent Contracts.**
> Automatically detects, adjudicates, and settles retroactive license changes, terms-of-service rugpulls, and governance charter drift using decentralized LLM validators and deterministic escrow accounting.

[![StudioNet Deployed](https://img.shields.io/badge/StudioNet-61999-brightgreen.svg)](https://explorer-studio.genlayer.com/address/0x270BBA964dB0C88363de6986Ef8D88090864456b)
[![GitHub Repository](https://img.shields.io/badge/GitHub-khezzed%2FLexDrift-181717.svg?logo=github)](https://github.com/khezzed/LexDrift)
[![GenLayer Contracts](https://img.shields.io/badge/GenLayer-py--genlayer-blue.svg)](https://docs.genlayer.com)
[![Direct Tests](https://img.shields.io/badge/Tests-18%20Passed-success.svg)](tests/direct)
[![Conservation Invariant](https://img.shields.io/badge/Accounting-Conserved%20100%25-orange.svg)](#financial-architecture--conservation-invariant)

---

## Executive Summary

When projects like **Terraform**, **Redis**, and **Elasticsearch** transitioned from permissive open-source licenses (MPL-2.0, BSD-3, Apache-2.0) to restrictive proprietary or source-available licenses (BSL-1.1, SSPL), downstream ecosystems suffered massive governance disruptions. Traditional smart contracts cannot prevent or detect this because they cannot read the web, cannot parse human legal prose, and cannot semantically compare document revisions. 

Standard git diff tools also fail: they flag irrelevant formatting changes, commit hash bumps, and typo corrections while remaining blind to subtle legal revocations or prompt injections embedded in repository updates.

**LexDrift** solves this foundational problem by deploying a 3-contract decentralized sentinel architecture on GenLayer:
1. **`LexVault`** (Deterministic Economic Core): Custodies GEN bounties and challenger bonds, implements a commit-reveal FIFO queue to prevent front-running, enforces a mathematical conservation invariant ($Escrow + Credits + Pending == TVL$), and provides asynchronous pull-payment withdrawals and stage deadline timeout recovery.
2. **`CharterGate`** (RuleGate & Baseline Attestation Worker): Evaluates human covenant submissions against immutable baseline snapshots ($T_0$). Enforces a strict 4-boolean admissibility gate (`observable_criterion`, `specific_scope`, `falsifiable_condition`, `baseline_entails_guarantee`) and validates verbatim substring quotes, instantly rejecting vague, aspirational covenants and refunding sponsor deposits.
3. **`DriftAuditor`** (Comparative Policy Drift Engine): Audits candidate revision snapshots ($T_1$) against frozen baseline snapshots ($T_0$). Executes a 6-boolean predicate evaluation (`same_subject`, `chronology_valid`, `baseline_granted_right`, `candidate_modifies_clause`, `materially_adverse_shift`, `not_carved_out`) and emits a deterministic `closure_basis` digest, distinguishing genuine material drift (e.g. HashiCorp's MPL $\to$ BSL change) from benign link updates and prompt injection attacks.

---

## Architecture

LexDrift strictly separates **deterministic financial state** from **non-deterministic LLM consensus**. Financial custody never depends on LLM nondeterminism, and decentralized validators reach absolute consensus over boolean predicates and cryptographic slice digests rather than free-form natural language.

### Mermaid Topology Diagram

```mermaid
flowchart TD
    subgraph "External Actors"
        SP[Sponsor / DAO Treasury]
        CH[Challenger / Sentinel Auditor]
    end

    subgraph "Deterministic Financial Core"
        LV["LexVault (0x270B...456b)
        - Custodies Escrow & Bonds
        - Invariant: Escrow + Credits + Pending == TVL
        - Commit-Reveal Queue
        - Pull Withdrawal & Timeout Recovery"]
    end

    subgraph "Decentralized LLM Consensus Workers"
        CG["CharterGate (0xa7ae...c51c)
        - 4-Boolean RuleGate
        - Verbatim Substring Quote Check
        - Fetches & Hashes T0 Baseline"]
        DA["DriftAuditor (0xB6C7...600d)
        - 6-Boolean Comparative Engine
        - Fetches T0 & T1 Web Snapshots
        - Short-circuits on Identical Byte Hashes
        - Deterministic closure_basis Digest"]
    end

    subgraph "Cryptographic Web Sources"
        GH["GitHub Raw (Pinned 40-char SHA)"]
        WK["Wikipedia Action API (Numeric oldid)"]
        IA["Wayback Machine (Verbatim id_ Snapshot)"]
    end

    %% Sponsor flow
    SP -->|1. open_charter(deposit, T0_url, covenant)| LV
    LV -->|2. emit: attest_charter(id, url, covenant)| CG
    CG -->|3. nondet web.get(T0)| GH
    CG -->|4. nondet exec_prompt(4 booleans)| CG
    CG -->|5. emit: record_charter_attestation(id, result)| LV

    %% Challenger flow
    CH -->|6. seal_claim(bond, commitment_hash)| LV
    CH -->|7. disclose_claim(id, T1_url, salt)| LV
    LV -->|8. emit: audit_drift(claim_id, T0, T1, rule)| DA
    DA -->|9. nondet web.get(T0 & T1)| GH
    DA -->|10. nondet exec_prompt(6 booleans)| DA
    DA -->|11. emit: record_drift_verdict(id, verdict)| LV

    %% Settlement
    LV -->|12. Settle Bounty + Bond / Forfeit Bond / Rollback| LV
    CH -->|13. request_withdrawal & reconcile_withdrawal| CH
```

### Clean ASCII Architecture

```text
===================================================================================================
                                      LEXDRIFT ARCHITECTURE
===================================================================================================

  SPONSOR (DAO / Foundation)                          CHALLENGER (Sentinel Auditor)
       │                                                          │
       │ 1. open_charter(deposit, T0_url, covenant)               │ 6. seal_claim(bond, commit_hash)
       ▼                                                          │ 7. disclose_claim(id, T1_url, salt)
 ┌─────────────────────────────────────────────────────────────┐  ▼
 │                         LEXVAULT                            │◄─┘
 │       (Deterministic Economic Core: 0x270B...456b)          │
 │                                                             │
 │  • Enforces Conservation Invariant:                         │
 │      total_escrow + total_credits + pending == TVL          │
 │  • Commit-Reveal FIFO Claim Queue (Front-Running Protected) │
 │  • Two-Step Pull Payments: request_withdrawal() + reconcile │
 │  • Stage Deadline Timeout Recovery: expire_stage()          │
 └──────────────┬──────────────────────────────┬───────────────┘
                │                              │
 2. emit        │                              │ 8. emit
    attest_     │                              │    audit_drift()
    charter()   ▼                              ▼
 ┌─────────────────────────────┐┌─────────────────────────────┐
 │        CHARTERGATE          ││        DRIFTAUDITOR         │
 │ (RuleGate: 0xa7ae...c51c)   ││ (Drift Engine: 0xB6C7..00d) │
 │                             ││                             │
 │ • Web Fetch T0 Baseline     ││ • Web Fetch T0 & T1         │
 │ • Prompt Injection Defense  ││ • Byte Hash Short-Circuit   │
 │ • 4 Strict Booleans:        ││ • 6 Strict Booleans:        │
 │    - observable_criterion   ││    - same_subject           │
 │    - specific_scope         ││    - chronology_valid       │
 │    - falsifiable_condition  ││    - baseline_granted_right │
 │    - baseline_entails_guar. ││    - candidate_modifies     │
 │ • Verbatim Quote (8-300 ch) ││    - materially_adverse     │
 │                             ││    - not_carved_out         │
 │ • Leader/Validator Consensus││ • Deterministic closure_base│
 └──────────────┬──────────────┘└──────────────┬──────────────┘
                │ 5. emit record_attestation() │ 11. emit record_verdict()
                └───────────────► ◄────────────┘
```

---

## Verified StudioNet Deployment

LexDrift is fully deployed, configured, and verified live on **GenLayer StudioNet** (Chain ID: `61999`, Runner Hash: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`).

| Contract Name | On-Chain Address | Deployment Tx Hash | Explorer Link | Source Bytecode SHA-256 Digest |
| :--- | :--- | :--- | :--- | :--- |
| **`LexVault`** | `0x270BBA964dB0C88363de6986Ef8D88090864456b` | `0x66246c703c419e2394401ad0c53a66fee9518b0db35a6ea3775ac2b52d6d0c86` | [View LexVault](https://explorer-studio.genlayer.com/address/0x270BBA964dB0C88363de6986Ef8D88090864456b) | `76efab36bbd714c2e606598317ae3005de757a5862f149f8b668f31147b6ba72` |
| **`CharterGate`** | `0xa7ae55747b61d4Eb9d7024F0C19bd6499262c51c` | `0xab2389771250a24fcaa2f42d6b3833bd4c7e0aba72fa48460ee9eb6ba66246b0` | [View CharterGate](https://explorer-studio.genlayer.com/address/0xa7ae55747b61d4Eb9d7024F0C19bd6499262c51c) | `c2bb2e2ed4130b56741eebe435f0039bb423c24666cb21ce11206d8badee299d` |
| **`DriftAuditor`** | `0xB6C7bC7cbd182c90cbc814Ec3d80CCEc604E600d` | `0x589fbe5c1e6e8bc234b9ec0d91a3476bf12df5e359726ad57d4b3f28706d0557` | [View DriftAuditor](https://explorer-studio.genlayer.com/address/0xB6C7bC7cbd182c90cbc814Ec3d80CCEc604E600d) | `748403821c926264f9767510037331fae6b67528a69d76b88cde5142accb67cc` |

*Two-Phase Bootstrap Configuration Tx:* [`0x83ace986013f4e5938b356edb9c0d9966c94507cd60d468d64c641efad3f3749`](https://explorer-studio.genlayer.com/tx/0x83ace986013f4e5938b356edb9c0d9966c94507cd60d468d64c641efad3f3749) (Binds `CharterGate` and `DriftAuditor` to `LexVault` and permanently wipes the bootstrapper key).

---

## 5 Finalized Live StudioNet Proof Cases

All 5 core architectural scenarios were executed against live StudioNet consensus, producing immutable on-chain state records and preserving the accounting conservation invariant at every step:

| Case # | Scenario Title | Target Scope | Key Tx Hashes | Outcome & Settlement | Invariant Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Case 1** | **Vague Covenant Rejection** (`case_1_vague_covenant`) | Vague covenant: *"We pledge to remain developer friendly and reasonable"* | Charter Tx: [`0x4a19aa...364e`](https://explorer-studio.genlayer.com/tx/0x4a19aa05930ab6412f553b89e5bb252006b60510aef7b73630c1ad98c434364e)<br>Worker Tx: `0x8c63e1...c56c` | **`REJECTED_CHARTER`**<br>Lacks observable/falsifiable criteria. 1,000 wei bounty refunded to sponsor's pull credits. | Valid (`0 + 1000 + 0 == 1000`) |
| **Case 2** | **Benign Revision Rejection** (`case_2_benign_revision`) | Express.js README commit: `git://` $\to$ `https://` repo URL update | Open Tx: `0x08704e...eb51`<br>Attest Tx: `0x790cf9...7484`<br>Audit Tx: [`0xc78d92...e81c`](https://explorer-studio.genlayer.com/tx/0xc78d92edf79ee9602fbf6179dacc15c1cc03874d7089a87484a778de0b9ee81c) | **`BENIGN_REVISION`**<br>Clause modified but not materially adverse. 500 wei bond added to charter bounty pool ($1,000 \to 1,500$ wei). | Valid (`1500 + 1000 + 0 == 2500`) |
| **Case 3** | **Adversarial / Injection Rejection** (`case_3_unrelated_evidence`) | Challenger submitted Naughty Strings prompt injection & unrelated text | Seal Tx: `0x8c1410...16cc`<br>Disclose Tx: `0xf06a75...01ca`<br>Audit Tx: [`0xea986f...f437`](https://explorer-studio.genlayer.com/tx/0xea986f71e3bdb77c50aaa735be07f172a14cd02870a6641a04a9ac22cc5df437) | **`REJECTED_EVIDENCE`**<br>Prompt injection disregarded. 500 wei bond forfeited directly to charter sponsor pull credit. | Valid (`1500 + 1500 + 0 == 3000`) |
| **Case 4** | **Verified Material Drift & Pull Payout** (`case_4_material_drift`) | HashiCorp Terraform `v1.5.5` (MPL-2.0) $\to$ `v1.6.0` (BSL-1.1 transition) | Open Tx: `0x2588e7...a319`<br>Audit Tx: [`0x64d0bb...5125`](https://explorer-studio.genlayer.com/tx/0x64d0bb875cc89f661f78f0ee3c31299948db84fb1fa17596a577672d68f25125)<br>Withdraw Tx: `0x7e867b...e48d`<br>Reconcile Tx: `0xa0bdfa...3315` | **`MATERIAL_DRIFT`**<br>Adverse shift verified. 1,500 wei total payout awarded, requested via pull payment, and reconciled on-chain. | Valid (`1500 + 1500 + 0 == 3000`) |
| **Case 5** | **Stage Deadline Timeout Recovery** (`case_5_stage_timeout`) | Unattested charter exceeding 1,800-second stage deadline | Open Tx: `0xe8370f...cddd`<br>Advance Time: `0x7b14a4...7ef0`<br>Expire Tx: [`0x0e4c3c...accb`](https://explorer-studio.genlayer.com/tx/0x0e4c3c928c387b955aa5b64eb9fcfe9bae91eeb53e0072eee3c363f37975accb) | **`EXPIRED_UNATTESTED`**<br>Stage deadline passed. Bounty cleanly refunded to sponsor pull balance; zero stranded funds. | Valid (`1500 + 2500 + 0 == 4000`) |

### Final StudioNet Accounting Proof State
- **`total_escrow`**: `1500` wei (Charter #2 bounty pool)
- **`total_credits`**: `2500` wei (Refunded sponsor credits + forfeited bond credits)
- **`total_pending_outbound`**: `0` wei
- **`total_value_locked`**: `4000` wei
- **Conservation Equation**: `1500 + 2500 + 0 == 4000` (**`invariant_valid: true`**)

---

## Setup, Local Verification & Reproduction Steps

### 1. Prerequisites
- Node.js $\ge 20.0.0$ and npm
- Python $3.10+$ (with virtual environment or pytest)
- Repository: `git clone https://github.com/khezzed/LexDrift.git && cd LexDrift`

### 2. Direct & Stateful Unit Tests
Run the comprehensive 18-test test suite covering all contract structures, domain logic, URL allowlists, substring quote checks, commit-reveal flows, and invariant protections:
```bash
# In PowerShell:
cd C:\Users\user\AntigravityProfiles\account1\.gemini\antigravity\scratch\lex-drift
& ".\.venv\Scripts\pytest.exe" tests/direct -v
```
*Expected Result:* **18 passed in ~0.30s**.

### 3. StudioNet Proof Manifest Verification
Audit the live StudioNet deployment and all 5 scenarios directly via JSON-RPC using the automated verification script:
```bash
npm run verify:proof
```
The script performs three checks against StudioNet:
1. Compares local contract source files against on-chain deployed bytecode SHA-256 hashes.
2. Queries `get_accounting()` on `LexVault` to confirm that the conservation invariant holds on chain.
3. Audits all 5 scenario transaction receipts, verifying consensus `FINALIZED` status and `execution_result == SUCCESS`.

### 4. Running the Frontend Locally
The interactive LexDrift dashboard visualizes active charters, allows interactive commit-reveal claim submission, live drift diff auditing, and one-click pull withdrawals:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser (API health endpoint available at `http://localhost:3000/api/health`).

### 5. Production Deployment (Vercel)
The Next.js frontend is configured with `frontend/vercel.json` pre-populating all StudioNet environment variables (`NEXT_PUBLIC_*`).
> [!NOTE]
> On Windows, local `vercel build` fails due to symlink resolution. Always deploy using a remote build:
```bash
cd frontend
npx vercel login
npx vercel --prod --yes
```
Upon authentication, Vercel completes the remote build and yields the live production `.vercel.app` deployment.

---

## Release Verification & Commit Hash
- **GitHub Repository**: [https://github.com/khezzed/LexDrift](https://github.com/khezzed/LexDrift)
- **Git Commit SHA**: `efae5c074d0db170dc1f59ae392c2bbe826a6cc7`
- **Proof Manifest**: [`deploy/proof.json`](deploy/proof.json)
- **Local Server**: `http://localhost:3000`
- **GenLayer StudioNet Network**: Chain ID `61999` (RPC: `https://studio.genlayer.com/api`)

---

## Financial Architecture & Conservation Invariant

To ensure institutional solvency and prevent economic exploit vectors, `LexVault` enforces a strict mathematical conservation law across every state-mutating transaction:

$$\text{total\_escrow} + \text{total\_credits} + \text{total\_pending\_outbound} \equiv \text{total\_value\_locked}$$

```python
def _assert_invariant(self) -> None:
    escrow = int(self.total_escrow)
    credits = int(self.total_credits)
    pending = int(self.total_pending_outbound)
    tvl = int(self.total_value_locked)
    if escrow + credits + pending != tvl:
        raise gl.vm.UserError(
            f"INVARIANT_BREACH: escrow({escrow}) + credits({credits}) + pending({pending}) != tvl({tvl})"
        )
```

### Pull-Payment Pattern
Instead of pushing native GEN transfers during drift settlement (which invites reentrancy and out-of-gas griefing), `LexVault` records payouts into user-controlled `pull_credits`. Beneficiaries withdraw their balance in two stages:
1. `request_withdrawal(amount)`: Deducts from `pull_credits`, adds to `total_pending_outbound`, and calls `emit_transfer(value, on="finalized")`.
2. `reconcile_withdrawal(id, parent_tx, child_tx)`: Matches the cross-chain transaction receipt, deducts from `total_pending_outbound` and `total_value_locked`, and marks the withdrawal `RECONCILED`.

---

## Honest Limitations & Empirical Network Findings

In keeping with rigorous engineering standards, we document empirical findings and operational constraints observed during deployment on GenLayer StudioNet:

1. **Internet Archive Wayback Machine Rate Limits:**
   - Snapshots using the verbatim `id_` modifier (e.g. `https://web.archive.org/web/20230810id_/https://...`) succeed reliably when fetched by GenLayer datacenter validator nodes (`0x73b81e...`).
   - However, residential client browsers loading multiple historical snapshots in rapid succession can trigger HTTP 429 (Too Many Requests). LexDrift recommends pinning primary legal baselines to GitHub raw commit hashes or Wikipedia Action API `oldid`s, using Wayback Machine URLs for historical archival fallback.
2. **Asynchronous Cross-Contract Finality Latency:**
   - StudioNet cross-contract calls using `emit(on="finalized")` require the parent transaction to reach finality before the child transaction is dispatched to validator workers.
   - On StudioNet, validator consensus takes between **30 and 90 seconds per transaction leg**. The frontend dashboard accounts for this by providing a 4-state transaction tracker: `submitted` $\to$ `pending` $\to$ `accepted (appeal window)` $\to$ `finalized`.
3. **StudioNet JSON-RPC Connection Resets:**
   - The public StudioNet RPC gateway (`https://studio.genlayer.com/api`) occasionally drops TCP connections during high validator load, throwing `read ECONNRESET`.
   - LexDrift's deployment tooling and client applications implement exponential backoff retry wrappers (`callWithRetry`, 6 retries with 2.5s progressive delay) to guarantee resilient client communication.

---

## Documentation Directory

- **[Step-by-Step Developer Tutorial](docs/TUTORIAL.md)**: Comprehensive 1,500+ word technical guide on building multi-contract comparative evidence sentinels on GenLayer.
- **[Technical Blog Article](docs/BLOG_ARTICLE.md)**: *"Why Byte Diffs Aren't Enough: Auditing Retroactive License and Policy Drift with GenLayer Intelligent Contracts"*.
- **[Two-Minute Demo Script](docs/DEMO_SCRIPT.md)**: Step-by-step presentation script for demoing the sentinel in under 120 seconds.
- **[System Architecture Reference](docs/ARCHITECTURE.md)**: Deep dive into state machines, commit-reveal queues, and inter-contract messaging.
- **[Security Model & Formal Threat Analysis](docs/SECURITY.md)**: Threat modeling, prompt injection defense mechanisms, and STRIDE analysis.
- **[Deployment Ledger & Network Manifest](docs/DEPLOYMENT.md)**: Exact contract addresses, transaction hashes, and bytecode digests.
- **[Verification Guide](docs/VERIFICATION.md)**: Instructions for running the test suite and inspecting on-chain receipts.
- **[Portal Submission Fields](docs/PORTAL_SUBMISSION.md)**: Ready-to-copy fields formatted for the GenLayer Portal.

---

## License
MIT License. Copyright (c) 2026 LexDrift Sentinel Team.
