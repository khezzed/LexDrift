import { createClient, chains } from 'genlayer-js';
import { LEX_VAULT_ADDRESS, GENLAYER_RPC_URL } from './constants';

export const STUDIONET_CHAIN_ID_HEX = '0xf22f'; // 61999
export const STUDIONET_CHAIN_ID_DEC = 61999;

export const STUDIONET_CHAIN_PARAMS = {
  chainId: STUDIONET_CHAIN_ID_HEX,
  chainName: 'GenLayer StudioNet',
  nativeCurrency: {
    name: 'GEN',
    symbol: 'GEN',
    decimals: 18,
  },
  rpcUrls: ['https://studio.genlayer.com/api'],
  blockExplorerUrls: ['https://explorer-studio.genlayer.com'],
};

export function getEthereumProvider(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).ethereum || null;
}

export async function ensureStudioNetChain(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('No Ethereum-compatible browser wallet found.');
  }

  try {
    const currentChainId = await provider.request({ method: 'eth_chainId' });
    if (typeof currentChainId === 'string' && currentChainId.toLowerCase() === STUDIONET_CHAIN_ID_HEX.toLowerCase()) {
      return;
    }

    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: STUDIONET_CHAIN_ID_HEX }],
    });
  } catch (switchError: any) {
    // Error code 4902 indicates that the chain has not been added to the wallet yet
    if (switchError?.code === 4902 || switchError?.message?.includes('4902') || switchError?.message?.includes('Unrecognized chain')) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [STUDIONET_CHAIN_PARAMS],
      });
    } else {
      throw switchError;
    }
  }
}

export async function getConnectedWallet(): Promise<`0x${string}` | null> {
  const provider = getEthereumProvider();
  if (!provider) return null;

  try {
    const accounts: string[] = await provider.request({ method: 'eth_accounts' });
    if (accounts && accounts.length > 0) {
      return accounts[0] as `0x${string}`;
    }
    return null;
  } catch (err) {
    console.warn('Failed to get connected wallet accounts:', err);
    return null;
  }
}

export async function connectStudioNetWallet(): Promise<`0x${string}`> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error(
      'No Ethereum-compatible browser wallet found (such as MetaMask or Rabby). Please install a wallet extension to connect to GenLayer StudioNet.'
    );
  }

  await ensureStudioNetChain();

  const accounts: string[] = await provider.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('Wallet connection rejected or no accounts returned.');
  }

  return accounts[0] as `0x${string}`;
}

export function getWriteClient(accountAddress: `0x${string}`) {
  const rpcEndpoint =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/genlayer-rpc`
      : GENLAYER_RPC_URL;

  return createClient({
    chain: {
      ...chains.studionet,
      rpcUrls: {
        default: {
          http: [rpcEndpoint],
        },
      },
    },
    endpoint: rpcEndpoint,
    account: accountAddress,
    provider: typeof window !== 'undefined' ? (window as any).ethereum : undefined,
  });
}

export function getReadClient() {
  const rpcEndpoint =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/genlayer-rpc`
      : GENLAYER_RPC_URL;

  return createClient({
    chain: {
      ...chains.studionet,
      rpcUrls: {
        default: {
          http: [rpcEndpoint],
        },
      },
    },
    endpoint: rpcEndpoint,
  });
}

export async function getActiveWriteClient() {
  let account = await getConnectedWallet();
  if (!account) {
    account = await connectStudioNetWallet();
  }
  return {
    client: getWriteClient(account),
    account,
  };
}

// -------------------------------------------------------------
// Real GenLayer Write Contract Helper Functions
// -------------------------------------------------------------

export async function writeOpenCharter(
  baselineUrl: string,
  covenantRule: string,
  bountyWei: bigint
): Promise<`0x${string}`> {
  const { client } = await getActiveWriteClient();
  const txHash = await client.writeContract({
    address: LEX_VAULT_ADDRESS,
    functionName: 'open_charter',
    args: [baselineUrl, covenantRule],
    value: bountyWei,
  });
  return txHash as `0x${string}`;
}

