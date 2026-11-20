import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { classifyRequestHost } from './shared/domain/host.ts';

/** Next.js 16 proxy performs host zoning only; NEVER serves as owner authorization or publication proof. */
export function proxy(request: NextRequest) {
  const decision = classifyRequestHost(request.headers.get('host'), request.headers.get('x-forwarded-host'), {
    allowLocalhost: process.env.NODE_ENV === 'development',
    // Deliberately FALSE in Issue 1: cannot be enabled by arbitrary env values without Issue 19 DNS/TLS proof.
    wildcardTlsVerified: false,
  });
  if (decision.kind === 'denied') return new NextResponse('Unrecognized or unverified hostname.', { status: 421,
    headers: {'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8'} });
  if (decision.kind === 'tenant-host') {
    // Dormant until reviewed wildcard proof and approved tenant resolver in Issues 5/19.
    const destination = request.nextUrl.clone();
    destination.pathname = `/_tenant/${decision.slug}${request.nextUrl.pathname}`;
    return NextResponse.rewrite(destination);
  }
  return NextResponse.next();
}
export const config = {matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']};
