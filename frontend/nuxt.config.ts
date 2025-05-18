import Aura from '@primeuix/themes/aura';
import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: 'http://127.0.0.1:8000'
    },
  },
  css: ['./assets/main.css'],
  modules: [
    '@primevue/nuxt-module',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/image',
    '@pinia/nuxt',
    '@sidebase/nuxt-auth',
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark',
        }
      },
    },
  },
});