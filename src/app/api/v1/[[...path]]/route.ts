import { NextResponse } from 'next/server';
import { createProblem } from '../../../../shared/domain/api.ts';
/** Fail-closed placeholder. Real /api/v1 handlers are added only after secure identity/tenant controls. */
function unavailable() {
  const requestId = `req_${crypto.randomUUID().replaceAll('-', '')}`; // Opaque, server-generated per request.
  const response = NextResponse.json(createProblem('unavailable', requestId), {status: 503,
    headers: {'Content-Type':'application/problem+json', 'Cache-Control':'no-store','X-Request-Id': requestId}});
  return response;
}
export const GET = unavailable;
export const POST = unavailable;
export const PUT = unavailable;
export const PATCH = unavailable;
export const DELETE = unavailable;
