/** Authenticated apex account view. Rechecked by every owner page, not merely its layout. */
import {cookies,headers} from 'next/headers';
import {redirect,notFound} from 'next/navigation';
import {loadServerEnvironment} from '../config/server.ts';
import {requireIdentityRepository,requireTenancyRepository} from '../../bootstrap/identity-runtime.ts';
import {SESSION_COOKIE_NAME} from '../identity/session-cookie.ts';
import {IdentityDenied} from '../../domain/identity/contracts.ts';
import type {AuthenticatedActor} from '../../domain/identity/contracts.ts';
import type {PrivateAccountSummary} from '../../domain/identity/contracts.ts';
import type {OwnerPortfolioSummary} from '../../domain/tenancy/ports.ts';
import {safeDashboardReturnTo} from '../../domain/onboarding/model.ts';
export type OwnerPageContext={actor:AuthenticatedActor;account:PrivateAccountSummary;
  portfolio:OwnerPortfolioSummary|null};
export async function requireOwnerPage(returnTo='/dashboard'):Promise<OwnerPageContext>{
  const env=loadServerEnvironment();
  const h=await headers();const host=new URL(env.APP_CANONICAL_ORIGIN).host;
  if(h.get('host')!==host||(h.has('x-forwarded-host')&&h.get('x-forwarded-host')!==host)||
     (h.has('x-forwarded-proto')&&h.get('x-forwarded-proto')!==new URL(env.APP_CANONICAL_ORIGIN).protocol.slice(0,-1)))notFound();
  const token=(await cookies()).get(SESSION_COOKIE_NAME)?.value??null;
  if(!token)redirect(`/login?returnTo=${encodeURIComponent(safeDashboardReturnTo(returnTo))}`);
  let actor:AuthenticatedActor;
  try{actor=await (await requireIdentityRepository()).requireSession(token);}
  catch(e){if(e instanceof IdentityDenied&&e.code==='NOT_AUTHENTICATED')
    redirect(`/login?returnTo=${encodeURIComponent(safeDashboardReturnTo(returnTo))}`);
    throw e;}
  const account=await (await requireIdentityRepository()).readPrivateAccount(actor);
  const list=await (await requireTenancyRepository()).listOwned(actor,env.APP_CANONICAL_ORIGIN);
  if(list.length>1)throw new Error('OWNER_PORTFOLIO_INVARIANT');
  return {actor,account,portfolio:list[0]??null};
}
