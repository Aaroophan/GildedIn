import type { PortfolioId } from '../../shared/domain/identifiers.ts';
export interface SemanticRenderPlan { readonly portfolioId: PortfolioId; readonly rendererVersion: number; readonly layout: Readonly<Record<string, unknown>>; }
export interface CompositionCompilerPort {
  compileValidatedComposition(portfolioId: PortfolioId, draftVersion: number): Promise<SemanticRenderPlan>;
}
