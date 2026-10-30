# LexDrift Verification & Reproducibility Guide

> **Purpose**: Step-by-step guide for independent evaluators, hackathon judges, and portal reviewers to verify all unit tests, on-chain bytecode, and live StudioNet consensus receipts.

---

## 1. Automated Test Suite (18 Unit & Stateful Direct Tests)

LexDrift contains an extensive direct test suite written in Python and Pytest that executes locally without requiring a remote RPC connection.

### Run Command:
```bash
# In project root:
cd C:\Users\user\AntigravityProfiles\account1\.gemini\antigravity\scratch\lex-drift
& ".\.venv\Scripts\pytest.exe" tests/direct -v
```

### Complete Test Matrix (18 Passed / 100%):
1. `tests/direct/test_contract_structure.py::test_contract_headers`: Verifies required GenLayer header pragma across all `.py` contracts.
2. `tests/direct/test_contract_structure.py::test_lex_vault_structure`: Validates storage attributes, view functions, and payable decorators on `LexVault`.
3. `tests/direct/test_contract_structure.py::test_charter_gate_structure`: Validates storage attributes and public methods on `CharterGate`.
4. `tests/direct/test_contract_structure.py::test_drift_auditor_structure`: Validates storage attributes and public methods on `DriftAuditor`.
5. `tests/direct/test_domain.py::test_url_allowlist_validation`: Tests regex enforcement for GitHub raw commit SHAs, Wikipedia `oldid`, and Wayback `id_` URIs.
6. `tests/direct/test_domain.py::test_bounded_text_slicing_and_digest`: Tests line-ending normalization, HTML tag stripping, and 8,000-char truncation with SHA-256 digest computation.
7. `tests/direct/test_domain.py::test_safe_json_parsing`: Tests JSON extraction from markdown code fences and malformed LLM responses.
8. `tests/direct/test_domain.py::test_commitment_hash`: Tests cryptographic commitment hashing for front-running protection.
9. `tests/direct/test_domain.py::test_charter_gate_admissibility_cases`: Tests the 4-boolean RuleGate with valid covenants, vague covenants, and invalid quotes.
10. `tests/direct/test_domain.py::test_drift_auditor_verdict_cases`: Tests the 6-boolean drift engine across byte-identical short-circuits, benign revisions, prompt injections, and material drift.
11. `tests/direct/test_stateful_security.py::test_two_phase_bootstrap_and_unauthorized_rejection`: Tests `configure()` authorization, worker address binding, and bootstrapper wiping.
12. `tests/direct/test_stateful_security.py::test_case_a_vague_covenant_rejected`: Tests Case 1 lifecycle: vague covenant rejection and deposit refund.
13. `tests/direct/test_stateful_security.py::test_case_b_benign_revision`: Tests Case 2 lifecycle: benign URL change rejection and bond forfeiture to charter pool.
14. `tests/direct/test_stateful_security.py::test_case_c_adversarial_prompt_injection`: Tests Case 3 lifecycle: adversarial injection rejection and bond forfeiture to sponsor.
15. `tests/direct/test_stateful_security.py::test_case_d_material_drift_settlement`: Tests Case 4 lifecycle: verified drift settlement and bounty award.
16. `tests/direct/test_stateful_security.py::test_case_e_stage_deadline_timeout_and_fund_recovery`: Tests Case 5 lifecycle: stage timeout expiration and fund rollback.
17. `tests/direct/test_stateful_security.py::test_case_f_pull_withdrawal_and_recapitalization`: Tests two-step pull payment withdrawal, reconciliation, and invariant conservation.
18. `tests/direct/test_stateful_security.py::test_front_running_protection_commit_reveal`: Tests commit-reveal replay protection and invalid salt rejection.

---

## 2. On-Chain StudioNet Proof Verifier

LexDrift provides an automated verification script that connects directly to GenLayer StudioNet via JSON-RPC:

```bash
npm run verify:proof
```

### What `verify:proof` Verifies:
1. **Source Code & On-Chain Bytecode SHA-256 Equivalence**:
   - Queries `gen_getContractCode` for `LexVault`, `CharterGate`, and `DriftAuditor`.
   - Hashes local `.py` source files and asserts identical digests.
2. **Accounting Conservation Invariant**:
   - Calls `get_accounting()` on `LexVault`.
   - Confirms that $\text{total\_escrow} + \text{total\_credits} + \text{total\_pending\_outbound} \equiv \text{total\_value\_locked}$.
3. **Transaction Finality & Consensus**:
   - Queries `getTransaction` for each of the 5 acceptance scenario transactions.
   - Verifies `statusName == "FINALIZED"` and `execution_result == "SUCCESS"`.

---

## 3. Manual JSON-RPC Verification via cURL

You can query the live StudioNet contracts using standard JSON-RPC calls.

### Check LexVault Accounting State:
```bash
curl -X POST https://studio.genlayer.com/api \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "gen_call",
    "params": [{
      "to": "0x270BBA964dB0C88363de6986Ef8D88090864456b",
      "data": "get_accounting"
    }],
    "id": 1
  }'
```

*Expected JSON payload return:*
```json
{
  "total_escrow": 1500,
  "total_credits": 2500,
  "total_pending_outbound": 0,
  "total_value_locked": 4000,
  "invariant_valid": true
}
```

### Check Deployed Bytecode:
```bash
curl -X POST https://studio.genlayer.com/api \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "gen_getContractCode",
    "params": ["0x270BBA964dB0C88363de6986Ef8D88090864456b"],
    "id": 1
  }'
```
