# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import hashlib
import json
import re
from datetime import datetime

STUDIONET_RPC_URL = "https://studio.genlayer.com/api"


def _is_valid_tx_hash(tx_hash: str) -> bool:
    if not tx_hash or not isinstance(tx_hash, str):
        return False
    return bool(re.match(r'^0x[0-9a-fA-F]{64}$', tx_hash.strip()))


def _fetch_rpc_tx(rpc_url: str, tx_hash: str) -> dict:
    payload = json.dumps({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_getTransactionByHash",
        "params": [tx_hash]
    })
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    resp = gl.nondet.web.post(rpc_url, body=payload, headers=headers)
    body = getattr(resp, "body", b"")
    if isinstance(body, bytes):
        text = body.decode("utf-8", errors="replace")
    else:
        text = str(body)
    data = _parse_json_safely(text)
    res = data.get("result")
    return res if isinstance(res, dict) else {}


def _parse_tx_value(raw_val) -> int:
    if isinstance(raw_val, bool) or raw_val is None:
        return -1
    if isinstance(raw_val, (int, float)):
        return int(raw_val)
    s = str(raw_val).strip()
    if not s:
        return -1
    try:
        return int(s, 16) if s.startswith("0x") else int(s)
    except Exception:
        return -1


def _verify_transfer_finality_nondet(
    vault_addr: str,
    recipient: str,
    expected_amount: int,
    parent_tx_hash: str,
    child_tx_hash: str
) -> dict:
    p_hash = parent_tx_hash.strip().lower()
    c_hash = child_tx_hash.strip().lower()
    v_addr = vault_addr.strip().lower()
    r_addr = recipient.strip().lower()

    parent_tx = _fetch_rpc_tx(STUDIONET_RPC_URL, p_hash)
    child_tx = _fetch_rpc_tx(STUDIONET_RPC_URL, c_hash)

    p_status = str(parent_tx.get("statusName") or parent_tx.get("status") or "").upper()
    c_status = str(child_tx.get("statusName") or child_tx.get("status") or "").upper()
    parent_finalized = p_status in ("FINALIZED", "7")
    child_finalized = c_status in ("FINALIZED", "7")

    p_from = str(parent_tx.get("from_address") or parent_tx.get("from") or "").lower()
    p_to = str(parent_tx.get("to_address") or parent_tx.get("to") or "").lower()
    p_result = str(parent_tx.get("result_name") or "").upper()
    p_exec = str(parent_tx.get("execution_result") or "").upper()
    parent_sender_ok = p_from == r_addr
    parent_target_ok = p_to == v_addr
    parent_not_failed = p_result not in ("ERROR", "CANCELED", "FAILED") and p_exec != "ERROR"

    c_triggered_by = str(child_tx.get("triggered_by") or "").lower()
    c_from = str(child_tx.get("from_address") or child_tx.get("from") or "").lower()
    c_to = str(child_tx.get("to_address") or child_tx.get("to") or "").lower()
    c_val = _parse_tx_value(child_tx.get("value"))
    c_credited = child_tx.get("value_credited") is True
    c_result = str(child_tx.get("result_name") or "").upper()
    c_exec = str(child_tx.get("execution_result") or "").upper()

    child_triggered_ok = c_triggered_by == p_hash
    child_from_ok = c_from == v_addr
    child_to_ok = c_to == r_addr
    child_value_ok = c_val == expected_amount and expected_amount > 0
    child_not_failed = c_result not in ("ERROR", "CANCELED", "FAILED") and c_exec != "ERROR"

    verified = bool(
        parent_tx
        and child_tx
        and parent_finalized
        and child_finalized
        and parent_sender_ok
        and parent_target_ok
        and parent_not_failed
        and child_triggered_ok
        and child_from_ok
        and child_to_ok
        and child_value_ok
        and c_credited
        and child_not_failed
    )

    return {
        "verified": verified,
        "parent_tx_hash": p_hash,
        "child_tx_hash": c_hash,
        "recipient": r_addr,
        "vault": v_addr,
        "amount": expected_amount,
    }


