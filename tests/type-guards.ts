import type { AccountId, PortfolioId, ContentId, ReleaseId } from '../src/shared/domain/identifiers.ts';
declare const actor: AccountId;
declare const portfolio: PortfolioId;
declare const content: ContentId;
declare const release: ReleaseId;
const acceptedAccount: AccountId=actor;
const acceptedPortfolio: PortfolioId=portfolio;
void acceptedAccount;void acceptedPortfolio;
// @ts-expect-error account IDs are never portfolio identities
const wrongPortfolio: PortfolioId=actor;
// @ts-expect-error content IDs are never release identities
const wrongRelease: ReleaseId=content;
// @ts-expect-error bare strings are never verified identities
const arbitraryAccount: AccountId='someone@example.org';
void wrongPortfolio;void wrongRelease;void arbitraryAccount;void release;
