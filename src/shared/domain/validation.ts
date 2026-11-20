/** Framework-independent, strict validation utilities. No implicit coercion or unknown command fields. */
export class InputValidationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.code = code; this.name = 'InputValidationError'; }
}
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);

export function assertPlainCommand(input: unknown, allowedKeys: ReadonlySet<string>): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new InputValidationError('INVALID_COMMAND', 'Expected an object.');
  if (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) throw new InputValidationError('INVALID_COMMAND', 'Unsupported object prototype.');
  if (Object.getOwnPropertySymbols(input).length) throw new InputValidationError('INVALID_COMMAND', 'Symbol properties are not supported.');
  for (const key of Object.getOwnPropertyNames(input)) {
    if (forbidden.has(key) || key.startsWith('$') || key.includes('.') || !allowedKeys.has(key)) {
      throw new InputValidationError('UNEXPECTED_FIELD', 'Unexpected or unsafe field name.');
    }
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor || !('value' in descriptor)) throw new InputValidationError('INVALID_COMMAND', 'Computed input fields are not supported.');
  }
  return input as Record<string, unknown>;
}

/** Reject hostile property names, non-JSON objects, cycles, non-finite numbers, and extreme recursion. */
export function assertSafeJsonValue(value: unknown, maxDepth = 16): void {
  const seen = new WeakSet<object>();
  const walk = (v: unknown, depth: number): void => {
    if (depth > maxDepth) throw new InputValidationError('DEPTH_LIMIT', 'Input nesting is too deep.');
    if (v === null || typeof v === 'string' || typeof v === 'boolean') return;
    if (typeof v === 'number') {
      if (!Number.isFinite(v)) throw new InputValidationError('INVALID_NUMBER', 'Non-finite numbers are not allowed.');
      return;
    }
    if (typeof v !== 'object') throw new InputValidationError('INVALID_VALUE', 'Value cannot be serialized safely.');
    if (seen.has(v)) throw new InputValidationError('INVALID_VALUE', 'Circular input is not allowed.');
    seen.add(v);
    if (Array.isArray(v)) {
      if (v.length > 10_000) throw new InputValidationError('COLLECTION_LIMIT', 'Input array is too large.');
      for (const item of v) walk(item, depth + 1);
    } else {
      if (Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== null) throw new InputValidationError('INVALID_VALUE', 'Unsupported object type.');
      if (Object.getOwnPropertySymbols(v).length) throw new InputValidationError('INVALID_VALUE', 'Symbol properties are not allowed.');
      for (const k of Object.getOwnPropertyNames(v)) {
        if (forbidden.has(k) || k.startsWith('$') || k.includes('.')) throw new InputValidationError('UNSAFE_FIELD', 'Unsafe JSON key.');
        const d = Object.getOwnPropertyDescriptor(v, k);
        if (!d || !('value' in d)) throw new InputValidationError('INVALID_VALUE', 'Accessors are prohibited.');
        walk(d.value, depth + 1);
      }
    }
    seen.delete(v);
  };
  walk(value, 0);
}

export function parseBoundedText(value: unknown, maxCodePoints: number, minCodePoints = 0): string {
  if (typeof value !== 'string') throw new InputValidationError('INVALID_TEXT', 'Expected text.');
  const size = Array.from(value).length;
  if (size < minCodePoints || size > maxCodePoints || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
    throw new InputValidationError('TEXT_LIMIT', 'Text is invalid or exceeds its permitted length.');
  }
  return value; // Preserve user-authored display text; do not trim/normalize silently.
}

/** Accept only exact UTC RFC 3339 millisecond or second timestamps; reject adjusted invalid dates. */
export function parseUtcTimestamp(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) {
    throw new InputValidationError('INVALID_TIMESTAMP', 'UTC timestamp is required.');
  }
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString().slice(0, 19) !== value.slice(0, 19)) {
    throw new InputValidationError('INVALID_TIMESTAMP', 'Invalid date or time.');
  }
  return new Date(milliseconds).toISOString();
}

export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  'api', 'dashboard', 'login', 'logout', 'admin', 'settings', 'app', 'auth', 'help', 'support',
  'privacy', 'terms', 'robots', 'sitemap', 'www', 'mail', 'static', 'assets', 'cdn',
  'favicon', 'manifest', 'create', 'new', 'status', '_tenant', '_internal', 'preview'
]);
export type CanonicalSlug = string & { readonly __canonicalSlug: true };
export function parseCanonicalSlug(value: unknown): CanonicalSlug {
  if (typeof value !== 'string' || !/^[A-Za-z0-9-]{3,30}$/.test(value)) {
    throw new InputValidationError('INVALID_SLUG', 'Slug must contain 3-30 ASCII letters, numbers or hyphens.');
  }
  const slug = value.toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/.test(slug) || slug.includes('--') || RESERVED_SLUGS.has(slug)) {
    throw new InputValidationError('INVALID_SLUG', 'Slug format or namespace is not available.');
  }
  return slug as CanonicalSlug;
}

export type SafeUrlClassification = { readonly kind: 'approved-https-candidate'; readonly url: string; readonly requiresServerSideSsrfChecks: true };
export function classifyHttpsUrl(value: unknown): SafeUrlClassification {
  if (typeof value !== 'string' || value.length > 2048 || /[\u0000-\u0020\u007F\\]/.test(value)) {
    throw new InputValidationError('INVALID_URL', 'Valid HTTPS URL required.');
  }
  let url: URL;
  try { url = new URL(value); } catch { throw new InputValidationError('INVALID_URL', 'Valid HTTPS URL required.'); }
  if (url.protocol !== 'https:' || url.username || url.password || !url.hostname || url.port || url.hash) {
    throw new InputValidationError('INVALID_URL', 'Unsupported URL components.');
  }
  // A structural candidate is NOT permission to fetch: DNS, resolved IPs, redirects, and network destination
  // must be rechecked by the egress adapter (Issue 15). For now reject obvious direct local hosts/IPs.
  if (/^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.test|\[.*\]|[0-9.]+)$/i.test(url.hostname)) {
    throw new InputValidationError('INVALID_URL', 'Local addresses are not permitted.');
  }
  return {kind: 'approved-https-candidate', url: url.href, requiresServerSideSsrfChecks: true};
}
