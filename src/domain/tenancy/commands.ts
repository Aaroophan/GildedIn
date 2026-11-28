/** Issue 5: exact owner command grammar. User input never selects an owner or Mongo filter. */
import {assertPlainCommand,parseCanonicalSlug,parseBoundedText} from '../../shared/domain/validation.ts';
import type {CanonicalSlug} from '../../shared/domain/validation.ts';

export type TenancyErrorCode='INVALID_COMMAND'|'SLUG_UNAVAILABLE'|'PORTFOLIO_ALREADY_EXISTS'|
    'NOT_FOUND'|'NOT_AUTHORIZED'|'CONFLICT'|'NOT_PUBLISHED'|'MODERATED'|'UNAVAILABLE';
export class TenancyDenied extends Error {
  readonly code:TenancyErrorCode;
  constructor(code:TenancyErrorCode){super('Portfolio operation unavailable.');this.name='TenancyDenied';this.code=code;}
}
export interface CreationCommand {
  slug:CanonicalSlug;displayName:string;identityLabel:string;introduction:string;
  templatePreset:'signature'|'minimal'|'studio';firstProject?:{title:string;summary?:string};
}
export function parseCreationCommand(raw:unknown):CreationCommand {
  try {
    const input=assertPlainCommand(raw,new Set(['slug','displayName','identityLabel','introduction','templatePreset','firstProject']));
    if(input.templatePreset!==undefined && (typeof input.templatePreset!=='string'||!['signature','minimal','studio'].includes(input.templatePreset))) throw new Error();
    const slug=parseCanonicalSlug(input.slug);
    const displayName=parseBoundedText(input.displayName,100,1).trim();
    const identityLabel=parseBoundedText(input.identityLabel,120,1).trim();
    const introduction=parseBoundedText(input.introduction,800,1).trim();
    if(!displayName||!identityLabel||!introduction||/[<>]/.test(displayName+identityLabel+introduction))throw new Error();
    let firstProject:CreationCommand['firstProject'];
    if(input.firstProject!==undefined){
      const project=assertPlainCommand(input.firstProject,new Set(['title','summary']));
      const title=parseBoundedText(project.title,160,1).trim();
      if(!title||/[<>]/.test(title))throw new Error();
      let summary:string|undefined;
      if(project.summary!==undefined){summary=parseBoundedText(project.summary,600).trim();
        if(/[<>]/.test(summary))throw new Error();}
      firstProject={title,...(summary?{summary}:{})};
    }
    return {slug,displayName,identityLabel,introduction,templatePreset:(input.templatePreset??'signature') as CreationCommand['templatePreset'],
      ...(firstProject?{firstProject}:{})};
  }catch{throw new TenancyDenied('INVALID_COMMAND');}
}
export function parseRenameCommand(raw:unknown):CanonicalSlug {
  try {const input=assertPlainCommand(raw,new Set(['newSlug']));
    if(Object.keys(input).length!==1)throw new Error();return parseCanonicalSlug(input.newSlug);
  }catch{throw new TenancyDenied('INVALID_COMMAND');}
}
export function parseVisibilityCommand(raw:unknown):'public'|'unlisted'{
  try{const input=assertPlainCommand(raw,new Set(['visibility']));
    if(Object.keys(input).length!==1||(input.visibility!=='public'&&input.visibility!=='unlisted'))throw new Error();
    return input.visibility;
  }catch{throw new TenancyDenied('INVALID_COMMAND');}
}
export function requireEmptyCommand(raw:unknown):void {
  try {if(Object.keys(assertPlainCommand(raw,new Set())).length!==0)throw new Error();}
  catch{throw new TenancyDenied('INVALID_COMMAND');}
}
export function readIdempotencyKey(input:string|null):string {
  if(!input||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input)||input.length>64)
    throw new TenancyDenied('INVALID_COMMAND');
  return input.toLowerCase();
}
