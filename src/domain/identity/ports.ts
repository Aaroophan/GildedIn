import type { AccountId, SessionId } from '../../shared/domain/identifiers.ts';
/** Domain-owned contract; OAuth/session implementation must remain behind server adapters (Issue 4). */
export interface VerifiedActor { readonly accountId: AccountId; readonly sessionId: SessionId; readonly recentAuthAt: string; }
export interface IdentityReaderPort {
  requireActiveActor(sessionToken: string): Promise<VerifiedActor | null>;
  resolveProviderSubject(provider: 'google' | 'github', verifiedSubject: string): Promise<AccountId | null>;
}
