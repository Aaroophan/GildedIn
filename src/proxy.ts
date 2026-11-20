import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { classifyRequestHost } from './shared/domain/host.ts';
import { classifyRoute, makeSecurityHeaders } from './server/http/headers.ts';

/** This is a defensive perimeter, NOT identity/tenancy authorization. Tenant routes remain denied. */
export function proxy(request: NextRequest) {
  const decision = classifyRequestHost(request.headers.get('host'), request.headers.get('x-forwarded-host'), {
    allowLocalhost: ['local','test','preview'].includes(process.env.APP_ENV ?? ''),
    wildcardTlsVerified: false,
  });
  if (decision.kind === 'denied') {
    return new NextResponse('Unrecognized or unverified hostname.', { status: 421,
      headers: {'Cache-Control': 'private, no-store', 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options':'nosniff'} });
  }
  const nonceBytes = new Uint8Array(18);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));
  const headers=makeSecurityHeaders(classifyRoute(request.nextUrl.pathname),{nonce,
    // HSTS and wildcard includeSubDomains must wait for actual Issue 19 evidence.
    verifiedTls:false, publicCacheApproved:false,
  });
  const forwardedRequestHeaders = new Headers(request.headers);
  forwardedRequestHeaders.set('x-nonce',nonce);
  forwardedRequestHeaders.set('Content-Security-Policy',headers['Content-Security-Policy']);
  const response = NextResponse.next({request:{headers:forwardedRequestHeaders}});
  for (const [name,value] of Object.entries(headers))response.headers.set(name,value);
  return response;
}
export const config = {matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']};
