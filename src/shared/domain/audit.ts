/** Minimal non-sensitive diagnostic metadata. Raw requests/AI/chat/contact content are not accepted. */
export type AuditCategory = 'identity' | 'publication' | 'upload' | 'ai-policy' | 'moderation' | 'deletion';
export type AuditOutcome = 'accepted' | 'denied' | 'failed';
export interface AuditMetadata {
  readonly requestId: string;
  readonly category: AuditCategory;
  readonly outcome: AuditOutcome;
  readonly code: string;
}
export function makeAuditMetadata(input: AuditMetadata): AuditMetadata {
  if (!/^req_[a-zA-Z0-9_-]{6,64}$/.test(input.requestId) || !/^[A-Z][A-Z0-9_]{1,48}$/.test(input.code) ||
      !['identity','publication','upload','ai-policy','moderation','deletion'].includes(input.category) ||
      !['accepted','denied','failed'].includes(input.outcome)) {
    throw new Error('INVALID_AUDIT_METADATA');
  }
  // Explicit object projection avoids logging arbitrary request/exception fields even if they are attached.
  return {requestId: input.requestId, category: input.category, outcome: input.outcome, code: input.code};
}
