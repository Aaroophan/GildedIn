import { notFound } from 'next/navigation';
/** Default deny: no authenticated sessions exist until Issue 4. No dashboard markup/data is disclosed. */
export default function Dashboard() { notFound(); }
