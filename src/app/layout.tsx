import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'GildedIn — Foundation', template: '%s | GildedIn' },
  description: 'GildedIn is a free portfolio creation platform. Its new architecture is under construction.',
  robots: { index: false, follow: false }, // Stage 1 is not yet a public product/release.
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
