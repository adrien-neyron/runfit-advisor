// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: false, // SPA mode — localStorage/sessionStorage friendly

  // Sharp est un module natif Node — on l'exclut du bundle Nitro
  nitro: {
    externals: {
      external: ['sharp', 'fast-xml-parser'],
    },
    experimental: {
      tasks: true,
    },
    // Tâches planifiées : flux marchands chaque lundi à 03:00 (UTC), import des ventes Awin chaque jour à 04:00
    scheduledTasks: {
      '0 3 * * 1': ['syncFeeds'],
      '0 4 * * *': ['syncConversions'],
    },
    // ─── Headers de sécurité globaux ────────────────────────────
    // Appliqués à toutes les routes par Nitro (et donc Vercel edge)
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
          'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        },
      },
    },
  },

  // Variables serveur accessibles dans les routes API
  // ⚠️ Ces clés ne sont JAMAIS exposées au client (server-only)
  runtimeConfig: {
    supabaseServiceKey:   process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    adminEmails:          process.env.ADMIN_EMAILS ?? '',
    amazonPaAccessKey:    process.env.AMAZON_PA_ACCESS_KEY ?? '',
    amazonPaSecretKey:    process.env.AMAZON_PA_SECRET_KEY ?? '',
    // Awin : publisher ID (l'ID annonceur est dans merchants.affiliate_tag)
    awinPublisherId:      process.env.AWIN_PUBLISHER_ID ?? '',
    // public.* est exposé au client — uniquement pour les valeurs non sensibles
    public: {
      siteUrl:        process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      amazonTrackingId: process.env.AMAZON_TRACKING_ID ?? '',
      // Indicateur d'env (utile pour afficher un bandeau en staging)
      env:            process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@vueuse/motion/nuxt',
  ],

  supabase: {
    // Les variables d'env SUPABASE_URL et SUPABASE_KEY sont lues automatiquement
    redirectOptions: {
      login: '/connexion',
      callback: '/confirm',
      // Exclure toutes les pages de la redirection automatique
      // On gère l'auth manuellement dans chaque page
      exclude: [
        '/',
        '/questionnaire',
        '/resultats',
        '/swipe',
        '/matches',
        '/shoes/**',
        '/confidentialite',
        '/connexion',
        '/mot-de-passe',
        '/confirm',
        '/admin/**', // Auth admin gérée par middleware/admin.ts
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'RunMatch — Trouve ta chaussure de running idéale',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Trouve la chaussure de running parfaite pour ton profil en 2 minutes.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '180x180', href: '/icon.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        // Inter auto-hébergée (public/fonts/inter) : aucune requête vers Google Fonts
        {
          rel: 'preload',
          href: '/fonts/inter/inter-latin-wght-normal.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
      ],
    },
  },

  tailwindcss: {
    configPath: '~/tailwind.config.ts',
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  typescript: {
    strict: false,
  },

  compatibilityDate: '2024-04-03',
})
