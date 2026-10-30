import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient, chains, createAccount, generatePrivateKey } from 'genlayer-js';

// Setup custom browser User-Agent header across all fetch calls to respect RPC and CDN rules
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const origFetch = globalThis.fetch;
globalThis.fetch = (url, init = {}) => {
  const headers = new Headers(init.headers || {});
  if (!headers.has('User-Agent')) {
    headers.set('User-Agent', BROWSER_UA);
  }
  return origFetch(url, { ...init, headers });
};

const STATE_FILE = path.resolve('deployments/state.json');
const RESULTS_FILE = path.resolve('deployments/probe-studionet.json');

interface DeploymentState {
  deployerPrivateKey?: string;
  probeContractAddress?: string;
  probeDeployTx?: string;
  updatedAt?: string;
}

export function loadState(): DeploymentState {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

export function saveState(patch: Partial<DeploymentState>): DeploymentState {
  const current = loadState();
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export function getStudioClient(privateKey?: string) {
  const state = loadState();
  let pk = privateKey || state.deployerPrivateKey;
  if (!pk || typeof pk !== 'string' || pk.length !== 66) {
    pk = generatePrivateKey();
    saveState({ deployerPrivateKey: pk });
  }

  const account = createAccount(pk as `0x${string}`);
  const client = createClient({
    chain: {
      ...chains.studionet,
      rpcUrls: {
        default: {
          http: ['https://studio.genlayer.com/api']
        }
      }
    },
    account
  });

  return { client, account, privateKey: pk };
}

export async function waitForFinality(client: any, txHash: string, maxAttempts = 60) {
  console.log(`[POLL] Waiting for finality of tx: ${txHash}`);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise(r => setTimeout(r, 8000));
    try {
      const tx = await client.getTransaction({ hash: txHash });
      const statusName = tx.statusName || (tx.consensus_history?.current_status_changes?.includes('FINALIZED') ? 'FINALIZED' : 'PENDING');
      const resultName = tx.result_name || 'UNKNOWN';
      const lr = tx.consensus_data?.leader_receipt?.[0];
      const execResult = lr?.execution_result || 'PENDING';
      const returnPayload = lr?.result?.payload?.readable || lr?.result?.payload || '';
      console.log(`  [Attempt ${attempt}/${maxAttempts}] Status: ${statusName} | Consensus: ${resultName} | GenVM: ${execResult} ${typeof returnPayload === 'object' ? JSON.stringify(returnPayload) : returnPayload}`);

      if (statusName === 'FINALIZED' || statusName === 'ACCEPTED') {
        if (execResult === 'ERROR') {
          const stderr = lr?.genvm_result?.stderr || JSON.stringify(lr?.result);
          throw new Error(`GenVM execution ERROR in tx ${txHash}:\n${stderr}`);
        }
      }

      if (statusName === 'FINALIZED') {
        const contractAddress = tx.to_address || tx.contract_address || (tx.data && tx.data.contract_address);
        return {
          finalized: true,
          status: statusName,
          result: resultName,
          executionResult: execResult,
          returnReadable: returnPayload,
          contractAddress,
          tx
        };
      }
    } catch (err: any) {
      if (err.message && err.message.includes('GenVM execution ERROR')) {
        throw err;
      }
      console.warn(`  [Poll warning attempt ${attempt}]: ${err.message}`);
    }
  }
  throw new Error(`Transaction ${txHash} did not finalize within ${maxAttempts * 8}s`);
}

async function fetchLocal(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': BROWSER_UA,
      'Accept': 'text/plain,application/json,text/html,*/*'
    }
  });
  const text = await res.text();
  const digest = crypto.createHash('sha256').update(Buffer.from(text, 'utf-8')).digest('hex');
  return {
    status: res.status,
    byteLength: Buffer.byteLength(text, 'utf-8'),
    sha256: digest,
    text
  };
}

