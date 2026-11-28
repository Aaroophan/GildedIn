/** Owner-only deterministic prepublication report; not an immutable-release compiler. */
import type {ContentDraftShape} from '../content/types.ts';
import {compileComposition} from '../composition/compiler.ts';
import type {CompilationIssue,CompilationResult} from '../composition/types.ts';
export interface DraftValidationReport {valid:boolean;revision:number;blockers:CompilationIssue[];
  warnings:CompilationIssue[];authoredNodes:number;generatedRepeaterItems:number;}
export function buildDraftValidationReport(source:ContentDraftShape,revision:number,
  approvedMediaIds:ReadonlySet<string>=new Set()):DraftValidationReport{
  const compiled:CompilationResult=compileComposition(source,{purpose:'release',approvedMediaIds});
  const issues=compiled.issues.filter((v,i,a)=>a.findIndex(x=>x.path===v.path&&x.code===v.code&&
    x.breakpoint===v.breakpoint)===i);
  for(const mediaId of source.mediaRefs){if(approvedMediaIds.has(mediaId))continue;
    issues.push({path:'mediaRefs',code:'unapproved_media_reference',severity:'blocker',
      message:'Referenced media is not approved for public delivery.',
      repair:'Remove the reference or wait for the verified public-ready media state.'});
  }
  const blockers=issues.filter(i=>i.severity==='blocker');
  return {valid:blockers.length===0,revision,blockers,warnings:issues.filter(i=>i.severity==='warning'),
    authoredNodes:compiled.plan?.authoredNodeCount??source.nodes.length,
    generatedRepeaterItems:compiled.plan?.generatedRepeaterItems??0};
}
