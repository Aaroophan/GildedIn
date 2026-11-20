import type { NextConfig } from 'next';
/** Stage 1 denies shared caching and does not activate any public publishing features. */
const config: NextConfig = {
  poweredByHeader: false,
  async headers() { return [{ source: '/:path*', headers: [
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'X-Frame-Options',value:'DENY'},
    {key:'Cache-Control',value:'no-store'},
  ]}]; },
};
export default config;
