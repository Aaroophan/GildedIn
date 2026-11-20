import { parseCanonicalSlug, type CanonicalSlug } from './validation.ts';
/** Request hostname classification for a trusted deployment edge; does not confer ownership or public access. */
export type HostClassification =
  | { readonly kind: 'apex'; readonly hostname: string }
  | { readonly kind: 'localhost'; readonly hostname: string }
  | { readonly kind: 'www'; readonly hostname: string }
  | { readonly kind: 'tenant-host'; readonly hostname: string; readonly slug: CanonicalSlug }
  | { readonly kind: 'denied'; readonly reason: 'untrusted-host' | 'unverified-wildcard' | 'forwarded-host-mismatch' };
export interface HostOptions { readonly allowLocalhost: boolean; readonly wildcardTlsVerified: boolean; readonly apexHost?: string; }
export function classifyRequestHost(host: string | null, forwardedHost: string | null, options: HostOptions): HostClassification {
  if (!host || !/^[a-zA-Z0-9.:-]{1,253}$/.test(host) || host.includes('..') || host.includes('@') || host.endsWith('.')) return {kind:'denied', reason:'untrusted-host'};
  const h = host.toLowerCase();
  // Unverified reverse proxy headers cannot silently replace the browser's Host. A production adapter
  // must validate the actual trusted edge in Issue 5/19 before using forwarded host metadata.
  if (forwardedHost && forwardedHost.toLowerCase() !== h) return {kind:'denied',reason:'forwarded-host-mismatch'};
  if (options.allowLocalhost && /^(localhost|127\.0\.0\.1):3000$/.test(h)) return {kind:'localhost',hostname:h};
  const apex = options.apexHost ?? 'aaroophan.dev';
  if (h === apex) return {kind:'apex',hostname:h};
  if (h === `www.${apex}`) return {kind:'www',hostname:h};
  if (h.endsWith(`.${apex}`)) {
    const label = h.slice(0, -(apex.length + 1));
    if (label.includes('.')) return {kind:'denied',reason:'untrusted-host'};
    try {
      const slug = parseCanonicalSlug(label);
      return options.wildcardTlsVerified ? {kind:'tenant-host',hostname:h,slug} : {kind:'denied',reason:'unverified-wildcard'};
    } catch { return {kind:'denied',reason:'untrusted-host'}; }
  }
  return {kind:'denied',reason:'untrusted-host'};
}
