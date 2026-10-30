import { NextRequest, NextResponse } from 'next/server';

const GENLAYER_TARGET_RPC = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const ALLOWED_METHODS = new Set([
  'eth_chainId',
  'eth_getBalance',
  'eth_getTransactionByHash',
  'eth_getTransactionReceipt',
  'eth_sendRawTransaction',
  'eth_blockNumber',
  'eth_call',
  'eth_estimateGas',
  'eth_gasPrice',
  'gen_call',
  'gen_getContractCode',
  'gen_getTransactionStatus'
]);

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoffMs = 1000): Promise<Response> {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // If rate limited or service unavailable, retry
      if ((res.status === 429 || res.status === 503 || res.status === 502) && attempt < retries) {
        await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, attempt)));
        continue;
      }
      return res;
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, backoffMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError || new Error('RPC upstream request timed out after retries');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check allowlist
    const validateRequest = (item: any) => {
      if (!item || typeof item !== 'object') return false;
      const method = item.method;
      return typeof method === 'string' && ALLOWED_METHODS.has(method);
    };

    if (Array.isArray(body)) {
      const disallowed = body.find(item => !validateRequest(item));
      if (disallowed) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id: disallowed.id || null,
            error: { code: -32601, message: `Method '${disallowed.method}' is not in proxy allowlist` }
          },
          { status: 403 }
        );
      }
    } else {
      if (!validateRequest(body)) {
        return NextResponse.json(
          {
            jsonrpc: '2.0',
            id: body?.id || null,
            error: { code: -32601, message: `Method '${body?.method}' is not in proxy allowlist` }
          },
          { status: 403 }
        );
      }
    }

    const upstreamResponse = await fetchWithRetry(GENLAYER_TARGET_RPC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': BROWSER_USER_AGENT,
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await upstreamResponse.json();

    return NextResponse.json(data, {
      status: upstreamResponse.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: `Proxy internal error: ${err.message || 'Upstream RPC connection failure'}`
        }
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
