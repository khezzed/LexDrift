export interface UrlValidationResult {
  valid: boolean;
  provider?: 'github' | 'wikipedia' | 'wayback';
  error?: string;
}

export function validateImmutableUrl(url: string): UrlValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL cannot be empty' };
  }

  const trimmed = url.trim();

  // Reject URL fragments (#)
  if (trimmed.includes('#')) {
    return { valid: false, error: 'URL fragments (#) are not permitted' };
  }

  // Reject trailing slashes
  if (trimmed.endsWith('/')) {
    return { valid: false, error: 'Trailing slashes are not permitted' };
  }

  // 1. Wikipedia Action API immutable oldid (matches on-chain _is_valid_immutable_url)
  const wikiRegex = /^https:\/\/en\.wikipedia\.org\/w\/api\.php\?.*oldid=\d+.*$/;
  if (wikiRegex.test(trimmed)) {
    return { valid: true, provider: 'wikipedia' };
  }

  // 2. Raw GitHub pinned 40-hex SHA commit (matches on-chain _is_valid_immutable_url)
  const githubCommitRegex = /^https:\/\/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/([0-9a-fA-F]{40})\/.+$/;
  if (githubCommitRegex.test(trimmed)) {
    if (trimmed.includes('?')) {
      return { valid: false, error: 'Query parameters are not permitted on GitHub URLs' };
    }
    return { valid: true, provider: 'github' };
  }

  // 3. Wayback Machine id_ raw snapshot (matches on-chain _is_valid_immutable_url)
  const waybackRegex = /^https:\/\/web\.archive\.org\/web\/\d{14}id_\/.+$/;
  if (waybackRegex.test(trimmed)) {
    return { valid: true, provider: 'wayback' };
  }

  return {
    valid: false,
    error: 'URL must match on-chain immutable allowlist: GitHub 40-hex SHA (raw.githubusercontent.com/org/repo/<40-hex-sha>/path), Wikipedia API (en.wikipedia.org/w/api.php?action=parse&oldid=...), or Wayback (/web/<14-digit-ts>id_/url)'
  };
}
