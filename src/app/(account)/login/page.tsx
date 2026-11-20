import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Sign in — not yet available', robots: {index:false,follow:false} };
export default function LoginUnavailable() {
  return <main id="main" className="centered" aria-labelledby="title">
    <span className="eyebrow">ACCOUNT ACCESS</span><h1 id="title">Sign-in is not enabled yet.</h1>
    <p>Google and GitHub authentication are implemented in Issue 4, after secure identity and persistence foundations. No mock credentials or password login is provided.</p>
    <a className="return-link" href="/">Back to GildedIn</a>
  </main>;
}
