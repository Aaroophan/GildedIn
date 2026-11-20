/** Per-class browser/cache policy. No visitor authorization is inferred from headers. */
export type RouteSecurityClass = 'marketing'|'public'|'owner'|'preview'|'auth'|'api'|'media'|'audit'|'contact';
const PRIVATE = new Set<RouteSecurityClass>(['owner','preview','auth','api','audit','contact']);
export function makeSecurityHeaders(routeClass: RouteSecurityClass, options: {
  readonly nonce: string;
  readonly verifiedTls?: boolean;
  readonly hostReadyForSubdomains?: boolean;
  readonly publicCacheApproved?: boolean;
}): Readonly<Record<string,string>> {
  if (!/^[A-Za-z0-9+/=_-]{16,96}$/.test(options.nonce)) throw new Error('INVALID_CSP_NONCE');
  // No 'unsafe-eval', third-party script, wildcard iframe or owner-defined JavaScript.
  const csp=["default-src 'none'",`script-src 'self' 'nonce-${options.nonce}'`,
    `style-src 'self' 'nonce-${options.nonce}'`,"img-src 'self' data:","font-src 'self'",
    "connect-src 'self'","form-action 'self'","frame-ancestors 'none'","base-uri 'none'","object-src 'none'",...(options.verifiedTls?['upgrade-insecure-requests']:[])].join('; ');
  const headers: Record<string,string>={
    'Content-Security-Policy':csp,
    'X-Content-Type-Options':'nosniff',
    'X-Frame-Options':'DENY',
    'Referrer-Policy':'strict-origin-when-cross-origin',
    'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()',
    'X-Robots-Tag':PRIVATE.has(routeClass)?'noindex, nofollow, noarchive':'all',
    'Cache-Control':(options.publicCacheApproved && (routeClass==='marketing'||routeClass==='public'))?'public, max-age=0, must-revalidate':'private, no-store, max-age=0',
    'Vary':'Host',
  };
  if(options.verifiedTls){headers['Strict-Transport-Security']=`max-age=300${options.hostReadyForSubdomains?'; includeSubDomains':''}`;}
  return headers;
}
export function classifyRoute(path: string): RouteSecurityClass {
  if (/^\/dashboard\/preview(?:\/|$)/.test(path))return 'preview';
  if (/^\/(?:dashboard|admin|settings)(?:\/|$)/.test(path))return 'owner';
  if (/^\/(?:login|auth)(?:\/|$)/.test(path))return 'auth';
  if (/^\/api\/v1(?:\/|$)/.test(path))return 'api';
  if (/^\/audit(?:\/|$)/.test(path))return 'audit';
  if (/^\/contact(?:\/|$)/.test(path))return 'contact';
  if (/^\/media(?:\/|$)/.test(path))return 'media';
  return path==='/'?'marketing':'public';
}
