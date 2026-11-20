import { notFound } from 'next/navigation';
/** Protected preview is not available until verified ownership and draft authorization (Issue 11). */
export default function OwnerPreview() { notFound(); }
