import type {ContentIssue} from './types.ts';
export type ContentErrorCode='CONTENT_INVALID'|'CONTENT_IN_USE'|'CONTENT_CONFLICT'|'CONTENT_NOT_FOUND'|
  'CONTENT_NOT_AUTHORIZED'|'CONTENT_UNAVAILABLE'|'CONTENT_MIGRATION_CONFIRMATION_REQUIRED'|'CONTENT_CAPACITY';
export class ContentDenied extends Error {
  readonly code:ContentErrorCode;readonly issues:readonly ContentIssue[];
  constructor(code:ContentErrorCode,issues:readonly ContentIssue[]=[]){
    super('Content operation could not be completed.');this.name='ContentDenied';this.code=code;
    // Only allowlisted path/code messages. Never forward raw rejected values or exception messages.
    this.issues=issues.slice(0,32).map(i=>({path:i.path.slice(0,140),code:i.code.slice(0,60),message:i.message.slice(0,140)}));
  }
}
export function contentIssue(path:string,code:string,message:string):never{
  throw new ContentDenied('CONTENT_INVALID',[{path,code,message}]);
}
