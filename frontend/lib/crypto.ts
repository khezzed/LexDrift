export async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateRandomSalt(byteCount = 32): string {
  const arr = new Uint8Array(byteCount);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function computeCommitmentHash(candidateUrl: string, salt: string): Promise<string> {
  const preimage = `${candidateUrl.trim()}:${salt.trim()}`;
  return await sha256Hex(preimage);
}
