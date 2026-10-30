# LexDrift: Two-Minute Video & Live Presentation Demo Script

> **Target Duration**: Exactly 2 minutes (120 seconds)  
> **Presenter Persona**: Technical Founder / Lead Smart Contract Architect  
> **Live Demo URL**: Local Dashboard (`http://localhost:5173`) & [GenLayer StudioNet Explorer](https://explorer-studio.genlayer.com/address/0x270BBA964dB0C88363de6986Ef8D88090864456b)  
> **Key Message**: LexDrift is an autonomous legal, license, and governance policy drift sentinel on GenLayer that separates deterministic financial accounting from decentralized LLM consensus to catch retroactive rugpulls.

---

## Chronological Walkthrough Timeline

```
0:00 ─── [0:00 - 0:25] The Problem & System Architecture
         ├─ Spoken: The open-source license crisis (Terraform, Redis)
         └─ Visual: Architecture Diagram (LexVault + CharterGate + DriftAuditor)

0:25 ─── [0:25 - 0:55] Charter Creation & The 4-Boolean RuleGate
         ├─ Spoken: Why vague rules are rejected; verbatim quote verification
         └─ Visual: Case 1 Vague Covenant Rejection & Case 2 Live Active Charter

0:55 ─── [0:55 - 1:30] Claim Submission & Comparative Drift Auditing
         ├─ Spoken: Commit-reveal front-running defense & 6 boolean predicates
         └─ Visual: Case 4 Terraform MPL-2.0 -> BSL-1.1 Material Drift Settlement

1:30 ─── [1:30 - 2:00] Financial Invariants & Pull-Payment Reconciliation
         ├─ Spoken: 100% token conservation invariant & two-step pull payment
         └─ Visual: LexVault live accounting & on-chain Explorer reconciliation
```

---

## Detailed Minute-by-Minute Script

### `[0:00 - 0:25]` Act I: The Problem & System Architecture

**Visual Action:**
- Screen begins on the **LexDrift Dashboard Overview** displaying the top status badge: `GenLayer StudioNet (Chain ID 61999) | Verified Live`.
- Move mouse over the **System Architecture Card** showing `LexVault` (`0x270B...456b`), `CharterGate` (`0xa7ae...c51c`), and `DriftAuditor` (`0xB6C7...600d`).

**Spoken Audio (Voiceover):**
> "When HashiCorp changed Terraform's license from open-source MPL to restrictive Business Source License, thousands of downstream companies and DAOs were blindsided. Traditional smart contracts can't read the web, and basic git diffs flag every harmless typo.
> 
> Meet **LexDrift**: the first autonomous policy drift sentinel built on GenLayer. We strictly separate deterministic financial custody in `LexVault` from decentralized LLM consensus workers in `CharterGate` and `DriftAuditor`."

---

### `[0:25 - 0:55]` Act II: Charter Ingestion & The 4-Boolean RuleGate

**Visual Action:**
- Click the **"Charters"** tab.
- Click into **Charter #1 (`case_1_vague_covenant`)**: Show the red badge `REJECTED_CHARTER` with reason *"Vague aspirational language without observable criteria"*. Highlight that the 1,000 wei deposit was immediately refunded to the sponsor.
- Switch to **Charter #3 (`case_4_material_drift`)**: Show status `SETTLED_DRIFT` with the pinned GitHub raw URL for Terraform `v1.5.5` and the verbatim baseline quote: `Mozilla Public License v2.0`.

**Spoken Audio (Voiceover):**
> "To prevent endless dispute loops over vague human rules, our first worker, **CharterGate**, enforces a strict RuleGate. 
> 
> In Charter #1, a sponsor tried to register a vague pledge to 'be developer friendly'. GenLayer validators evaluated our 4 strict boolean criteria, saw no observable or falsifiable condition, and rejected it on-chain—refunding 100% of the deposit.
> 
> In Charter #3, the covenant protected Terraform's open-source license. CharterGate fetched the immutable GitHub commit snapshot, verified the verbatim quote, and activated the bounty."

---

### `[0:55 - 1:30]` Act III: Commit-Reveal Claims & Comparative Drift Auditing

**Visual Action:**
- Switch to the **"Claims & Audits"** tab.
- Highlight the **Commit-Reveal Queue** badge showing front-running protection (`SHA-256` commitment hash).
- Open **Claim #3 (`case_4_material_drift`)**:
  - Show the candidate document snapshot: Terraform `v1.6.0` (`raw.githubusercontent.com/.../LICENSE.txt`).
  - Expand the **6 Boolean Predicate Matrix**:
    - `same_subject`: `TRUE`
    - `chronology_valid`: `TRUE`
    - `baseline_granted_right`: `TRUE`
    - `candidate_modifies_clause`: `TRUE`
    - `materially_adverse_shift`: `TRUE`
    - `not_carved_out`: `TRUE`
  - Show the verdict: `MATERIAL_DRIFT` with closure digest `MATERIAL_DRIFT:5e2c7a...`.

**Spoken Audio (Voiceover):**
> "When Terraform released version 1.6.0, an automated sentinel sealed a claim with a cryptographic hash commitment to prevent front-running.
> 
> When disclosed, our second worker, **DriftAuditor**, fetched both snapshots and evaluated our 6 boolean predicates. It confirmed the subject was identical, identified the removal of MPL terms, and flagged the materially adverse shift to BSL-1.1. 
> 
> Validators reached unanimous consensus on the cryptographic closure basis, awarding the 1,500 wei bounty to the challenger."

---

### `[1:30 - 2:00]` Act IV: Financial Invariants & On-Chain Reconciliation

**Visual Action:**
- Click into the **"Treasury & Accounting"** view.
- Highlight the live equation:
  $$\text{Escrow}(1,500) + \text{Credits}(2,500) + \text{Pending}(0) = \text{TVL}(4,000)$$
- Click the **"Withdrawals"** tab: show Withdrawal #1 with status `RECONCILED` and click the Explorer link to transaction `0xa0bdfa31...3315`.
- End screen on the GitHub and StudioNet Explorer links.

**Spoken Audio (Voiceover):**
> "Financial safety is paramount: `LexVault` enforces an unbreakable mathematical conservation invariant on every single transaction: Escrow plus Credits plus Pending equals TVL. Payouts use safe two-step pull payments, preventing reentrancy and out-of-gas griefing.
> 
> All 3 contracts, 5 test cases, and rollback timeouts are 100% verified and finalized live on GenLayer StudioNet today.
> 
> LexDrift: Autonomous legal defense for the open web. Thank you."

---

## Quick Reference Links for Demo Presenter

- **LexVault Contract**: [`0x270BBA964dB0C88363de6986Ef8D88090864456b`](https://explorer-studio.genlayer.com/address/0x270BBA964dB0C88363de6986Ef8D88090864456b)
- **CharterGate Contract**: [`0xa7ae55747b61d4Eb9d7024F0C19bd6499262c51c`](https://explorer-studio.genlayer.com/address/0xa7ae55747b61d4Eb9d7024F0C19bd6499262c51c)
- **DriftAuditor Contract**: [`0xB6C7bC7cbd182c90cbc814Ec3d80CCEc604E600d`](https://explorer-studio.genlayer.com/address/0xB6C7bC7cbd182c90cbc814Ec3d80CCEc604E600d)
- **Case 4 Material Drift Audit Tx**: [`0x64d0bb875cc89f661f78f0ee3c31299948db84fb1fa17596a577672d68f25125`](https://explorer-studio.genlayer.com/tx/0x64d0bb875cc89f661f78f0ee3c31299948db84fb1fa17596a577672d68f25125)
- **Case 4 Pull Withdrawal Reconcile Tx**: [`0xa0bdfa31527d22783717b4ad00c9c4092f4ab3edb21e5f858ad9a4a871e63315`](https://explorer-studio.genlayer.com/tx/0xa0bdfa31527d22783717b4ad00c9c4092f4ab3edb21e5f858ad9a4a871e63315)
