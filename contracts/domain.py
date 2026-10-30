# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""
LexDrift Domain Logic & Deterministic Predicates
Provides canonical implementations for:
- Immutable URL allowlist verification (Rule 4)
- Bounded text extraction, normalization, and SHA-256 digests (Rule 5)
- Safe JSON parsing and prompt formatting
- Deterministic verdict derivation and quote verification (Rules 2 & 3)
"""

import hashlib
import json
import re
from typing import Any, Tuple, Dict

# Immutable URL patterns (Rule 4: Evidence must be strictly immutable across validator fetches)
GITHUB_COMMIT_PATTERN = r'^https:\/\/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/([0-9a-fA-F]{40})\/.+$'
WIKIPEDIA_OLDID_PATTERN = r'^https:\/\/en\.wikipedia\.org\/w\/api\.php\?.*oldid=\d+.*$'
ARCHIVE_ORG_ID_PATTERN = r'^https:\/\/web\.archive\.org\/web\/(\d{14})id_\/.+$'


def is_valid_immutable_url(url: str) -> bool:
    """
    Validates that a URL is cryptographically pinned and immutable.
    Accepts only:
    1. GitHub raw content pinned to a 40-character hex commit SHA.
    2. Wikipedia API queries pinned to a specific numeric oldid.
    3. Internet Archive Wayback Machine snapshots using the verbatim 'id_' modifier.
    Rejects mutable references (branches like 'main', 'master', live URLs).
    """
    if not url or not isinstance(url, str):
        return False
    url = url.strip()
    if re.match(GITHUB_COMMIT_PATTERN, url):
        return True
    if re.match(WIKIPEDIA_OLDID_PATTERN, url):
        return True
    if re.match(ARCHIVE_ORG_ID_PATTERN, url):
        return True
    return False


def extract_bounded_text(raw_data: Any, max_chars: int = 4000) -> Tuple[str, str]:
    """
    Extracts, normalizes, and computes the SHA-256 digest of a bounded text slice (max 4,000 chars).
    Normalizes Windows/Unix line endings to \n and strips Wikipedia API envelopes if present.
    """
    if isinstance(raw_data, bytes):
        text = raw_data.decode("utf-8", errors="replace")
    elif isinstance(raw_data, str):
        text = raw_data
    else:
        text = str(raw_data)

    # Normalize line endings
    text = text.replace("\r\n", "\n")

    # If the response is Wikipedia Action API JSON, unwrap the parsed wikitext/HTML
    if text.strip().startswith("{") and "parse" in text:
        try:
            parsed = json.loads(text)
            if "parse" in parsed and "text" in parsed["parse"]:
                raw_html = parsed["parse"]["text"].get("*", "")
                if raw_html:
                    # Strip basic HTML tags for cleaner comparison
                    text = re.sub(r'<[^>]+>', ' ', raw_html)
                    text = re.sub(r'\s+', ' ', text).strip()
        except Exception:
            pass

    bounded_slice = text[:max_chars]
    digest = hashlib.sha256(bounded_slice.encode("utf-8")).hexdigest()
    return bounded_slice, digest


def parse_json_safely(raw_val: Any) -> Dict[str, Any]:
    """
    Extracts and parses JSON from raw LLM output or string envelopes.
    Handles markdown code blocks and leading/trailing explanatory text.
    """
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


def compute_commitment_hash(candidate_url: str, salt: str) -> str:
    """Computes SHA-256 commitment hash for front-running protected claim revelation."""
    return hashlib.sha256(f"{candidate_url}:{salt}".encode("utf-8")).hexdigest()


def evaluate_charter_admissibility(
    booleans: Dict[str, Any],
    baseline_quote: str,
    t0_text: str
) -> Tuple[str, str]:
    """
    Deterministic rule-gate for Charter admissibility:
    Verifies 4 strict booleans:
    1. observable_criterion: Concrete, objective terms (not vague/aspirational).
    2. specific_scope: Specific right, license grant, or policy rule.
    3. falsifiable_condition: Can objectively be violated or preserved in future revisions.
    4. baseline_entails_guarantee: T0 document snapshot supports the stated guarantee.
    Plus verifies that baseline_quote (15-220 chars) is an exact verbatim substring of T0 text.
    """
    b1 = bool(booleans.get("observable_criterion", False))
    b2 = bool(booleans.get("specific_scope", False))
    b3 = bool(booleans.get("falsifiable_condition", False))
    b4 = bool(booleans.get("baseline_entails_guarantee", False))

    quote = str(baseline_quote or "").strip()
    quote_valid = 15 <= len(quote) <= 220 and quote in t0_text

    if not quote_valid:
        if len(quote) < 15:
            reason = "REJECTED: Baseline quote too short or empty (< 15 chars)"
        elif len(quote) > 220:
            reason = "REJECTED: Baseline quote too long (> 220 chars)"
        else:
            reason = "REJECTED: Baseline quote is not a verbatim substring of T0 snapshot"
        return "REJECTED_CHARTER", reason

    if not b1:
        return "REJECTED_CHARTER", "REJECTED: Covenant lacks observable, objective criteria"
    if not b2:
        return "REJECTED_CHARTER", "REJECTED: Covenant lacks specific scope"
    if not b3:
        return "REJECTED_CHARTER", "REJECTED: Covenant condition is not falsifiable"
    if not b4:
        return "REJECTED_CHARTER", "REJECTED: Baseline snapshot does not entail guarantee"

    return "ACTIVE", "ACCEPTED: Admissible covenant grounded in baseline snapshot"


def evaluate_drift_verdict(
    booleans: Dict[str, Any],
    baseline_quote: str,
    candidate_quote: str,
    t0_text: str,
    t1_text: str,
    t0_digest: str,
    t1_digest: str
) -> Tuple[str, str, str]:
    """
    Deterministic verdict derivation for comparative policy/license drift:
    First checks identical digests: if t0_digest == t1_digest, returns BENIGN_REVISION.
    Otherwise checks quote containment and evaluates 6 strict predicates:
    1. same_subject: T0 and T1 govern the same project/service.
    2. chronology_valid: T1 is a valid comparative revision.
    3. baseline_granted_right: T0 granted the protected covenant guarantee.
    4. candidate_modifies_clause: T1 modifies/replaces/removes text vs T0.
    5. materially_adverse_shift: T1 materially erodes/restricts/revokes the guarantee.
    6. not_carved_out: Change is not exempted by explicit carve-out.
    """
    # Deterministic short-circuit on byte-for-byte identical snapshots
    if t0_digest == t1_digest:
        closure = f"BENIGN_REVISION:{t0_digest[:16]}:{t1_digest[:16]}:IDENTICAL"
        return "BENIGN_REVISION", closure, "Identical byte snapshot: no drift possible"

    b_same_subject = bool(booleans.get("same_subject", False))
    b_chronology = bool(booleans.get("chronology_valid", False))
    b_baseline_right = bool(booleans.get("baseline_granted_right", False))
    b_modifies = bool(booleans.get("candidate_modifies_clause", False))
    b_materially_adverse = bool(booleans.get("materially_adverse_shift", False))
    b_not_carved_out = bool(booleans.get("not_carved_out", False))

    q0 = str(baseline_quote or "").strip()
    q1 = str(candidate_quote or "").strip()

    quote_t0_valid = 15 <= len(q0) <= 220 and q0 in t0_text
    quote_t1_valid = 15 <= len(q1) <= 220 and q1 in t1_text

    q0_hash = hashlib.sha256(q0.encode("utf-8")).hexdigest()[:12] if q0 else "no_q0"
    q1_hash = hashlib.sha256(q1.encode("utf-8")).hexdigest()[:12] if q1 else "no_q1"

    if not quote_t0_valid or not quote_t1_valid or not b_same_subject:
        verdict = "REJECTED_EVIDENCE"
        if not b_same_subject:
            reason = "Candidate document governs an unrelated subject or project"
        elif not quote_t0_valid:
            reason = "Baseline quote not found or invalid length in T0"
        else:
            reason = "Candidate quote not found or invalid length in T1"
    elif (
        b_same_subject and
        b_chronology and
        b_baseline_right and
        b_modifies and
        b_materially_adverse and
        b_not_carved_out
    ):
        verdict = "MATERIAL_DRIFT"
        reason = "Candidate revision materially revokes or restricts protected covenant guarantee"
    elif b_same_subject and b_baseline_right and not b_materially_adverse:
        verdict = "BENIGN_REVISION"
        reason = "Candidate revision preserves protected covenant guarantee without adverse shift"
    else:
        verdict = "REJECTED_EVIDENCE"
        reason = "Evidence fails predicate criteria"

    closure = f"{verdict}:{t0_digest[:16]}:{t1_digest[:16]}:{q0_hash}:{q1_hash}"
    return verdict, closure, reason
