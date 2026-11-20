/** Conservative proposal preflight, not a replacement for product-owner approval. Based on ADR governance §8. */
export type ProposedChange =
  | { readonly category: 'provider'; readonly paymentCardRequired: boolean; readonly billableOverflow: boolean; readonly termsVerified: boolean; readonly privacyVerified: boolean }
  | { readonly category: 'library-patch'; readonly changesContract: boolean; readonly licensingVerified: boolean; readonly securityChecked: boolean }
  | { readonly category: 'product-constraint'; readonly requirementId: string }
  | { readonly category: 'data-or-security'; readonly affectedContracts: readonly string[] };
export type ReviewOutcome = { readonly decision: 'BLOCKED' | 'ADR_AND_OWNER_APPROVAL_REQUIRED' | 'ROUTINE_TECHNICAL_REVIEW'; readonly reason: string };
export function preflightDecision(change: ProposedChange): ReviewOutcome {
  switch (change.category) {
    case 'provider':
      if (change.paymentCardRequired || change.billableOverflow) return {decision:'BLOCKED',reason:'Absolute $0 and no-billing product invariant.'};
      if (!change.termsVerified || !change.privacyVerified) return {decision:'BLOCKED',reason:'Current provider eligibility and privacy evidence must be verified.'};
      return {decision:'ADR_AND_OWNER_APPROVAL_REQUIRED',reason:'Record provider-specific security, privacy, quotas and portability proof.'};
    case 'library-patch':
      if (!change.licensingVerified || !change.securityChecked) return {decision:'BLOCKED',reason:'License/security review is mandatory.'};
      if (change.changesContract) return {decision:'ADR_AND_OWNER_APPROVAL_REQUIRED',reason:'A contract-changing library update needs ADR review.'};
      return {decision:'ROUTINE_TECHNICAL_REVIEW',reason:'No automatic new ADR for a compatible reviewed patch.'};
    case 'product-constraint':
      return {decision:'ADR_AND_OWNER_APPROVAL_REQUIRED',reason:`Product-fixed requirement ${change.requirementId} cannot be changed by developer preference.`};
    case 'data-or-security':
      return {decision:'ADR_AND_OWNER_APPROVAL_REQUIRED',reason:'Data/trust boundaries require explicit impact and migration review.'};
  }
}
