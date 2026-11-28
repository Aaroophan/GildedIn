/** The only permitted content-to-scene projection consumes an approved RELEASE view.
 * Never accept owner draft records, a free-form query, or untrusted graph algorithms. */
import {shape,list,string,ensureJson} from '../content/strict.ts';
import {contentIssue} from '../content/errors.ts';
export const SCENE_GRAPH_VERSION=1 as const;
export interface ReleasedSceneSource {sourceId:string;kind:'project'|'skill'|'experience';title:string;
  publicApproved:true;sceneApproved:true;relatedSourceIds:string[];}
export interface ReleasedSceneProjection {schemaVersion:1;releaseId:string;portfolioId:string;
  activeReleaseVerified:true;sceneOptIn:true;sources:ReleasedSceneSource[];}
export interface SceneGraph {schemaVersion:1;releaseId:string;portfolioId:string;
  nodes:{id:string;kind:ReleasedSceneSource['kind'];x:number;y:number;z:number}[];
  edges:{from:string;to:string}[];}
const ID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function stableCoord(value:string,axis:number):number{
  let sum=2166136261;
  for(const c of `${axis}:${value}`)sum=Math.imul(sum^c.charCodeAt(0),16777619);
  return ((sum>>>0)%2001)/1000-1;
}
/** Fail closed on any unapproved, hidden, stale or foreign metadata. No labels/text enter 3D buffers. */
export function buildReleasedSceneGraph(raw:unknown):SceneGraph{
  ensureJson(raw,'scene',8,16000);
  const projection=shape(raw,['schemaVersion','releaseId','portfolioId','activeReleaseVerified',
    'sceneOptIn','sources'],'scene');
  if(projection.schemaVersion!==1||projection.activeReleaseVerified!==true||projection.sceneOptIn!==true||
    typeof projection.releaseId!=='string'||!ID.test(projection.releaseId)||
    typeof projection.portfolioId!=='string'||!ID.test(projection.portfolioId))
    return contentIssue('scene','unverified_release','A current approved release projection is required.');
  const sources=list(projection.sources,24,'scene.sources');
  const normalized:ReleasedSceneSource[]=sources.map((rawSource,i)=>{
    const path=`scene.sources.${i}`,s=shape(rawSource,['sourceId','kind','title','publicApproved',
      'sceneApproved','relatedSourceIds'],path);
    if(typeof s.sourceId!=='string'||!ID.test(s.sourceId)||
      !['project','skill','experience'].includes(String(s.kind))||s.publicApproved!==true||s.sceneApproved!==true)
      return contentIssue(path,'unapproved_scene_source','Only explicitly public, scene-approved sources may be used.');
    const title=string(s.title,100,`${path}.title`,1);
    const relatedSourceIds=list(s.relatedSourceIds,12,`${path}.relatedSourceIds`).map((id,j)=>{
      if(typeof id!=='string'||!ID.test(id))return contentIssue(`${path}.relatedSourceIds.${j}`,
        'invalid_scene_reference','Scene links require approved stable source IDs.');
      return id;
    });
    return {sourceId:s.sourceId,kind:s.kind as ReleasedSceneSource['kind'],title,
      publicApproved:true,sceneApproved:true,relatedSourceIds};
  });
  if(new Set(normalized.map(s=>s.sourceId)).size!==normalized.length)
    return contentIssue('scene.sources','duplicate_scene_source','Scene source IDs must be unique.');
  const ids=new Set(normalized.map(x=>x.sourceId)),edges:{from:string;to:string}[]=[],pairs=new Set<string>();
  for(const source of normalized){
    for(const to of source.relatedSourceIds){
      if(!ids.has(to)||to===source.sourceId)return contentIssue('scene.sources','foreign_scene_reference',
        'Scene relationships must stay within the approved release.');
      const pair=[source.sourceId,to].sort().join(':');
      if(!pairs.has(pair)){pairs.add(pair);edges.push({from:source.sourceId,to});}
    }
  }
  if(edges.length>36)return contentIssue('scene.sources','scene_edge_limit','Too many connections.');
  return {schemaVersion:1,releaseId:projection.releaseId,portfolioId:projection.portfolioId,
    nodes:normalized.map(source=>({id:source.sourceId,kind:source.kind,
      x:stableCoord(source.sourceId,0)*2.4,y:stableCoord(source.sourceId,1)*1.25,
      z:stableCoord(source.sourceId,2)*1.6})),edges};
}
