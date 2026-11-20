/** The only public configuration projection: no spread of process.env, no server secrets. */
export interface PublicConfiguration { readonly platformName: 'GildedIn'; readonly productPhase: 'foundation'; }
export const PUBLIC_CONFIGURATION: PublicConfiguration = Object.freeze({ platformName:'GildedIn', productPhase:'foundation' });
