import type { Metadata } from 'next';
import './globals.css';
import { loadServerEnvironment } from '../server/config/server.ts';
export const metadata: Metadata = {
  title: { default: 'GildedIn — Secure Foundation', template: '%s | GildedIn' },
  description: 'GildedIn is a free portfolio creation platform. Its new architecture is under construction.',
  robots: { index: false, follow: false }, // Stage 1 is not yet a public product/release.
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  loadServerEnvironment(); // Deny invalid config before any server route renders; secrets never serialized.
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
