/** Opaque identities are not slugs, emails, document paths, or permission claims. See 05, §4 / §8. */
export type OpaqueId<K extends string> = string & { readonly __opaqueIdKind: K };
export type AccountId = OpaqueId<'account'>;
export type PortfolioId = OpaqueId<'portfolio'>;
export type ContentId = OpaqueId<'content'>;
export type SectionId = OpaqueId<'section'>;
export type NodeId = OpaqueId<'node'>;
export type ReleaseId = OpaqueId<'release'>;
export type MediaId = OpaqueId<'media'>;
export type OperationId = OpaqueId<'operation'>;
export type SessionId = OpaqueId<'session'>;
export type PolicyVersion = number & { readonly __versionKind: 'policy' };
export type SecurityVersion = number & { readonly __versionKind: 'security' };
export type DraftRevision = number & { readonly __versionKind: 'draft' };

// Accept well-formed standard versioned UUIDs; future opaque formats require an explicit schema revision.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class InvalidIdentifierError extends Error {
  readonly code = 'INVALID_IDENTIFIER';
  constructor() { super('A valid opaque identifier is required.'); this.name = 'InvalidIdentifierError'; }
}
export function parseOpaqueId<K extends string>(value: unknown): OpaqueId<K> {
  if (typeof value !== 'string' || !UUID.test(value)) throw new InvalidIdentifierError();
  return value.toLowerCase() as OpaqueId<K>;
}
export const parseAccountId = (value: unknown): AccountId => parseOpaqueId<'account'>(value);
export const parsePortfolioId = (value: unknown): PortfolioId => parseOpaqueId<'portfolio'>(value);
export const parseContentId = (value: unknown): ContentId => parseOpaqueId<'content'>(value);
export const parseSectionId = (value: unknown): SectionId => parseOpaqueId<'section'>(value);
export const parseNodeId = (value: unknown): NodeId => parseOpaqueId<'node'>(value);
export const parseReleaseId = (value: unknown): ReleaseId => parseOpaqueId<'release'>(value);
export const parseMediaId = (value: unknown): MediaId => parseOpaqueId<'media'>(value);
export const parseOperationId = (value: unknown): OperationId => parseOpaqueId<'operation'>(value);
export const parseSessionId = (value: unknown): SessionId => parseOpaqueId<'session'>(value);

export function parseMonotonicVersion<K extends 'policy' | 'security' | 'draft'>(value: unknown): number & { readonly __versionKind: K } {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new InvalidIdentifierError();
  return value as number & { readonly __versionKind: K };
}