export async function writeSealClaim(
  charterId: number,
  commitmentHash: string,
  bondWei: bigint
): Promise<`0x${string}`> {
  const { client } = await getActiveWriteClient();
  const txHash = await client.writeContract({
    address: LEX_VAULT_ADDRESS,
    functionName: 'seal_claim',
    args: [charterId, commitmentHash],
    value: bondWei,
  });
  return txHash as `0x${string}`;
}

export async function writeDiscloseClaim(
  claimId: number,
  candidateUrl: string,
  salt: string
): Promise<`0x${string}`> {
  const { client } = await getActiveWriteClient();
  const txHash = await client.writeContract({
    address: LEX_VAULT_ADDRESS,
    functionName: 'disclose_claim',
    args: [claimId, candidateUrl, salt],
    value: 0n,
  });
  return txHash as `0x${string}`;
}

export async function writeRequestWithdrawal(amountWei: number): Promise<`0x${string}`> {
  const { client } = await getActiveWriteClient();
  const txHash = await client.writeContract({
    address: LEX_VAULT_ADDRESS,
    functionName: 'request_withdrawal',
    args: [amountWei],
    value: 0n,
  });
  return txHash as `0x${string}`;
}

export async function writeReconcileWithdrawal(
  withdrawalId: number,
  parentTxHash: string,
  childTxHash: string
): Promise<`0x${string}`> {
  const { client } = await getActiveWriteClient();
  const txHash = await client.writeContract({
    address: LEX_VAULT_ADDRESS,
    functionName: 'reconcile_withdrawal',
    args: [withdrawalId, parentTxHash, childTxHash],
    value: 0n,
  });
  return txHash as `0x${string}`;
}

export async function writeRecapitalizePayouts(amountWei: bigint): Promise<`0x${string}`> {
  const { client } = await getActiveWriteClient();
  const txHash = await client.writeContract({
    address: LEX_VAULT_ADDRESS,
    functionName: 'recapitalize_payouts',
    args: [],
    value: amountWei,
  });
  return txHash as `0x${string}`;
}

export async function writeExpireStage(
  targetType: 'CHARTER' | 'CLAIM',
  targetId: number
): Promise<`0x${string}`> {
  const { client } = await getActiveWriteClient();
  const txHash = await client.writeContract({
    address: LEX_VAULT_ADDRESS,
    functionName: 'expire_stage',
    args: [targetType, targetId],
    value: 0n,
  });
  return txHash as `0x${string}`;
}

// -------------------------------------------------------------
// Real GenLayer Read Contract Helper Functions
// -------------------------------------------------------------

export async function readPullCredit(account: string): Promise<number> {
  const client = getReadClient();
  const raw = await client.readContract({
    address: LEX_VAULT_ADDRESS,
    functionName: 'get_pull_credit',
    args: [account],
  });
  return Number(raw);
}

export async function readCharter(id: number): Promise<any> {
  const client = getReadClient();
  const raw = await client.readContract({
    address: LEX_VAULT_ADDRESS,
    functionName: 'get_charter',
    args: [id],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function readClaim(id: number): Promise<any> {
  const client = getReadClient();
  const raw = await client.readContract({
    address: LEX_VAULT_ADDRESS,
    functionName: 'get_claim',
    args: [id],
  });
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function readClaimCount(): Promise<number> {
  const client = getReadClient();
  const raw = await client.readContract({
    address: LEX_VAULT_ADDRESS,
    functionName: 'get_claim_count',
    args: [],
  });
  return Number(raw);
}

export async function getTransactionStatusOnChain(txHash: string): Promise<{
  status: string;
  resultName?: string;
  isDecided: boolean;
  raw?: any;
} | null> {
  try {
    const endpoint =
      typeof window !== 'undefined'
        ? `${window.location.origin}/api/genlayer-rpc`
        : GENLAYER_RPC_URL;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'eth_getTransactionByHash',
        params: [txHash],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.error || !data.result) return null;

    const tx = data.result;
    const status = tx.status || '';
    const resultName = tx.result_name || '';

    return {
      status,
      resultName,
      isDecided: status === 'FINALIZED' || status === 'CANCELED',
      raw: tx,
    };
  } catch (err) {
    console.warn('Failed to query transaction status on chain:', err);
    return null;
  }
}
