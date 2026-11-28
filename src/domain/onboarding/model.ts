/** Issue 9: pure owner journey/status contracts. No identity authority or browser storage here. */
import {parseCanonicalSlug,parseBoundedText} from '../../shared/domain/validation.ts';
import {parseCreationCommand} from '../tenancy/commands.ts';
import type {CreationCommand} from '../tenancy/commands.ts';
import {PRODUCT_LIMITS} from '../../shared/domain/limits.ts';
export type JourneyStep='identity'|'professional'|'appearance'|'project'|'review';
export const JOURNEY_STEPS:readonly JourneyStep[]=['identity','professional','appearance','project','review'];
export type WizardData={displayName:string;slug:string;identityLabel:string;introduction:string;
  templatePreset:'signature'|'minimal'|'studio';firstProjectTitle:string;firstProjectSummary:string};
export const EMPTY_WIZARD:WizardData=Object.freeze({displayName:'',slug:'',identityLabel:'',introduction:'',
  templatePreset:'signature',firstProjectTitle:'',firstProjectSummary:''});
export type WizardErrors=Partial<Record<keyof WizardData,string>>;
export function normalizeOnboardingSlug(raw:string):string{
  try{return parseCanonicalSlug(raw);}catch{return '';}
}
export function wizardStepErrors(data:WizardData,step:JourneyStep):WizardErrors{
  const errors:WizardErrors={};
  if(step==='identity'||step==='review'){
    try{const v=parseBoundedText(data.displayName,100,1).trim();if(!v||/[<>]/.test(v))throw Error();}
    catch{errors.displayName='Enter a display name of 1–100 characters.';}
    if(!normalizeOnboardingSlug(data.slug))errors.slug='Use 3–30 ASCII letters, numbers or hyphens; no reserved names.';
  }
  if(step==='professional'||step==='review'){
    try{const v=parseBoundedText(data.identityLabel,120,1).trim();if(!v||/[<>]/.test(v))throw Error();}
    catch{errors.identityLabel='Enter a professional label of 1–120 characters.';}
    try{const v=parseBoundedText(data.introduction,800,1).trim();if(!v||/[<>]/.test(v))throw Error();}
    catch{errors.introduction='Enter a short introduction of 1–800 characters.';}
  }
  if(step==='appearance'||step==='review'){
    if(!(['signature','minimal','studio'] as string[]).includes(data.templatePreset))errors.templatePreset='Choose an approved design preset.';
  }
  if(step==='project'||step==='review'){
    const title=data.firstProjectTitle.trim(),summary=data.firstProjectSummary.trim();
    if((summary&&!title)||title.length>160||/[<>\u0000]/.test(title))
      errors.firstProjectTitle='Enter a project title (up to 160 characters) before a summary, or skip this step.';
    if(summary.length>600||/[<>\u0000]/.test(summary))errors.firstProjectSummary='Project summary must be at most 600 characters.';
  }
  return errors;
}
export function createFromWizard(data:WizardData):CreationCommand{
  for(const step of JOURNEY_STEPS){const errors=wizardStepErrors(data,step);
    if(Object.keys(errors).length)throw new Error('ONBOARDING_VALIDATION_FAILED');}
  return parseCreationCommand({slug:normalizeOnboardingSlug(data.slug),displayName:data.displayName.trim(),
    identityLabel:data.identityLabel.trim(),introduction:data.introduction.trim(),templatePreset:data.templatePreset,
    ...(data.firstProjectTitle.trim()?{firstProject:{title:data.firstProjectTitle.trim(),
      ...(data.firstProjectSummary.trim()?{summary:data.firstProjectSummary.trim()}:{})}}:{})});
}
/** Never honor a client-supplied absolute URL, double-encoded path or unowned account endpoint. */
export function safeDashboardReturnTo(raw:unknown):string{
  if(typeof raw!=='string'||raw.length>170||raw.includes('%')||raw.includes('\\')||raw.includes('//')||raw.includes('?')||raw.includes('#'))return '/dashboard';
  if(/^\/dashboard(?:\/(?:onboarding|account|portfolio))?$/.test(raw))return raw;
  if(/^\/dashboard\/portfolios\/[a-f0-9-]{36}\/editor$/i.test(raw))return raw;
  return '/dashboard';
}
export interface OwnerPortfolioState {slug:string;status:'onboarding'|'active'|'owner_disabled'|'suspended'|'deleting';
  visibility:'public'|'unlisted';activeReleaseId:string|null;draftRevision:number|null;canonicalUrl:string;
  securityVersion:number;aliases:readonly string[];
  mediaUsage?:{originalFileCount:number;usedBytes:number;reservedBytes:number};}
