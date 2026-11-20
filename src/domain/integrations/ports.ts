/** URL validation is not a fetch authorization. This interface is intentionally disabled until SSRF proof (Issue 15). */
export interface RestrictedExternalMetadata { readonly title: string; readonly canonicalUrl: string; readonly fetchedAt: string; }
export interface ExternalMetadataPort { fetchApprovedFeed(feedId: string): Promise<readonly RestrictedExternalMetadata[]>; }
