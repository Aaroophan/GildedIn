/** Closed compatibility register. Unknown future/older executable component grammar is denied. */
import {ContentDenied} from '../content/errors.ts';
import {parseCompositionNodes} from './validation.ts';
import type {SectionDefinition} from '../content/types.ts';
import type {SemanticRenderPlan} from './types.ts';
import {COMPOSITION_COMPILER_VERSION,COMPONENT_REGISTRY_VERSION,COMPOSITION_SERIALIZER_VERSION} from './types.ts';
export interface CompatibilityReport {canCompile:boolean;canRender:boolean;requiresExplicitMigration:boolean;
  action:'use_v1'|'migrate_legacy_stubs'|'reject_future_or_unknown';issues:{path:string;code:string;message:string}[];}
/** Issue 6 reference stubs cannot be upgraded to executable/semantic blocks by guessing owner intent. */
export function inspectCompositionCompatibility(raw:unknown,sections:readonly SectionDefinition[]):CompatibilityReport{
  try{
    const data=parseCompositionNodes(raw,sections,{allowLegacy:true});
    if(data.legacyNodes.length)return {canCompile:false,canRender:false,requiresExplicitMigration:true,
      action:'migrate_legacy_stubs',issues:[{path:'nodes',code:'legacy_nodes',
        message:'Convert historical reference-only records with an explicit owner-approved node mapping.'}]};
    return {canCompile:true,canRender:true,requiresExplicitMigration:false,action:'use_v1',issues:[]};
  }catch(e){
    if(e instanceof ContentDenied)return {canCompile:false,canRender:false,requiresExplicitMigration:false,
      action:'reject_future_or_unknown',issues:e.issues.map(i=>({...i}))};
    throw e;
  }
}
export function assertSupportedRenderPlanVersion(plan:Pick<SemanticRenderPlan,
  'schemaVersion'|'compilerVersion'|'registryVersion'|'serializerVersion'>):void{
  if(plan.schemaVersion!==1||plan.compilerVersion!==COMPOSITION_COMPILER_VERSION||plan.registryVersion!==COMPONENT_REGISTRY_VERSION||
    plan.serializerVersion!==COMPOSITION_SERIALIZER_VERSION)
    throw new ContentDenied('CONTENT_UNAVAILABLE',[{path:'composition.version',code:'unsupported_version',
      message:'This released composition requires a reviewed compatibility renderer.'}]);
}
