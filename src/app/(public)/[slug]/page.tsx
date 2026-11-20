import { notFound } from 'next/navigation';
/** No public render of a guessed slug: only Issue 5/13 live policy + active release may unlock this. */
export default function PortfolioPlaceholder() { notFound(); }