def _is_valid_immutable_url(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    url = url.strip()
    github_pattern = r'^https:\/\/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/([0-9a-fA-F]{40})\/.+$'
    wikipedia_pattern = r'^https:\/\/en\.wikipedia\.org\/w\/api\.php\?.*oldid=\d+.*$'
    archive_pattern = r'^https:\/\/web\.archive\.org\/web\/(\d{14})id_\/.+$'
    if re.match(github_pattern, url):
        return True
    if re.match(wikipedia_pattern, url):
        return True
    if re.match(archive_pattern, url):
        return True
    return False


def _parse_json_safely(raw_val) -> dict:
    if isinstance(raw_val, dict):
        return raw_val
    if not isinstance(raw_val, str):
        return {}
    cleaned = raw_val.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        if len(lines) >= 3:
            cleaned = "\n".join(lines[1:-1]).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start:end + 1]
    try:
        return json.loads(cleaned)
    except Exception:
        return {}


@gl.evm.contract_interface
class _EvmRecipient:
    """Verified EVM/EOA transfer interface emitting EthSend on GenLayer."""

    class View:
        pass

    class Write:
        pass


class LexVault(gl.Contract):
    """
    LexVault: Deterministic Economic Core of the LexDrift Sentinel.
    Holds all GEN escrows, pull credits, and pending outbound withdrawals.
    Enforces a strict accounting conservation invariant:
        total_escrow + total_credits + total_pending_outbound == total_value_locked
    """
    bootstrapper: str
    charter_gate: str
    drift_auditor: str
    charter_counter: u256
    claim_counter: u256
    withdrawal_counter: u256
    charters: TreeMap[u256, str]
    claims: TreeMap[u256, str]
    commitments: TreeMap[str, u256]
    pull_credits: TreeMap[str, u256]
    pending_outbound: TreeMap[u256, str]
    consumed_payout_receipts: TreeMap[str, u256]
    total_escrow: u256
    total_credits: u256
    total_pending_outbound: u256
    total_value_locked: u256
    stage_timeout_seconds: u256

    def __init__(self):
        super().__init__()
        self.bootstrapper = str(gl.message.sender_address)
        self.charter_gate = ""
        self.drift_auditor = ""
        self.charter_counter = u256(0)
        self.claim_counter = u256(0)
        self.withdrawal_counter = u256(0)
        self.total_escrow = u256(0)
        self.total_credits = u256(0)
        self.total_pending_outbound = u256(0)
        self.total_value_locked = u256(0)
        self.stage_timeout_seconds = u256(1800)

    # =========================================================================
    # Internal Helpers
    # =========================================================================

    def _now(self) -> int:
        raw = getattr(gl, "message_raw", None)
        base_ts = 0
        if raw and isinstance(raw, dict) and "datetime" in raw and raw["datetime"] is not None:
            dt_raw = raw["datetime"]
            if isinstance(dt_raw, bool):
                raise gl.vm.UserError("UNAVAILABLE_TRUSTED_TIME: Trusted GenVM message timestamp is invalid")
            if isinstance(dt_raw, (int, float)):
                base_ts = int(dt_raw)
            else:
                dt_str = str(dt_raw).strip()
                if not dt_str:
                    raise gl.vm.UserError("UNAVAILABLE_TRUSTED_TIME: Trusted GenVM message timestamp is missing")
                try:
                    base_ts = int(datetime.fromisoformat(dt_str.replace("Z", "+00:00")).timestamp())
                except Exception:
                    raise gl.vm.UserError("UNAVAILABLE_TRUSTED_TIME: Unparseable trusted GenVM message timestamp")
        elif hasattr(gl.message, "timestamp") and gl.message.timestamp is not None:
            ts_raw = gl.message.timestamp
            if isinstance(ts_raw, bool):
                raise gl.vm.UserError("UNAVAILABLE_TRUSTED_TIME: Trusted GenVM message timestamp is invalid")
            try:
                base_ts = int(ts_raw)
            except Exception:
                raise gl.vm.UserError("UNAVAILABLE_TRUSTED_TIME: Unparseable trusted GenVM message timestamp")

        if base_ts <= 0:
            raise gl.vm.UserError("UNAVAILABLE_TRUSTED_TIME: Trusted GenVM message timestamp is missing or invalid")
        return base_ts

    def _assert_invariant(self) -> None:
        escrow = int(self.total_escrow)
        credits = int(self.total_credits)
        pending = int(self.total_pending_outbound)
        tvl = int(self.total_value_locked)
        if escrow + credits + pending != tvl:
            raise gl.vm.UserError(
                f"INVARIANT_BREACH: escrow({escrow}) + credits({credits}) + pending({pending}) != tvl({tvl})"
            )

    # =========================================================================
    # Two-Phase Immutable Bootstrap
    # =========================================================================

    @gl.public.write
    def configure(self, gate_address: str, auditor_address: str) -> None:
        """
        Two-phase immutable bootstrap:
        Binds the two non-deterministic worker contracts (CharterGate and DriftAuditor).
        Can ONLY be called by bootstrapper once. Wipes bootstrapper to prevent reconfiguration.
        """
        caller = str(gl.message.sender_address)
        if not self.bootstrapper or caller.lower() != self.bootstrapper.lower():
            raise gl.vm.UserError("UNAUTHORIZED_BOOTSTRAP: Caller is not bootstrapper or already configured")

        if not gate_address or not gate_address.startswith("0x") or len(gate_address) != 42:
            raise gl.vm.UserError("INVALID_GATE_ADDRESS: Expected 42-char hex address")
        if not auditor_address or not auditor_address.startswith("0x") or len(auditor_address) != 42:
            raise gl.vm.UserError("INVALID_AUDITOR_ADDRESS: Expected 42-char hex address")

        self.charter_gate = gate_address
        self.drift_auditor = auditor_address
        self.bootstrapper = ""  # Wiped permanently

    # =========================================================================
    # Charter Lifecycle
    # =========================================================================

    @gl.public.write.payable
    def open_charter(self, baseline_url: str, covenant_rule: str) -> u256:
        """
        Registers a new covenant charter with a locked bounty escrow.
        Payable Call Safety: Credits deposit to refundable pull_credits if inputs fail validation,
        preventing stranded deposits on StudioNet.
        """
        sender = str(gl.message.sender_address)
        deposit = int(gl.message.value)
        self.total_value_locked = u256(int(self.total_value_locked) + deposit)

        # Minimum bounty threshold: 1,000 wei
        if deposit < 1000 or not _is_valid_immutable_url(baseline_url) or not covenant_rule or not covenant_rule.strip():
            # Validate inputs so failures create a refundable record instead of stranding the deposit
            curr_credit = int(self.pull_credits.get(sender, u256(0)))
            self.pull_credits[sender] = u256(curr_credit + deposit)
            self.total_credits = u256(int(self.total_credits) + deposit)
            self._assert_invariant()
            return u256(0)

        self.charter_counter = u256(int(self.charter_counter) + 1)
        charter_id = int(self.charter_counter)
        self.total_escrow = u256(int(self.total_escrow) + deposit)

        now = self._now()
        deadline = now + int(self.stage_timeout_seconds)

        charter_obj = {
            "id": charter_id,
            "sponsor": sender,
            "bounty": deposit,
            "baseline_url": baseline_url,
            "covenant_rule": covenant_rule,
            "status": "PENDING_ATTESTATION",
            "baseline_digest": "",
            "baseline_quote": "",
            "created_at": now,
            "stage_deadline": deadline,
            "rejection_reason": ""
        }
        self.charters[u256(charter_id)] = json.dumps(charter_obj)

        if self.charter_gate:
            gl.get_contract_at(Address(self.charter_gate)).emit(on="finalized").attest_charter(
                charter_id, baseline_url, covenant_rule
            )

        self._assert_invariant()
        return u256(charter_id)

    @gl.public.write
    def record_charter_attestation(self, charter_id: int, result_json: str) -> None:
        """
        Callback from CharterGate worker.
        Restricted strictly to self.charter_gate.
        Enforces strict mutual exclusivity against expire_stage timeout.
        """
        caller = str(gl.message.sender_address)
        if not self.charter_gate or caller.lower() != self.charter_gate.lower():
            raise gl.vm.UserError("UNAUTHORIZED_WORKER: Caller is not authorized CharterGate")

        raw_charter = self.charters.get(u256(charter_id), "")
        if not raw_charter:
            raise gl.vm.UserError(f"CHARTER_NOT_FOUND: {charter_id}")

        charter = json.loads(raw_charter)
        if charter.get("status") != "PENDING_ATTESTATION":
            raise gl.vm.UserError(f"INVALID_CHARTER_STATUS: {charter.get('status')}")

        if self._now() >= int(charter.get("stage_deadline", 0)):
            raise gl.vm.UserError("STAGE_EXPIRED: Charter attestation deadline exceeded")

        res = _parse_json_safely(result_json)
        status = str(res.get("status", "REJECTED_CHARTER")).upper()
        reason = str(res.get("reason", "Attestation completed"))[:160]

        if status == "ACTIVE":
            charter["status"] = "ACTIVE"
            charter["baseline_digest"] = str(res.get("baseline_digest", ""))
            charter["baseline_quote"] = str(res.get("baseline_quote", ""))
            charter["activated_at"] = self._now()
        else:
            charter["status"] = "REJECTED_CHARTER"
            charter["rejection_reason"] = reason
            bounty = int(charter.get("bounty", 0))
            charter["bounty"] = 0
            self.total_escrow = u256(int(self.total_escrow) - bounty)
            self.total_credits = u256(int(self.total_credits) + bounty)
            sponsor = charter.get("sponsor")
            curr_credit = int(self.pull_credits.get(sponsor, u256(0)))
            self.pull_credits[sponsor] = u256(curr_credit + bounty)

        self.charters[u256(charter_id)] = json.dumps(charter)
        self._assert_invariant()

    # =========================================================================
    # Claim Lifecycle (Commit-Reveal FIFO Queue)
    # =========================================================================

    @gl.public.write.payable
    def seal_claim(self, charter_id: int, commitment_hash: str) -> u256:
        """
        Step 1 of Commit-Reveal: Challenger commits candidate_url hash + attached bond.
        Prevents front-running and copy-cat auditing claims.
        """
        sender = str(gl.message.sender_address)
        deposit = int(gl.message.value)
        self.total_value_locked = u256(int(self.total_value_locked) + deposit)

        # Minimum bond threshold: 500 wei
        raw_charter = self.charters.get(u256(charter_id), "")
        charter = json.loads(raw_charter) if raw_charter else {}
        is_charter_active = charter.get("status") == "ACTIVE"

        if (
            deposit < 500 or
            not commitment_hash or
            commitment_hash in self.commitments or
            not is_charter_active
        ):
            # Credit refundable pull balance
            curr_credit = int(self.pull_credits.get(sender, u256(0)))
            self.pull_credits[sender] = u256(curr_credit + deposit)
            self.total_credits = u256(int(self.total_credits) + deposit)
            self._assert_invariant()
            return u256(0)

        self.claim_counter = u256(int(self.claim_counter) + 1)
        claim_id = int(self.claim_counter)
        self.total_escrow = u256(int(self.total_escrow) + deposit)
        self.commitments[commitment_hash] = u256(claim_id)

        now = self._now()
        claim_obj = {
            "id": claim_id,
            "charter_id": charter_id,
            "challenger": sender,
            "bond": deposit,
            "commitment_hash": commitment_hash,
            "candidate_url": "",
            "status": "SEALED",
            "sealed_at": now,
            "stage_deadline": 0,
            "verdict": "",
            "closure_basis": ""
        }
        self.claims[u256(claim_id)] = json.dumps(claim_obj)
        self._assert_invariant()
        return u256(claim_id)

    @gl.public.write
    def disclose_claim(self, claim_id: int, candidate_url: str, salt: str) -> None:
        """
        Step 2 of Commit-Reveal: Challenger discloses candidate_url and secret salt.
        Verifies commitment hash match and triggers DriftAuditor worker.
        """
        raw_claim = self.claims.get(u256(claim_id), "")
        if not raw_claim:
            raise gl.vm.UserError(f"CLAIM_NOT_FOUND: {claim_id}")

        claim = json.loads(raw_claim)
        caller = str(gl.message.sender_address)
        if caller.lower() != claim.get("challenger", "").lower():
            raise gl.vm.UserError("UNAUTHORIZED_CHALLENGER: Caller did not seal this claim")

        if claim.get("status") != "SEALED":
            raise gl.vm.UserError(f"INVALID_CLAIM_STATUS: Expected SEALED, got {claim.get('status')}")

        computed_hash = hashlib.sha256(f"{candidate_url}:{salt}".encode("utf-8")).hexdigest()
        if computed_hash.lower() != claim.get("commitment_hash", "").lower():
            raise gl.vm.UserError("INVALID_COMMITMENT_REVEAL: Hash mismatch")

        if not _is_valid_immutable_url(candidate_url):
            raise gl.vm.UserError("INVALID_CANDIDATE_URL: Not in immutable allowlist")

        raw_charter = self.charters.get(u256(claim.get("charter_id", 0)), "")
        charter = json.loads(raw_charter) if raw_charter else {}
        if charter.get("status") != "ACTIVE":
            raise gl.vm.UserError(f"CHARTER_NOT_ACTIVE: {charter.get('status')}")

        now = self._now()
        deadline = now + int(self.stage_timeout_seconds)

        claim["candidate_url"] = candidate_url
        claim["status"] = "AUDITING"
        claim["disclosed_at"] = now
        claim["stage_deadline"] = deadline
        self.claims[u256(claim_id)] = json.dumps(claim)

        if self.drift_auditor:
            gl.get_contract_at(Address(self.drift_auditor)).emit(on="finalized").audit_drift(
                claim_id,
                charter["id"],
                charter["baseline_url"],
                charter["baseline_digest"],
                charter["covenant_rule"],
                candidate_url
            )

    @gl.public.write
    def record_drift_verdict(self, claim_id: int, result_json: str) -> None:
        """
        Callback from DriftAuditor worker.
        Restricted strictly to self.drift_auditor.
        Enforces strict mutual exclusivity against expire_stage timeout.
        """
        caller = str(gl.message.sender_address)
        if not self.drift_auditor or caller.lower() != self.drift_auditor.lower():
            raise gl.vm.UserError("UNAUTHORIZED_WORKER: Caller is not authorized DriftAuditor")

        raw_claim = self.claims.get(u256(claim_id), "")
        if not raw_claim:
            raise gl.vm.UserError(f"CLAIM_NOT_FOUND: {claim_id}")

        claim = json.loads(raw_claim)
        if claim.get("status") != "AUDITING":
            raise gl.vm.UserError(f"INVALID_CLAIM_STATUS: Expected AUDITING, got {claim.get('status')}")

        if self._now() >= int(claim.get("stage_deadline", 0)):
            raise gl.vm.UserError("STAGE_EXPIRED: Claim audit deadline exceeded")

        raw_charter = self.charters.get(u256(claim.get("charter_id", 0)), "")
        charter = json.loads(raw_charter)

        res = _parse_json_safely(result_json)
        verdict = str(res.get("verdict", "REJECTED_EVIDENCE")).upper()
        closure_basis = str(res.get("closure_basis", ""))

        claim["verdict"] = verdict
        claim["closure_basis"] = closure_basis
        claim["settled_at"] = self._now()

        if verdict == "MATERIAL_DRIFT":
            # Material drift confirmed: settle charter, award bounty + bond to challenger
            charter["status"] = "SETTLED_DRIFT"
            claim["status"] = "SETTLED_MATERIAL_DRIFT"

            bounty = int(charter.get("bounty", 0))
            bond = int(claim.get("bond", 0))
            total_payout = bounty + bond

            charter["bounty"] = 0
            claim["bond"] = 0

            self.total_escrow = u256(int(self.total_escrow) - total_payout)
            self.total_credits = u256(int(self.total_credits) + total_payout)

            challenger = claim.get("challenger")
            curr_credit = int(self.pull_credits.get(challenger, u256(0)))
            self.pull_credits[challenger] = u256(curr_credit + total_payout)

        elif verdict == "BENIGN_REVISION":
            # Benign revision: charter stays active; challenger bond forfeited into charter pool
            claim["status"] = "REJECTED_BENIGN_REVISION"
            bond = int(claim.get("bond", 0))
            claim["bond"] = 0
            # Bond stays in escrow, added to charter bounty pool
            charter["bounty"] = int(charter.get("bounty", 0)) + bond

        else:
            # REJECTED_EVIDENCE (e.g. prompt injection, invalid quote, unrelated snapshot)
            # Charter stays active; challenger bond forfeited to sponsor pull credit
            claim["status"] = "REJECTED_EVIDENCE"
            bond = int(claim.get("bond", 0))
            claim["bond"] = 0

            self.total_escrow = u256(int(self.total_escrow) - bond)
            self.total_credits = u256(int(self.total_credits) + bond)

            sponsor = charter.get("sponsor")
            curr_credit = int(self.pull_credits.get(sponsor, u256(0)))
            self.pull_credits[sponsor] = u256(curr_credit + bond)

        self.charters[u256(charter["id"])] = json.dumps(charter)
        self.claims[u256(claim_id)] = json.dumps(claim)
        self._assert_invariant()

    # =========================================================================
    # Stage Expiration & Fund Recovery
    # =========================================================================

    @gl.public.write
    def expire_stage(self, target_type: str, target_id: int) -> None:
        """
        Callable by anyone if a worker does not respond before stage_deadline.
        Cleanly refunds escrowed funds into pull_credits and marks status EXPIRED.
        """
        ttype = target_type.upper().strip()
        now = self._now()

        if ttype == "CHARTER":
            raw_charter = self.charters.get(u256(target_id), "")
            if not raw_charter:
                raise gl.vm.UserError(f"CHARTER_NOT_FOUND: {target_id}")
            charter = json.loads(raw_charter)
            if charter.get("status") != "PENDING_ATTESTATION":
                raise gl.vm.UserError(f"CANNOT_EXPIRE_CHARTER: Status is {charter.get('status')}")
            if now < int(charter.get("stage_deadline", 0)):
                raise gl.vm.UserError("STAGE_NOT_EXPIRED: Deadline has not passed")

            charter["status"] = "EXPIRED_UNATTESTED"
            bounty = int(charter.get("bounty", 0))
            charter["bounty"] = 0

            self.total_escrow = u256(int(self.total_escrow) - bounty)
            self.total_credits = u256(int(self.total_credits) + bounty)

            sponsor = charter.get("sponsor")
            curr_credit = int(self.pull_credits.get(sponsor, u256(0)))
            self.pull_credits[sponsor] = u256(curr_credit + bounty)
            self.charters[u256(target_id)] = json.dumps(charter)

        elif ttype == "CLAIM":
            raw_claim = self.claims.get(u256(target_id), "")
            if not raw_claim:
                raise gl.vm.UserError(f"CLAIM_NOT_FOUND: {target_id}")
            claim = json.loads(raw_claim)
            if claim.get("status") != "AUDITING":
                raise gl.vm.UserError(f"CANNOT_EXPIRE_CLAIM: Status is {claim.get('status')}")
            if now < int(claim.get("stage_deadline", 0)):
                raise gl.vm.UserError("STAGE_NOT_EXPIRED: Deadline has not passed")

            claim["status"] = "EXPIRED_CLAIM"
            bond = int(claim.get("bond", 0))
            claim["bond"] = 0

            self.total_escrow = u256(int(self.total_escrow) - bond)
            self.total_credits = u256(int(self.total_credits) + bond)

            challenger = claim.get("challenger")
            curr_credit = int(self.pull_credits.get(challenger, u256(0)))
            self.pull_credits[challenger] = u256(curr_credit + bond)
            self.claims[u256(target_id)] = json.dumps(claim)

        else:
            raise gl.vm.UserError(f"UNKNOWN_TARGET_TYPE: {target_type}")

        self._assert_invariant()

    # =========================================================================
    # Two-Step Native EVM Pull Payments & Recapitalization
    # =========================================================================

    @gl.public.write
    def request_withdrawal(self, amount: int) -> u256:
        """
        Step 1 of Native EVM Pull Payment:
        Moves amount from pull_credits to pending_outbound.
        """
        sender = str(gl.message.sender_address)
        avail = int(self.pull_credits.get(sender, u256(0)))
        if amount <= 0 or amount > avail:
            raise gl.vm.UserError(f"INSUFFICIENT_PULL_CREDIT: requested {amount}, available {avail}")

        self.pull_credits[sender] = u256(avail - amount)
        self.total_credits = u256(int(self.total_credits) - amount)
        self.total_pending_outbound = u256(int(self.total_pending_outbound) + amount)

        self.withdrawal_counter = u256(int(self.withdrawal_counter) + 1)
        wid = int(self.withdrawal_counter)

        record = {
            "id": wid,
            "recipient": sender,
            "amount": amount,
            "status": "PENDING",
            "created_at": self._now(),
            "parent_tx_hash": "",
            "child_tx_hash": ""
        }
        self.pending_outbound[u256(wid)] = json.dumps(record)
        self._assert_invariant()

        _EvmRecipient(Address(sender)).emit_transfer(value=u256(amount), on="finalized")
        return u256(wid)

    @gl.public.write
    def reconcile_withdrawal(self, withdrawal_id: int, parent_tx_hash: str, child_tx_hash: str) -> None:
        """
        Step 2 of Native EVM Pull Payment:
        Authorizes the withdrawal recipient and validates authenticated transfer-finality
        evidence via validator consensus replay before reconciling outbound funds.
        """
        raw_rec = self.pending_outbound.get(u256(withdrawal_id), "")
        if not raw_rec:
            raise gl.vm.UserError(f"WITHDRAWAL_NOT_FOUND: {withdrawal_id}")

        rec = json.loads(raw_rec)
        if rec.get("status") != "PENDING":
            raise gl.vm.UserError(f"WITHDRAWAL_NOT_PENDING: Status is {rec.get('status')}")

        recipient = str(rec.get("recipient", ""))
        caller = str(gl.message.sender_address)
        if not recipient or caller.lower() != recipient.lower():
            raise gl.vm.UserError("UNAUTHORIZED_RECONCILER: Only the withdrawal recipient may reconcile")

        if not _is_valid_tx_hash(parent_tx_hash) or not _is_valid_tx_hash(child_tx_hash):
            raise gl.vm.UserError("INVALID_TRANSFER_FINALITY_EVIDENCE: Expected 32-byte 0x hex transaction hashes")

        p_hash = parent_tx_hash.strip().lower()
        c_hash = child_tx_hash.strip().lower()
        if p_hash == c_hash:
            raise gl.vm.UserError("INVALID_TRANSFER_FINALITY_EVIDENCE: Parent and child hashes must be distinct")

        if p_hash in self.consumed_payout_receipts or c_hash in self.consumed_payout_receipts:
            raise gl.vm.UserError("RECEIPT_ALREADY_CONSUMED: Transfer finality receipt already reconciled")

        amt = int(rec.get("amount", 0))
        vault_addr = str(gl.message.contract_address)

        def leader_fn() -> dict:
            return _verify_transfer_finality_nondet(
                vault_addr, recipient, amt, p_hash, c_hash
            )

        def validator_fn(leaders_res) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False
            leader_out = leaders_res.calldata
            if not isinstance(leader_out, dict):
                return False
            val_out = _verify_transfer_finality_nondet(
                vault_addr, recipient, amt, p_hash, c_hash
            )
            return (
                leader_out.get("verified") == val_out.get("verified")
                and leader_out.get("parent_tx_hash") == val_out.get("parent_tx_hash")
                and leader_out.get("child_tx_hash") == val_out.get("child_tx_hash")
                and leader_out.get("recipient") == val_out.get("recipient")
                and leader_out.get("vault") == val_out.get("vault")
                and leader_out.get("amount") == val_out.get("amount")
            )

        proof = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        if not isinstance(proof, dict) or not proof.get("verified"):
            raise gl.vm.UserError("INVALID_TRANSFER_FINALITY_EVIDENCE: Unverified or unfinalized transfer receipt")

        self.consumed_payout_receipts[p_hash] = u256(withdrawal_id)
        self.consumed_payout_receipts[c_hash] = u256(withdrawal_id)

        self.total_pending_outbound = u256(int(self.total_pending_outbound) - amt)
        self.total_value_locked = u256(int(self.total_value_locked) - amt)

        rec["status"] = "RECONCILED"
        rec["parent_tx_hash"] = p_hash
        rec["child_tx_hash"] = c_hash
        rec["reconciled_at"] = self._now()
        self.pending_outbound[u256(withdrawal_id)] = json.dumps(rec)
        self._assert_invariant()

    @gl.public.write.payable
    def recapitalize_payouts(self) -> None:
        """
        Allows anyone to recapitalize or top up the vault.
        Funds are credited to sender's pull_credits while preserving the conservation invariant.
        """
        sender = str(gl.message.sender_address)
        deposit = int(gl.message.value)
        self.total_value_locked = u256(int(self.total_value_locked) + deposit)
        curr_credit = int(self.pull_credits.get(sender, u256(0)))
        self.pull_credits[sender] = u256(curr_credit + deposit)
        self.total_credits = u256(int(self.total_credits) + deposit)
        self._assert_invariant()

    # =========================================================================
    # Views
    # =========================================================================

    @gl.public.view
    def get_charter_count(self) -> int:
        return int(self.charter_counter)

    @gl.public.view
    def get_claim_count(self) -> int:
        return int(self.claim_counter)

    @gl.public.view
    def get_config(self) -> str:
        return json.dumps({
            "bootstrapper": self.bootstrapper,
            "charter_gate": self.charter_gate,
            "drift_auditor": self.drift_auditor,
            "stage_timeout_seconds": int(self.stage_timeout_seconds)
        })

    @gl.public.view
    def get_charter(self, charter_id: int) -> str:
        return self.charters.get(u256(charter_id), "")

    @gl.public.view
    def get_claim(self, claim_id: int) -> str:
        return self.claims.get(u256(claim_id), "")

    @gl.public.view
    def get_pull_credit(self, account: str) -> u256:
        return self.pull_credits.get(account, u256(0))

    @gl.public.view
    def get_withdrawal(self, withdrawal_id: int) -> str:
        return self.pending_outbound.get(u256(withdrawal_id), "")

    @gl.public.view
    def get_accounting(self) -> str:
        escrow = int(self.total_escrow)
        credits = int(self.total_credits)
        pending = int(self.total_pending_outbound)
        tvl = int(self.total_value_locked)
        return json.dumps({
            "total_escrow": escrow,
            "total_credits": credits,
            "total_pending_outbound": pending,
            "total_value_locked": tvl,
            "invariant_valid": (escrow + credits + pending == tvl)
        })