async function main() {
  console.log('===============================================================');
  console.log('   LexDrift - StudioNet Network Probe & URL Immobility Test   ');
  console.log('===============================================================');

  const { client, account, privateKey } = getStudioClient();
  console.log(`Deployer Address: ${account.address}`);
  console.log(`StudioNet Chain ID: ${chains.studionet.id} (61999)`);
  console.log(`StudioNet RPC: https://studio.genlayer.com/api`);

  // Step 1: Deploy probe contract
  const contractPath = path.resolve('contracts/probe.py');
  const code = fs.readFileSync(contractPath, 'utf-8');
  console.log(`Loaded contracts/probe.py (${code.length} bytes)`);

  let probeAddress = loadState().probeContractAddress;
  let deployTxHash = loadState().probeDeployTx;

  if (!probeAddress) {
    console.log('\n[Phase 1.A] Deploying probe.py with runner py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6...');
    deployTxHash = await client.deployContract({ code });
    console.log(`Deploy Tx Submitted: ${deployTxHash}`);
    saveState({ probeDeployTx: deployTxHash });

    const finality = await waitForFinality(client, deployTxHash!);
    probeAddress = finality.contractAddress;
    console.log(`Probe Contract Finalized at: ${probeAddress}`);
    saveState({ probeContractAddress: probeAddress });
  } else {
    console.log(`Using existing deployed probe contract at: ${probeAddress}`);
  }

  // Step 2: Test candidate public historical URLs
  console.log('\n[Phase 1.B] Testing Candidate URLs on StudioNet Validators...');

  const testUrls = [
    {
      caseId: 'material_drift_t0',
      description: 'Material Drift T0 Baseline: Terraform v1.5.5 LICENSE (MPL-2.0 permissive open-source)',
      url: 'https://raw.githubusercontent.com/hashicorp/terraform/c10eb21b390627a6259eef9cd883e6ddeccc5716/LICENSE',
      expectedStatus: 200,
      verbatimAnchor: 'Mozilla Public License, version 2.0'
    },
    {
      caseId: 'material_drift_t1',
      description: 'Material Drift T1 Adverse: Terraform v1.6.0 LICENSE (BUSL-1.1 commercial restriction)',
      url: 'https://raw.githubusercontent.com/hashicorp/terraform/edb8ea4baa43421a73d7ba50fed957e6be599b45/LICENSE',
      expectedStatus: 200,
      verbatimAnchor: 'Business Source License'
    },
    {
      caseId: 'benign_revision_t0',
      description: 'Benign Revision T0 Baseline: Express v4.18.2 Readme.md (MIT License reference)',
      url: 'https://raw.githubusercontent.com/expressjs/express/8368dc178af16b91b576c4c1d135f701a0007e5d/Readme.md',
      expectedStatus: 200,
      verbatimAnchor: '[MIT licensed](LICENSE)'
    },
    {
      caseId: 'benign_revision_t1',
      description: 'Benign Revision T1 Benign: Express v4.19.1 Readme.md (git:// -> https:// update, license identical)',
      url: 'https://raw.githubusercontent.com/expressjs/express/4f0f6cc67d531431c096ea006c2191b92931bbc3/Readme.md',
      expectedStatus: 200,
      verbatimAnchor: '[MIT licensed](LICENSE)'
    },
    {
      caseId: 'wikipedia_revision',
      description: 'Wikipedia Permanent Revision API: Five Pillars policy (oldid=1313172847)',
      url: 'https://en.wikipedia.org/w/api.php?action=parse&oldid=1313172847&prop=wikitext&format=json',
      expectedStatus: 200,
      verbatimAnchor: 'Wikipedia has no firm rules'
    },
    {
      caseId: 'wayback_raw_snapshot',
      description: 'Wayback Machine Raw Snapshot: Example.com historical id_ capture',
      url: 'https://web.archive.org/web/20230101000000id_/https://example.com',
      expectedStatus: 200, // Or probe will reveal if 429 rate-limited on StudioNet
      verbatimAnchor: 'Example Domain'
    }
  ];

  const probeResults: Record<string, any> = {
    chain: {
      id: 61999,
      name: 'Genlayer Studio Network',
      rpc: 'https://studio.genlayer.com/api'
    },
    runnerHash: 'py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6',
    probeContractAddress: probeAddress,
    deployTxHash: deployTxHash,
    executedAt: new Date().toISOString(),
    cases: {}
  };

  for (const testItem of testUrls) {
    console.log(`\n--- Probing [${testItem.caseId}]: ${testItem.description} ---`);
    console.log(`URL: ${testItem.url}`);

    // Local fetch verification
    let localResult: any = null;
    try {
      localResult = await fetchLocal(testItem.url);
      console.log(`  [LOCAL] HTTP Status: ${localResult.status} | Size: ${localResult.byteLength} bytes | SHA-256: ${localResult.sha256}`);
      const hasAnchor = localResult.text.includes(testItem.verbatimAnchor);
      console.log(`  [LOCAL] Verbatim Anchor ("${testItem.verbatimAnchor}") present: ${hasAnchor}`);
    } catch (e: any) {
      console.warn(`  [LOCAL] Fetch error: ${e.message}`);
    }

    // On-Chain StudioNet validator probe
    try {
      console.log(`  [STUDIONET] Calling writeContract(probe_url)...`);
      const targetAddress = probeAddress as `0x${string}`;
      const callTx = await client.writeContract({
        address: targetAddress,
        functionName: 'probe_url',
        args: [testItem.url],
        value: 0n
      });
      console.log(`  [STUDIONET] Tx Hash: ${callTx}`);

      const callFinality = await waitForFinality(client, callTx);
      console.log(`  [STUDIONET] Finalized with Consensus: ${callFinality.result}`);

      // Read back on-chain record
      const onChainRecordRaw = await client.readContract({
        address: targetAddress,
        functionName: 'get_probe_record',
        args: [testItem.url]
      });

      const onChainRecordStr = String(onChainRecordRaw ?? '');
      console.log(`  [STUDIONET] On-Chain Record: ${onChainRecordStr}`);
      let parsedOnChain: any = {};
      try {
        parsedOnChain = JSON.parse(onChainRecordStr);
      } catch {
        parsedOnChain = { raw: onChainRecordStr };
      }

      probeResults.cases[testItem.caseId] = {
        description: testItem.description,
        url: testItem.url,
        txHash: callTx,
        consensusResult: callFinality.result,
        local: {
          httpStatus: localResult?.status,
          byteSize: localResult?.byteLength,
          sha256: localResult?.sha256,
          verbatimAnchor: testItem.verbatimAnchor,
          verbatimAnchorFound: localResult ? localResult.text.includes(testItem.verbatimAnchor) : false
        },
        onChain: parsedOnChain,
        isDeterministicMatch: localResult ? (localResult.sha256 === parsedOnChain.sha256) : false
      };
    } catch (err: any) {
      console.error(`  [STUDIONET] Error probing ${testItem.caseId}: ${err.message}`);
      probeResults.cases[testItem.caseId] = {
        description: testItem.description,
        url: testItem.url,
        error: err.message,
        local: localResult
      };
    }

    // Cooldown 6s between calls to strictly prevent RPC rate limiting
    console.log('  [COOLDOWN] Waiting 6 seconds before next probe...');
    await new Promise(r => setTimeout(r, 6000));
  }

  // Save results
  fs.mkdirSync(path.dirname(RESULTS_FILE), { recursive: true });
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(probeResults, null, 2), 'utf-8');
  console.log(`\n===============================================================`);
  console.log(`Probe complete! Results saved to: ${RESULTS_FILE}`);
  console.log(`===============================================================`);
}

main().catch(err => {
  console.error('Fatal probe execution failure:', err);
  process.exit(1);
});
