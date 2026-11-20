/** Server-only opaque secrets using Node's maintained primitives. */
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
export const newOpaqueToken = (): string => randomBytes(32).toString('base64url');
export const newRequestId = (): string => `req_${randomBytes(18).toString('base64url')}`;
export function hashOpaqueToken(token: string): string {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43,86}$/.test(token)) throw new Error('INVALID_TOKEN_FORMAT');
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
export function constantTimeTokenMatch(provided: string | null, expectedHash: string | null): boolean {
  if (!provided || !expectedHash || !/^[a-f0-9]{64}$/i.test(expectedHash)) return false;
  let incoming: Buffer;
  try { incoming = Buffer.from(hashOpaqueToken(provided), 'hex'); } catch { return false; }
  return timingSafeEqual(incoming, Buffer.from(expectedHash,'hex'));
}
/** Only session-aware, server-stored verifier hashes can be used as CSRF proofs. */
export function requireCsrfProof(provided: string | null, expectedHash: string | null): void {
  if (!constantTimeTokenMatch(provided,expectedHash)) throw new Error('CSRF_PROOF_REQUIRED');
}
