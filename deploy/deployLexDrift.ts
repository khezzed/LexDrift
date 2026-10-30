import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient, chains, createAccount, generatePrivateKey } from 'genlayer-js';

// Setup custom browser User-Agent header across all fetch calls
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const origFetch = globalThis.fetch;
globalThis.fetch = (url, init = {}) => {
  const headers = new Headers(init?.headers || {});
  if (!headers.has('User-Agent')) {
    headers.set('User-Agent', BROWSER_UA);
  }
  return origFetch(url, { ...init, headers });
};

const STATE_FILE = path.resolve('deployments/state.json');
const STUDIONET_FILE = path.resolve('deployments/studionet.json');

export function loadState(): Record<string, any> {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

export function saveState(patch: Record<string, any>): Record<string, any> {
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

export async function callWithRetry<T>(fn: () => Promise<T>, retries = 6, delayMs = 3000): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      console.warn(`    [Retryable RPC Warning ${attempt}/${retries}]: ${err.message || err}`);
      await new Promise(r => setTimeout(r, delayMs * attempt));
    }
  }
  throw lastErr;
}

function sha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
}

async function main() {
  console.log('===============================================================');
  console.log('          LexDrift StudioNet Autonomous Deployment            ');
  console.log('===============================================================');

  const { client, account } = getStudioClient();
  console.log(`Deployer Address : ${account.address}`);
  console.log(`Chain ID         : 61999 (StudioNet)`);
  console.log(`RPC Endpoint     : https://studio.genlayer.com/api`);

  const vaultCode = fs.readFileSync(path.resolve('contracts/lex_vault.py'), 'utf-8');
  const gateCode = fs.readFileSync(path.resolve('contracts/charter_gate.py'), 'utf-8');
  const auditorCode = fs.readFileSync(path.resolve('contracts/drift_auditor.py'), 'utf-8');

  const vaultSourceHash = sha256(vaultCode);
  const gateSourceHash = sha256(gateCode);
  const auditorSourceHash = sha256(auditorCode);

  console.log(`\nSource Hashes (SHA-256):`);
  console.log(`  LexVault     : ${vaultSourceHash} (${vaultCode.length} bytes)`);
  console.log(`  CharterGate  : ${gateSourceHash} (${gateCode.length} bytes)`);
  console.log(`  DriftAuditor : ${auditorSourceHash} (${auditorCode.length} bytes)`);

  const state = loadState();

  // 1. Deploy LexVault
  let vaultAddress = state.lexVaultAddress;
  let vaultDeployTx = state.lexVaultDeployTx;
  if (!vaultAddress) {
    console.log('\n[Phase 1] Deploying LexVault (contracts/lex_vault.py)...');
    vaultDeployTx = await callWithRetry(() => client.deployContract({ code: vaultCode }));
    console.log(`  Deploy Tx Submitted: ${vaultDeployTx}`);
    saveState({ lexVaultDeployTx: vaultDeployTx });

    const finality = await waitForFinality(client, vaultDeployTx!);
    vaultAddress = finality.contractAddress;
    console.log(`  LexVault Finalized at: ${vaultAddress}`);
    saveState({ lexVaultAddress: vaultAddress });
  } else {
    console.log(`\n[Phase 1] LexVault already deployed at: ${vaultAddress}`);
  }

  // 2. Deploy CharterGate with vaultAddress
  let gateAddress = state.charterGateAddress;
  let gateDeployTx = state.charterGateDeployTx;
  if (!gateAddress) {
    console.log('\n[Phase 2] Deploying CharterGate (contracts/charter_gate.py)...');
    gateDeployTx = await callWithRetry(() => client.deployContract({
      code: gateCode,
      args: [vaultAddress]
    }));
    console.log(`  Deploy Tx Submitted: ${gateDeployTx}`);
    saveState({ charterGateDeployTx: gateDeployTx });

    const finality = await waitForFinality(client, gateDeployTx!);
    gateAddress = finality.contractAddress;
    console.log(`  CharterGate Finalized at: ${gateAddress}`);
    saveState({ charterGateAddress: gateAddress });
  } else {
    console.log(`\n[Phase 2] CharterGate already deployed at: ${gateAddress}`);
  }

  // 3. Deploy DriftAuditor with vaultAddress
  let auditorAddress = state.driftAuditorAddress;
  let auditorDeployTx = state.driftAuditorDeployTx;
  if (!auditorAddress) {
    console.log('\n[Phase 3] Deploying DriftAuditor (contracts/drift_auditor.py)...');
    auditorDeployTx = await callWithRetry(() => client.deployContract({
      code: auditorCode,
      args: [vaultAddress]
    }));
    console.log(`  Deploy Tx Submitted: ${auditorDeployTx}`);
    saveState({ driftAuditorDeployTx: auditorDeployTx });

    const finality = await waitForFinality(client, auditorDeployTx!);
    auditorAddress = finality.contractAddress;
    console.log(`  DriftAuditor Finalized at: ${auditorAddress}`);
    saveState({ driftAuditorAddress: auditorAddress });
  } else {
    console.log(`\n[Phase 3] DriftAuditor already deployed at: ${auditorAddress}`);
  }

  // 4. Two-Phase Bootstrap: Configure LexVault with gate and auditor
  let configTx = state.configureTx;
  if (!configTx) {
    console.log('\n[Phase 4] Configuring LexVault Two-Phase Bootstrap...');
    console.log(`  Configuring gate: ${gateAddress}, auditor: ${auditorAddress}`);
    configTx = await callWithRetry(() => client.writeContract({
      address: vaultAddress as `0x${string}`,
      functionName: 'configure',
      args: [gateAddress, auditorAddress],
      value: 0n
    }));
    console.log(`  Configure Tx Submitted: ${configTx}`);
    saveState({ configureTx: configTx });

    const finality = await waitForFinality(client, configTx!);
    console.log(`  Configuration Finalized with Result: ${finality.result}`);
  } else {
    console.log(`\n[Phase 4] LexVault already configured in tx: ${configTx}`);
  }

  // 5. Post-Deploy Verification: Verify Config & Accounting Invariant
  console.log('\n[Phase 5] Post-Deploy Read Verification...');
  const configRaw = await callWithRetry(() => client.readContract({
    address: vaultAddress as `0x${string}`,
    functionName: 'get_config',
    args: []
  }));
  const config = JSON.parse(String(configRaw));
  console.log('  Live get_config():', config);

  const accountingRaw = await callWithRetry(() => client.readContract({
    address: vaultAddress as `0x${string}`,
    functionName: 'get_accounting',
    args: []
  }));
  const accounting = JSON.parse(String(accountingRaw));
  console.log('  Live get_accounting():', accounting);

  if (!accounting.invariant_valid) {
    throw new Error('POST_DEPLOY_FAIL: Accounting invariant invalid!');
  }

  // 6. Post-Deploy Bytecode Verification
  console.log('\n[Phase 6] Bytecode / Source Code On-Chain Integrity Verification...');
  const onChainVaultCode = await callWithRetry(() => client.getContractCode(vaultAddress as `0x${string}`));
  const onChainGateCode = await callWithRetry(() => client.getContractCode(gateAddress as `0x${string}`));
  const onChainAuditorCode = await callWithRetry(() => client.getContractCode(auditorAddress as `0x${string}`));

  const onChainVaultHash = sha256(onChainVaultCode);
  const onChainGateHash = sha256(onChainGateCode);
  const onChainAuditorHash = sha256(onChainAuditorCode);

  console.log(`  LexVault     SHA-256: Local=${vaultSourceHash} | OnChain=${onChainVaultHash} | Match=${vaultSourceHash === onChainVaultHash}`);
  console.log(`  CharterGate  SHA-256: Local=${gateSourceHash} | OnChain=${onChainGateHash} | Match=${gateSourceHash === onChainGateHash}`);
  console.log(`  DriftAuditor SHA-256: Local=${auditorSourceHash} | OnChain=${onChainAuditorHash} | Match=${auditorSourceHash === onChainAuditorHash}`);

  const manifest = {
    projectName: 'LexDrift',
    tagline: 'Real-time Multi-Snapshot Autonomous Legal & Governance Policy Drift Sentinel on GenLayer',
    network: {
      networkName: 'GenLayer StudioNet',
      chainId: 61999,
      rpcUrl: 'https://studio.genlayer.com/api'
    },
    runnerHash: 'py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6',
    deployedAt: new Date().toISOString(),
    deployer: account.address,
    contracts: {
      lexVault: {
        address: vaultAddress,
        deployTxHash: vaultDeployTx,
        sourceSha256: vaultSourceHash,
        onChainSha256: onChainVaultHash,
        verified: vaultSourceHash === onChainVaultHash
      },
      charterGate: {
        address: gateAddress,
        deployTxHash: gateDeployTx,
        sourceSha256: gateSourceHash,
        onChainSha256: onChainGateHash,
        verified: gateSourceHash === onChainGateHash
      },
      driftAuditor: {
        address: auditorAddress,
        deployTxHash: auditorDeployTx,
        sourceSha256: auditorSourceHash,
        onChainSha256: onChainAuditorHash,
        verified: auditorSourceHash === onChainAuditorHash
      }
    },
    bootstrapping: {
      configureTxHash: configTx,
      bootstrapper: config.bootstrapper,
      stageTimeoutSeconds: config.stage_timeout_seconds
    },
    initialAccounting: accounting
  };

  fs.mkdirSync(path.dirname(STUDIONET_FILE), { recursive: true });
  fs.writeFileSync(STUDIONET_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`\n===============================================================`);
  console.log(`Deployment successfully recorded in: ${STUDIONET_FILE}`);
  console.log(`===============================================================`);
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('deploy/deployLexDrift.ts')) {
  main().catch(err => {
    console.error('Fatal deployment failure:', err);
    process.exit(1);
  });
}
