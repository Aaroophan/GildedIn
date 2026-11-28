import type {PortfolioId} from '../../shared/domain/identifiers.ts';
import type {ContentDraftShape} from '../content/types.ts';
import type {CompileOptions,CompilationResult,SemanticRenderPlan} from './types.ts';
export type {SemanticRenderPlan,CompilationResult} from './types.ts';
/** Pure compiler input never comes from a public request or a database handle. */
export interface CompositionCompilerPort {
  compileValidatedComposition(source:ContentDraftShape,options:CompileOptions):CompilationResult;
}
/** Owner-scoped CAS only. Public delivery is a separate port over immutable releases. */
export interface CompositionDraftPort {
  getOwnerComposition(portfolioId:PortfolioId):Promise<Readonly<{revision:number;nodes:readonly unknown[]}>>;
}
