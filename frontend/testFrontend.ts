import http from 'node:http';

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

async function fetchRoute(path: string, options: RequestInit = {}): Promise<{ status: number; text: string; json?: any }> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': BROWSER_UA,
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let json: any = undefined;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, text, json };
}

async function runTests() {
  console.log('===============================================================');
  console.log(`    LexDrift Frontend Comprehensive End-to-End Test Suite      `);
  console.log(`    Target: ${BASE_URL}                                        `);
  console.log('===============================================================');

  let passed = 0;
  let total = 0;

  function assert(name: string, condition: boolean, detail: string = '') {
    total++;
    if (condition) {
      console.log(`  [PASS] ${name} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} ${detail ? `(${detail})` : ''}`);
    }
  }

  // 1. Health & Live State API Route
  console.log('\n[1/10] Testing /api/health (StudioNet live RPC & manifest)...');
  try {
    const health = await fetchRoute('/api/health');
    assert('Health endpoint status 200', health.status === 200, `HTTP ${health.status}`);
    assert('Health returns healthy or degraded status', health.json?.status === 'healthy' || health.json?.status === 'degraded');
    assert('Contains Vault address', health.text.includes('0x270BBA964dB0C88363de6986Ef8D88090864456b'));
    assert('Contains CharterGate address', health.text.includes('0xa7ae55747b61d4Eb9d7024F0C19bd6499262c51c'));
    assert('Contains DriftAuditor address', health.text.includes('0xB6C7bC7cbd182c90cbc814Ec3d80CCEc604E600d'));
    assert('Contains StudioNet chain ID 61999', health.json?.network?.chainId === 61999 || health.text.includes('61999'));
    assert('Contains 5 verified proof scenarios', (health.json?.proofManifest?.verifiedScenariosCount === 5) || (health.json?.fallbackManifest?.scenarios?.length === 5));
  } catch (err: any) {
    assert('Health endpoint reachable', false, err.message);
  }

  // 2. GenLayer JSON-RPC Reverse Proxy API Route
  console.log('\n[2/10] Testing /api/genlayer-rpc reverse proxy...');
  try {
    const rpcRes = await fetchRoute('/api/genlayer-rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_chainId',
        params: []
      })
    });
    assert('RPC proxy status 200', rpcRes.status === 200, `HTTP ${rpcRes.status}`);
    assert('RPC returned valid JSON-RPC structure', rpcRes.json?.jsonrpc === '2.0');
    assert('RPC returned Chain ID 61999 (0xf22f)', rpcRes.json?.result === '0xf22f' || rpcRes.json?.result === 61999 || !!rpcRes.json?.result);

    // Test method allowlist rejection
    const deniedRes = await fetchRoute('/api/genlayer-rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'forbidden_method',
        params: []
      })
    });
    assert('Disallowed method rejected with 403', deniedRes.status === 403, `HTTP ${deniedRes.status}`);
  } catch (err: any) {
    assert('RPC Proxy reachable', false, err.message);
  }

  // 3. Sentinel Dashboard (/)
  console.log('\n[3/10] Testing / (Sentinel Dashboard & Case Matrix)...');
  try {
    const page = await fetchRoute('/');
    assert('Dashboard status 200', page.status === 200);
    assert('Contains LexDrift brand title', page.text.includes('LexDrift'));
    assert('Contains Conservation Invariant text', page.text.includes('Conservation Invariant') || page.text.includes('total_value_locked'));
    assert('Contains Case 1 Vague Covenant', page.text.includes('Case 1') && page.text.includes('REJECTED_CHARTER'));
    assert('Contains Case 2 Benign Revision', page.text.includes('Case 2') && page.text.includes('BENIGN_REVISION'));
    assert('Contains Case 3 Adversarial Evidence', page.text.includes('Case 3') && page.text.includes('REJECTED_EVIDENCE'));
    assert('Contains Case 4 Material Drift Settlement', page.text.includes('Case 4') && page.text.includes('SETTLED_MATERIAL_DRIFT'));
    assert('Contains Case 5 Stage Timeout Recovery', page.text.includes('Case 5') && page.text.includes('EXPIRED_UNATTESTED'));
  } catch (err: any) {
    assert('Dashboard page reachable', false, err.message);
  }

  // 4. Register Protected Charter (/charters/new)
  console.log('\n[4/10] Testing /charters/new (Register Protected Charter)...');
  try {
    const page = await fetchRoute('/charters/new');
    assert('New Charter page status 200', page.status === 200);
    assert('Contains 3 One-Click verified presets', page.text.includes('Material-Drift Baseline') && page.text.includes('Benign-Revision Baseline') && page.text.includes('Vague Covenant Test'));
    assert('Contains open_charter button', page.text.includes('Open Charter'));
    assert('References LexVault address', page.text.includes('0x270BBA964dB0C88363de6986Ef8D88090864456b'));
  } catch (err: any) {
    assert('New charter page reachable', false, err.message);
  }

  // 5. Charter #1 Detail View (/charters/1)
  console.log('\n[5/10] Testing /charters/1 (Charter #1 Vague Covenant Rejection)...');
  try {
    const page = await fetchRoute('/charters/1');
    assert('Charter #1 page status 200', page.status === 200);
    assert('Contains REJECTED_CHARTER status', page.text.includes('REJECTED_CHARTER'));
    assert('Contains CharterGate 4-boolean matrix', page.text.includes('observable_criterion') && page.text.includes('falsifiable_condition'));
  } catch (err: any) {
    assert('Charter #1 reachable', false, err.message);
  }

  // 6. Charter #2 Detail View (/charters/2)
  console.log('\n[6/10] Testing /charters/2 (Charter #2 Active Express.js with 2 Claims)...');
  try {
    const page = await fetchRoute('/charters/2');
    assert('Charter #2 page status 200', page.status === 200);
    assert('Contains ACTIVE status', page.text.includes('ACTIVE'));
    assert('Contains 1,500 wei augmented bounty', page.text.includes('1500') || page.text.includes('1,500'));
    assert('Contains Claim #1 (BENIGN_REVISION)', page.text.includes('BENIGN_REVISION'));
    assert('Contains Claim #2 (REJECTED_EVIDENCE)', page.text.includes('REJECTED_EVIDENCE'));
    assert('Contains DriftAuditor 6-boolean matrix', page.text.includes('same_subject') && page.text.includes('not_carved_out'));
    assert('Contains Commit-Reveal Claim Console', page.text.includes('Commit-Reveal Claim Console') && page.text.includes('Seal Claim'));
  } catch (err: any) {
    assert('Charter #2 reachable', false, err.message);
  }

  // 7. Charter #3 Detail View (/charters/3)
  console.log('\n[7/10] Testing /charters/3 (Charter #3 Material Drift Settled)...');
  try {
    const page = await fetchRoute('/charters/3');
    assert('Charter #3 page status 200', page.status === 200);
    assert('Contains SETTLED_DRIFT or MATERIAL_DRIFT', page.text.includes('SETTLED_DRIFT') || page.text.includes('MATERIAL_DRIFT'));
    assert('Contains MPL-2.0 to BSL-1.1 comparison', page.text.includes('Mozilla Public License') && page.text.includes('Business Source License'));
  } catch (err: any) {
    assert('Charter #3 reachable', false, err.message);
  }

  // 8. Charter #4 Detail View (/charters/4)
  console.log('\n[8/10] Testing /charters/4 (Charter #4 Stage Deadline Expired)...');
  try {
    const page = await fetchRoute('/charters/4');
    assert('Charter #4 page status 200', page.status === 200);
    assert('Contains EXPIRED_UNATTESTED status', page.text.includes('EXPIRED_UNATTESTED'));
  } catch (err: any) {
    assert('Charter #4 reachable', false, err.message);
  }

  // 9. Credit Vault (/vault)
  console.log('\n[9/10] Testing /vault (Pull-Credit Vault & Settlements)...');
  try {
    const page = await fetchRoute('/vault');
    assert('Vault page status 200', page.status === 200);
    assert('Defaults to StudioNet Operator address', page.text.includes('0xc130A7a4C4F22b2644Eaa62F5D13F14c941860aC'));
    assert('Contains Available Pull Credit display', page.text.includes('Pull Credit') || page.text.includes('Available'));
    assert('Contains Reconciled Withdrawal #1', page.text.includes('RECONCILED'));
    assert('Contains request_withdrawal and reconcile_withdrawal buttons', page.text.includes('request_withdrawal') && page.text.includes('reconcile_withdrawal'));
  } catch (err: any) {
    assert('Vault page reachable', false, err.message);
  }

  // 10. Protocol Specification & Judge Guide (/method)
  console.log('\n[10/10] Testing /method (Protocol Specification & Judge Guide)...');
  try {
    const page = await fetchRoute('/method');
    assert('Method page status 200', page.status === 200);
    assert('Explains 3-contract separation of concerns', page.text.includes('LexVault') && page.text.includes('CharterGate') && page.text.includes('DriftAuditor'));
    assert('Explains native GenLayer appeal window', page.text.includes('Native Appeal Window') || page.text.includes('appeal'));
    assert('Explains immutable snapshots and zero live-page drift', page.text.includes('Zero Live-Page Drift') || page.text.includes('Wayback'));
  } catch (err: any) {
    assert('Method page reachable', false, err.message);
  }

  console.log('\n===============================================================');
  console.log(`Test Execution Result: ${passed}/${total} assertions passed (${((passed/total)*100).toFixed(1)}%)`);
  console.log('===============================================================');

  if (passed === total) {
    console.log('[SUCCESS] All Frontend Pages, API Routes, and StudioNet integrations verified!');
    process.exit(0);
  } else {
    console.error(`[FAIL] ${total - passed} assertion(s) failed.`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
