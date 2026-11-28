/** Shared server-only preview loader. The client cannot request another owner's draft. */
import {notFound} from 'next/navigation';
import {requireOwnerPage} from '../owner/context.ts';
import {requireContentRepository} from '../../bootstrap/identity-runtime.ts';
import {parsePreviewSelection} from '../../domain/editor/preview.ts';
import type {PreviewSelection} from '../../domain/editor/preview.ts';
import {compileComposition} from '../../domain/composition/compiler.ts';
import {parseContentDraft} from '../../domain/content/model.ts';
import {readOwnerTheme} from '../../domain/design/theme.ts';
import type {SemanticRenderPlan} from '../../domain/composition/types.ts';
import type {DesignTheme} from '../../domain/design/theme.ts';
export type PreviewQuery=Record<string,string|string[]|undefined>;
export async function ownedPreviewPage(query:PreviewQuery):Promise<{
  portfolioId:string;revision:number;mode:'desktop'|'tablet'|'mobile';animations:'paused'|'play';
  plan:SemanticRenderPlan|null;issues:{message:string;repair:string;nodeId?:string}[];theme:DesignTheme;
}>{
  const ctx=await requireOwnerPage('/dashboard/preview');
  const id=query.portfolioId,portfolio=ctx.portfolio;
  if(!portfolio||typeof id!=='string'||id!==portfolio.portfolioId||
    Object.keys(query).some(k=>!['portfolioId','revision','mode','animations','route'].includes(k))){
    notFound();throw new Error('PREVIEW_DENIED');
  }
  const params=new URLSearchParams();
  for(const key of ['revision','mode','animations','route'] as const){
    const value=query[key];if(value!==undefined){if(typeof value!=='string'){notFound();throw new Error('PREVIEW_DENIED');}params.set(key,value);}
  }
  let selection:PreviewSelection;
  try{selection=parsePreviewSelection('https://gildedin.invalid/?'+params.toString());}
  catch{notFound();throw new Error('PREVIEW_DENIED');}
  const repo=await requireContentRepository();
  // An owner-disabled/suspended/deleting portfolio cannot be previewed from an old tab.
  if(!['onboarding','active'].includes(portfolio.status))notFound();
  const draft=await repo.getOwnedEditableDraft(ctx.actor,portfolio.portfolioId);
  if(selection.revision!==undefined&&selection.revision!==draft.revision){
    return {portfolioId:id,revision:draft.revision,mode:selection.mode,
      animations:selection.animations,plan:null,
      issues:[{message:'A newer saved revision is available.',repair:'Return to the editor and review the latest draft.'}],
      theme:readOwnerTheme(draft.theme)};
  }
  const media=await repo.readReleaseReadyMediaIds(ctx.actor,portfolio.portfolioId);
  const result=compileComposition(parseContentDraft(draft),{purpose:'owner-preview',approvedMediaIds:media});
  return {portfolioId:id,revision:draft.revision,mode:selection.mode,
    animations:selection.animations,plan:result.plan??null,issues:result.issues,
    theme:readOwnerTheme(draft.theme)};
}
