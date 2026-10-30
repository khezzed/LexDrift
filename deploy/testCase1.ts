import fs from 'node:fs';
import path from 'node:path';
import { getStudioClient, waitForFinality } from './deployLexDrift.js';

async function main() {
  console.log('Testing open_charter on StudioNet...');
  const { client, account } = getStudioClient();
  const deployments = JSON.parse(fs.readFileSync(path.resolve('deployments/studionet.json'), 'utf-8'));
  const vaultAddress = deployments.contracts.lexVault.address;
  const gateAddress = deployments.contracts.charterGate.address;

  console.log('Account :', account.address);
  console.log('Vault   :', vaultAddress);
  console.log('Gate    :', gateAddress);

  const baselineUrl = 'https://raw.githubusercontent.com/expressjs/express/8368dc178af16b91b576c4c1d135f701a0007e5d/Readme.md';
  const vagueRule = 'Keep the framework fast, modern, and developer-friendly at all times.';

  const countRaw = await client.readContract({
    address: vaultAddress as `0x${string}`,
    functionName: 'get_charter_count',
    args: []
  });
  console.log('Initial charter count:', countRaw);

  console.log('Calling open_charter with 1000 wei deposit...');
  const tx = await client.writeContract({
    address: vaultAddress as `0x${string}`,
    functionName: 'open_charter',
    args: [baselineUrl, vagueRule],
    value: 1000n
  });
  console.log('Submitted tx:', tx);

  const fin = await waitForFinality(client, tx);
  console.log('Finality status:', fin.status, 'consensus:', fin.result, 'GenVM:', fin.executionResult);

  const countAfter = await client.readContract({
    address: vaultAddress as `0x${string}`,
    functionName: 'get_charter_count',
    args: []
  });
  console.log('Charter count after:', countAfter);

  const charterRaw = await client.readContract({
    address: vaultAddress as `0x${string}`,
    functionName: 'get_charter',
    args: [Number(countAfter)]
  });
  console.log('Charter details:', charterRaw);
}

main().catch(err => {
  console.error('Error in test:', err);
  process.exit(1);
});
