// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

const isDev = process.env.NODE_ENV === 'development';
const siteUrl = isDev
  ? 'http://localhost:4321'
  : 'https://astro-static-site.s3.fr-par.scw.cloud'; // Scaleway bucket/CDN URL

export default defineConfig({
  site: siteUrl,

  // Use server output in dev for dynamic serving, static for production
  output: isDev ? 'server' : 'static',
  adapter: isDev ? node({ mode: 'standalone' }) : undefined,

  vite: {
    ssr: {
      external: ['svgo'],
    },
  },

  image: {
    domains: ['lacuisinedebernard.com', 'lcdb.fra1.digitaloceanspaces.com'],
  },
});
