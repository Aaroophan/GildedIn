import type { MetadataRoute } from 'next';
/** During Issue 1 there are no published releases and no indexable tenant URLs. */
export default function robots(): MetadataRoute.Robots { return {rules: {userAgent:'*',disallow:'/'} }; }
