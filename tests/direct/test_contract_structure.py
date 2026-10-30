import ast
from pathlib import Path
import pytest

CONTRACTS_DIR = Path(__file__).resolve().parent.parent.parent / "contracts"


def get_contract_code(filename: str) -> str:
    filepath = CONTRACTS_DIR / filename
    assert filepath.exists(), f"Contract file not found: {filepath}"
    return filepath.read_text(encoding="utf-8")


def test_contract_headers():
    """Verify all contracts have the required GenLayer dependency header and import."""
    expected_dep = '# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }'
    for filename in ["lex_vault.py", "charter_gate.py", "drift_auditor.py"]:
        code = get_contract_code(filename)
        first_line = code.splitlines()[0].strip()
        assert first_line == expected_dep, f"{filename} does not start with exact GenLayer dependency comment"
        assert "from genlayer import *" in code, f"{filename} does not import genlayer wildcard"


def parse_contract_ast(filename: str):
    code = get_contract_code(filename)
    return ast.parse(code)


def find_class_in_ast(tree: ast.AST, class_name: str) -> ast.ClassDef:
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef) and node.name == class_name:
            return node
    raise AssertionError(f"Class {class_name} not found in AST")


def get_decorator_names(func: ast.FunctionDef) -> list[str]:
    names = []
    for d in func.decorator_list:
        if isinstance(d, ast.Attribute):
            names.append(ast.unparse(d))
        elif isinstance(d, ast.Name):
            names.append(d.id)
        elif isinstance(d, ast.Call):
            names.append(ast.unparse(d.func))
    return names


def test_lex_vault_structure():
    """Verify LexVault class structure, decorators, and security guards."""
    tree = parse_contract_ast("lex_vault.py")
    cls = find_class_in_ast(tree, "LexVault")

    # Verify inheritance from gl.Contract
    bases = [ast.unparse(b) for b in cls.bases]
    assert "gl.Contract" in bases, "LexVault does not inherit from gl.Contract"

    # Verify method presence and decorators
    methods = {item.name: item for item in cls.body if isinstance(item, ast.FunctionDef)}

    expected_writes = [
        "configure",
        "record_charter_attestation",
        "disclose_claim",
        "record_drift_verdict",
        "expire_stage",
        "request_withdrawal",
        "reconcile_withdrawal",
        "advance_time"
    ]
    expected_payables = [
        "open_charter",
        "seal_claim",
        "recapitalize_payouts"
    ]
    expected_views = [
        "get_charter_count",
        "get_claim_count",
        "get_config",
        "get_charter",
        "get_claim",
        "get_pull_credit",
        "get_withdrawal",
        "get_accounting"
    ]

    for m in expected_writes:
        assert m in methods, f"Missing write method: {m}"
        decs = get_decorator_names(methods[m])
        assert "gl.public.write" in decs, f"Method {m} missing @gl.public.write: {decs}"

    for m in expected_payables:
        assert m in methods, f"Missing payable method: {m}"
        decs = get_decorator_names(methods[m])
        assert "gl.public.write.payable" in decs, f"Method {m} missing @gl.public.write.payable: {decs}"

    for m in expected_views:
        assert m in methods, f"Missing view method: {m}"
        decs = get_decorator_names(methods[m])
        assert "gl.public.view" in decs, f"Method {m} missing @gl.public.view: {decs}"

    # Verify internal helpers: _assert_invariant, _now
    assert "_assert_invariant" in methods, "LexVault missing _assert_invariant helper"
    assert "_now" in methods, "LexVault missing _now helper"


def test_charter_gate_structure():
    """Verify CharterGate class structure and methods."""
    tree = parse_contract_ast("charter_gate.py")
    cls = find_class_in_ast(tree, "CharterGate")

    bases = [ast.unparse(b) for b in cls.bases]
    assert "gl.Contract" in bases, "CharterGate does not inherit from gl.Contract"

    methods = {item.name: item for item in cls.body if isinstance(item, ast.FunctionDef)}
    assert "set_vault" in methods
    assert "attest_charter" in methods
    assert "get_attestation" in methods
    assert "get_vault" in methods

    assert "gl.public.write" in get_decorator_names(methods["attest_charter"])
    assert "gl.public.write" in get_decorator_names(methods["set_vault"])
    assert "gl.public.view" in get_decorator_names(methods["get_attestation"])
    assert "gl.public.view" in get_decorator_names(methods["get_vault"])


def test_drift_auditor_structure():
    """Verify DriftAuditor class structure and methods."""
    tree = parse_contract_ast("drift_auditor.py")
    cls = find_class_in_ast(tree, "DriftAuditor")

    bases = [ast.unparse(b) for b in cls.bases]
    assert "gl.Contract" in bases, "DriftAuditor does not inherit from gl.Contract"

    methods = {item.name: item for item in cls.body if isinstance(item, ast.FunctionDef)}
    assert "set_vault" in methods
    assert "audit_drift" in methods
    assert "get_audit" in methods
    assert "get_vault" in methods

    assert "gl.public.write" in get_decorator_names(methods["audit_drift"])
    assert "gl.public.write" in get_decorator_names(methods["set_vault"])
    assert "gl.public.view" in get_decorator_names(methods["get_audit"])
    assert "gl.public.view" in get_decorator_names(methods["get_vault"])
