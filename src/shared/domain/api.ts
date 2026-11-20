/** Owner-controlled error contract. Framework adapters must use JSON Problem Details, never raw exceptions. */
export const API_NAMESPACE = '/api/v1' as const;
export const API_DEFAULT_PAGE_SIZE = 20;
export const API_MAX_PAGE_SIZE = 50;
export const API_DRAFT_MAX_BODY_BYTES = 512 * 1024; // provisional transport budget, not release entitlement
export const API_MAX_OPERATION_BATCH_SIZE = 32;
export type ApiErrorCode =
  | 'INVALID_COMMAND' | 'INVALID_IDENTIFIER' | 'INPUT_VALIDATION_FAILED' | 'NOT_AUTHENTICATED'
  | 'ACCESS_DENIED' | 'RESOURCE_NOT_FOUND' | 'DRAFT_CONFLICT' | 'PRECONDITION_FAILED'
  | 'PRECONDITION_REQUIRED' | 'BLOCK_LIMIT' | 'FIELD_LIMIT' | 'DEPTH_LIMIT' | 'COLLECTION_LIMIT'
  | 'PUBLISHED_SIZE_LIMIT' | 'MEDIA_QUOTA' | 'MEDIA_FILE_LIMIT' | 'STORAGE_CAPACITY_EXHAUSTED'
  | 'HOST_UNTRUSTED' | 'CAPABILITY_UNAVAILABLE' | 'INTERNAL_ERROR';
export type DomainResult<T, E extends string = ApiErrorCode> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: { readonly code: E; readonly message: string } };
export interface FieldIssue { readonly path: string; readonly code: string; readonly message: string; }
export interface ApiProblem {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly code: ApiErrorCode;
  readonly requestId: string;
  readonly issues?: readonly FieldIssue[];
}
export type ApiProblemDefinition = Pick<ApiProblem, 'status' | 'title' | 'detail' | 'code'> & { readonly slug: string };

/** Only finite, predefined problem types; request detail cannot inject a URL, stack, or provider exception. */
const knownProblems = {
  unauthorized: { status: 401, title: 'Sign in required', detail: 'An authenticated session is required.', code: 'NOT_AUTHENTICATED', slug: 'authentication-required' },
  forbidden: { status: 403, title: 'Access unavailable', detail: 'This action is not available.', code: 'ACCESS_DENIED', slug: 'access-denied' },
  notFound: { status: 404, title: 'Not found', detail: 'This resource is not available.', code: 'RESOURCE_NOT_FOUND', slug: 'not-found' },
  draftConflict: { status: 409, title: 'Draft version conflict', detail: 'The draft changed in another editing session.', code: 'DRAFT_CONFLICT', slug: 'draft-conflict' },
  preconditionFailed: { status: 412, title: 'Precondition failed', detail: 'The resource version does not match.', code: 'PRECONDITION_FAILED', slug: 'precondition-failed' },
  limit: { status: 422, title: 'Content limit reached', detail: 'The submitted content exceeds a product limit.', code: 'BLOCK_LIMIT', slug: 'content-limit' },
  unavailable: { status: 503, title: 'Temporarily unavailable', detail: 'This capability cannot be used right now.', code: 'CAPABILITY_UNAVAILABLE', slug: 'temporarily-unavailable' },
  internal: { status: 500, title: 'Request failed', detail: 'The request could not be completed.', code: 'INTERNAL_ERROR', slug: 'internal-error' },
} as const satisfies Record<string, ApiProblemDefinition>;
export type KnownProblemKind = keyof typeof knownProblems;

export function createProblem(kind: KnownProblemKind, requestId: string, issues?: readonly FieldIssue[]): ApiProblem {
  if (!/^req_[a-zA-Z0-9_-]{6,64}$/.test(requestId)) throw new Error('Invalid server-generated request ID');
  const entry = knownProblems[kind];
  // Do not accept client/provider strings for title, detail, problem type, or issue descriptions.
  return { type: `https://aaroophan.dev/problems/${entry.slug}`, title: entry.title,
    status: entry.status, detail: entry.detail, code: entry.code, requestId,
    ...(issues && issues.length ? { issues: issues.map(issue => ({
      path: issue.path.slice(0, 128),
      code: issue.code.slice(0, 64),
      message: issue.message.slice(0, 160),
    })) } : {}) };
}

/** Domain stale revision => 409. Actual failed HTTP If-Match => 412. Final wire semantics need SPEC-CONFLICT-001 approval. */
export const DRAFT_CONCURRENCY_STATES = Object.freeze({
  domainRevisionConflict: { status: 409, code: 'DRAFT_CONFLICT' },
  failedIfMatch: { status: 412, code: 'PRECONDITION_FAILED' },
  absentRequiredIfMatch: { status: 428, code: 'PRECONDITION_REQUIRED' },
});
export function parsePageSize(value: unknown): number {
  if (value === undefined) return API_DEFAULT_PAGE_SIZE;
  if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > API_MAX_PAGE_SIZE) {
    throw new Error('INVALID_PAGE_SIZE');
  }
  return value as number;
}
