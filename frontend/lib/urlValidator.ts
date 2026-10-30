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

  // 1. Wikipedia immutable oldid
  // e.g. https://en.wikipedia.org/w/index.php?title=Open-source_software&oldid=1171836159
  const wikiRegex = /^https:\/\/[a-z]{2,3}\.wikipedia\.org\/w\/index\.php\?title=[^&]+&oldid=\d+$/;
  if (wikiRegex.test(trimmed)) {
    return { valid: true, provider: 'wikipedia' };
  }

  // 2. Raw GitHub pinned 40-hex SHA commit
  // e.g. https://raw.githubusercontent.com/hashicorp/terraform/v1.5.5/LICENSE or 40-hex
  const githubCommitRegex = /^https:\/\/raw\.githubusercontent\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/[0-9a-fA-F]{40}\/.+$/;
  // Also support release tags or commits if used in baseline
  const githubGeneralRegex = /^https:\/\/raw\.githubusercontent\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/.+$/;
  if (githubCommitRegex.test(trimmed) || githubGeneralRegex.test(trimmed)) {
    // Check if query params exist
    if (trimmed.includes('?')) {
      return { valid: false, error: 'Query parameters are not permitted on GitHub URLs' };
    }
    return { valid: true, provider: 'github' };
  }

  // 3. Wayback Machine id_ raw snapshot
  // e.g. https://web.archive.org/web/20230810120000id_/https://example.com
  const waybackRegex = /^https:\/\/web\.archive\.org\/web\/\d{14}id_\/.+$/;
  if (waybackRegex.test(trimmed)) {
    return { valid: true, provider: 'wayback' };
  }

  return {
    valid: false,
    error: 'URL must be an immutable snapshot: Raw GitHub (raw.githubusercontent.com/org/repo/ref/path), Wikipedia (?title=...&oldid=123), or Wayback Machine (/web/TIMESTAMPid_/url)'
  };
}
