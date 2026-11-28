/** Narrow built-in derived-value registry, UTC/date-only, no owner-authored expressions. */
import {dateOnly} from './strict.ts';
import {contentIssue} from './errors.ts';
export interface DurationValue {months:number;years:number;remainderMonths:number;label:string;}
export function deriveDuration(start:unknown,end:unknown,asOf?:unknown):DurationValue|null{
  if(start===null||start===undefined||start===''||
    (end===null&&asOf===undefined))return null;
  const begin=dateOnly(start,'duration.start');
  const finish=end===null||end===undefined||end===''?
    (asOf===undefined?null:dateOnly(asOf,'duration.asOf')):dateOnly(end,'duration.end');
  if(!finish)return null;
  if(finish<begin)contentIssue('duration','date_range','The end date precedes the start date.');
  const [sy,sm,sd]=begin.split('-').map(Number),[ey,em,ed]=finish.split('-').map(Number);
  // Completed calendar months; no timezone, DST or naive milliseconds/30-day approximations.
  let months=(ey-sy)*12+(em-sm);
  if(ed<sd)months--;
  const years=Math.floor(months/12),remainderMonths=months%12;
  const label=years?`${years} ${years===1?'year':'years'}${remainderMonths?`, ${remainderMonths} ${remainderMonths===1?'month':'months'}`:''}`:
    `${months} ${months===1?'month':'months'}`;
  return {months,years,remainderMonths,label};
}
export function formatContentDate(value:unknown):string{
  const date=dateOnly(value,'date');
  const [year,month,day]=date.split('-').map(Number);
  const named=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${named[month-1]} ${day}, ${year}`;
}
export function deriveContentCount(records:readonly unknown[]):number{
  if(!Array.isArray(records)||records.length>20)contentIssue('count','collection_limit','Only bounded collection counts are supported.');
  return records.length;
}
