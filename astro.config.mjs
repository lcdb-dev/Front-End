// @ts-check
import { defineConfig } from 'astro/config';

const isDev = process.env.NODE_ENV === 'development';
const siteUrl = isDev
  ? 'http://localhost:4321'
  : 'https://astro-static-site.s3.fr-par.scw.cloud'; // Scaleway bucket/CDN URL

export default defineConfig({
  site: siteUrl,

  // Pure SSG with ISR via rebuilds
  output: 'static',

  vite: {
    cacheDir: './.vite-cache-build',
    ssr: {
      external: ['svgo'],
    },
  },

  image: {
    domains: ['lacuisinedebernard.com', 'lcdb.fra1.digitaloceanspaces.com'],
  },
});