export interface LifecycleSummary {title:string;explanation:string;publiclyAccessible:boolean;
  unpublished:boolean;canEdit:boolean;robots:string;draftLabel:string;}
export function ownerLifecycle(p:OwnerPortfolioState):LifecycleSummary{
  const canEdit=p.status==='onboarding'||p.status==='active'||p.status==='owner_disabled';
  const unpublished=p.activeReleaseId===null;
  const publiclyAccessible=!unpublished&&(p.status==='active');
  const title=p.status==='owner_disabled'?'Portfolio not publicly available':
    p.status==='suspended'?'Portfolio temporarily unavailable':
    p.status==='deleting'?'Portfolio removal in progress':
    unpublished?'Not published yet':p.visibility==='unlisted'?'Unlisted · accessible by link':'Published';
  const explanation=p.status==='owner_disabled'?'Public access is disabled. Saved drafts remain private.':
    p.status==='suspended'?'Contact support for help with this portfolio.':
    p.status==='deleting'?'Changes and public access are unavailable.':
    unpublished?'Your draft is owner-only. No public portfolio has been activated.':
    p.visibility==='unlisted'?'Anyone with the link can view the published release. Search indexing is off.':
    'A release is active. Further edits stay in the draft until you explicitly publish again.';
  return {title,explanation,publiclyAccessible,unpublished,canEdit,
    robots:publiclyAccessible&&p.visibility==='public'?'Eligible for indexing':'No public indexing',
    draftLabel:p.draftRevision===null?'Draft unavailable':`Saved draft · revision ${p.draftRevision}`};
}
export function ownerQuota(p:OwnerPortfolioState){
  const usage=p.mediaUsage;
  return {blocksLimit:PRODUCT_LIMITS.authoredVisualNodesPerPortfolio,
    itemsPerCollection:PRODUCT_LIMITS.collectionItems,
    publishedReleaseBytes:PRODUCT_LIMITS.publishedReleaseBytes,
    mediaBytesLimit:PRODUCT_LIMITS.mediaOriginalBytesPerPortfolio,
    mediaFilesLimit:PRODUCT_LIMITS.originalMediaFilesPerPortfolio,
    ...(usage?{mediaUsedBytes:usage.usedBytes,mediaReservedBytes:usage.reservedBytes,
      mediaFilesUsed:usage.originalFileCount}:{})};
}
/** Untrusted error text is never copied into the public UI. */
export function explainOwnerError(status:number,code?:string):string{
  if(status===401)return 'Your sign-in has expired. Sign in again before saving.';
  if(status===403)return code==='REAUTHENTICATION_REQUIRED'?'Verify your identity with a linked provider, then retry.':
    'This action is not permitted for your current account.';
  if(status===409){if(code==='SLUG_UNAVAILABLE')return 'This username is unavailable. Try another.';
    if(code==='PORTFOLIO_ALREADY_EXISTS')return 'A portfolio already exists. Open your dashboard to continue.';
    if(code==='LAST_LOGIN_PROVIDER')return 'Keep at least one verified sign-in method.';
    return 'The portfolio changed while you were editing. Refresh before retrying.';}
  if(status===412)return 'The saved version has changed. Refresh and review your edits.';
  if(status===422)return 'Review the highlighted fields and try again.';
  if(status===429)return 'Too many requests. Try again later.';
  return 'The service could not complete this action. Your changes have not been confirmed; retry when available.';
}
