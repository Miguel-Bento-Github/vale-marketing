// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  site: 'https://valepark.org',
  integrations: [sitemap(), vue()],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt', 'es', 'zh', 'ar'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
});
