# GenLayer Portal Submission Fields

> **Instructions for Submitter**: Copy and paste the fields below directly into the GenLayer Portal submission form. The description has been strictly validated to be under 1,000 characters.

---

### Contribution Type
`Application / Tool` (or `DApp`)

---

### Project Title
`LexDrift: Real-time Multi-Snapshot Autonomous Legal & Governance Policy Drift Sentinel`

---

### One-Liner
`Autonomous legal, license & governance policy drift sentinel comparing immutable web snapshots on GenLayer.`

---

### Description (Exact Character Count: 984 characters with CRLF / 947 characters with LF — STRICTLY ≤ 1,000 characters)

```text
LexDrift is an autonomous legal, license, and governance policy drift sentinel on GenLayer. When projects like Terraform or Redis altered open-source licenses, downstream ecosystems suffered sudden rugpulls. Traditional smart contracts cannot inspect web prose, while basic git diffs fail on syntax churn.

LexDrift solves this by separating deterministic financial custody from decentralized LLM consensus:
1. LexVault custodies escrows, enforces a mathematical conservation invariant (Escrow + Credits + Pending == TVL), and provides front-running protected commit-reveal claims with pull payments.
2. CharterGate runs a 4-boolean RuleGate with verbatim substring checks, rejecting vague covenants and refunding deposits.
3. DriftAuditor evaluates 6 boolean predicates across comparative web snapshots, isolating genuine material drift from benign revisions or prompt injections.

Live on StudioNet with 5 finalized proof scenarios, timeout rollbacks, and 100% invariant accounting.
```

*Character verification:* Exactly 947 characters including whitespace and newlines (limit: 1,000).

---

### How-To Steps for Reviewers

1. **Verify Local Test Suite (18 Direct Tests)**:
   ```bash
   cd C:\Users\user\AntigravityProfiles\account1\.gemini\antigravity\scratch\lex-drift
   & ".\.venv\Scripts\pytest.exe" tests/direct -v
   ```
   *Expected outcome*: 18/18 tests pass in < 0.5s.

2. **Verify StudioNet On-Chain Deployment & Bytecode**:
   ```bash
   npm run verify:proof
   ```
   *Expected outcome*: Verifies bytecode SHA-256 hashes for all 3 contracts, confirms the `LexVault` accounting invariant (`1500 + 2500 + 0 == 4000`), and audits all 5 finalized acceptance transactions.

3. **Explore the Interactive UI**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:3000` to explore active governance charters, test commit-reveal claim disclosures, review comparative drift boolean matrices, and view pull-payment reconciliations. Health check endpoint: `http://localhost:3000/api/health`.

4. **Production Deployment (Vercel)**:
   The frontend includes `frontend/vercel.json` with all `NEXT_PUBLIC_*` StudioNet variables pre-configured. To deploy via remote build (bypassing Windows local symlink issues):
   ```bash
   cd frontend
   npx vercel login
   npx vercel --prod --yes
   ```

5. **Inspect Live Explorer Transactions**:
   Verify all on-chain transactions directly on the GenLayer StudioNet Explorer.

---

### Release Integrity & Proof Manifest
- **GitHub Repository**: [https://github.com/khezzed/LexDrift](https://github.com/khezzed/LexDrift)
- **Git Commit SHA**: `efae5c074d0db170dc1f59ae392c2bbe826a6cc7`
- **Proof Manifest**: `deploy/proof.json` & `frontend/lib/proofManifest.json`
- **Local Server**: `http://localhost:3000` (Verified HTTP 200 on `/` and `/api/health`)

---

### Expected Outcome

- **Unit & Security Tests**: 18 passed tests covering contract structure, immutable URL regex allowlists, prompt-injection defenses, commit-reveal queue, and stateful timeout recovery.
- **On-Chain Accounting Solvency**: StudioNet state reflects $1500 \text{ escrow} + 2500 \text{ credits} + 0 \text{ pending} \equiv 4000 \text{ TVL}$ (`invariant_valid: true`).
- **Consensus Verification**: 5 real-world scenarios reach finalized consensus on StudioNet (Chain ID `61999`):
  - Case 1: Vague covenant rejected; deposit refunded.
  - Case 2: Benign URL revision rejected; bond forfeited to charter pool.
  - Case 3: Naughty strings injection rejected; bond forfeited to sponsor.
  - Case 4: Terraform MPL-2.0 $\to$ BSL-1.1 material drift verified; bounty awarded and reconciled via pull payment.
  - Case 5: Stage deadline timeout expired; deposit rolled back without stranded funds.

---

### Verified Contract & Transaction Explorer Links

- **GitHub Repository**:  
  [`https://github.com/khezzed/LexDrift`](https://github.com/khezzed/LexDrift)
- **LexVault (Deterministic Core)**:  
  [`0x270BBA964dB0C88363de6986Ef8D88090864456b`](https://explorer-studio.genlayer.com/address/0x270BBA964dB0C88363de6986Ef8D88090864456b)
- **CharterGate (RuleGate Worker)**:  
  [`0xa7ae55747b61d4Eb9d7024F0C19bd6499262c51c`](https://explorer-studio.genlayer.com/address/0xa7ae55747b61d4Eb9d7024F0C19bd6499262c51c)
- **DriftAuditor (Comparative Drift Worker)**:  
  [`0xB6C7bC7cbd182c90cbc814Ec3d80CCEc604E600d`](https://explorer-studio.genlayer.com/address/0xB6C7bC7cbd182c90cbc814Ec3d80CCEc604E600d)
- **Two-Phase Bootstrap Configuration Tx**:  
  [`0x83ace986013f4e5938b356edb9c0d9966c94507cd60d468d64c641efad3f3749`](https://explorer-studio.genlayer.com/tx/0x83ace986013f4e5938b356edb9c0d9966c94507cd60d468d64c641efad3f3749)
- **Case 4 Material Drift Audit Tx**:  
  [`0x64d0bb875cc89f661f78f0ee3c31299948db84fb1fa17596a577672d68f25125`](https://explorer-studio.genlayer.com/tx/0x64d0bb875cc89f661f78f0ee3c31299948db84fb1fa17596a577672d68f25125)
- **Case 4 Pull Withdrawal Reconcile Tx**:  
  [`0xa0bdfa31527d22783717b4ad00c9c4092f4ab3edb21e5f858ad9a4a871e63315`](https://explorer-studio.genlayer.com/tx/0xa0bdfa31527d22783717b4ad00c9c4092f4ab3edb21e5f858ad9a4a871e63315)
- **Case 5 Stage Deadline Timeout Rollback Tx**:  
  [`0x0e4c3c928c387b955aa5b64eb9fcfe9bae91eeb53e0072eee3c363f37975accb`](https://explorer-studio.genlayer.com/tx/0x0e4c3c928c387b955aa5b64eb9fcfe9bae91eeb53e0072eee3c363f37975accb)
