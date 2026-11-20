import { notFound } from 'next/navigation';
/** Internal rewritten host surface; never exposes data until hostname + release + policy are verified. */
export default function TenantHostnamePlaceholder() { notFound(); }
