// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: false, // SPA mode — localStorage/sessionStorage friendly

  // Sharp est un module natif Node — on l'exclut du bundle Nitro
  nitro: {
    externals: {
      external: ['sharp', 'fast-xml-parser'],
    },
    // Tâche planifiée : sync des flux marchands tous les jours à 03:00
    scheduledTasks: {
      '0 3 * * *': ['syncFeeds'],
    },
  },

  // Variables serveur accessibles dans les routes API
  runtimeConfig: {
    supabaseServiceKey:   process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    adminEmails:          process.env.ADMIN_EMAILS ?? '',
    amazonPaAccessKey:    process.env.AMAZON_PA_ACCESS_KEY ?? '',
    amazonPaSecretKey:    process.env.AMAZON_PA_SECRET_KEY ?? '',
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
        '/confirm',
        '/admin/login', // Auth admin gérée manuellement
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'RunMatch — Trouvez votre chaussure de running idéale',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Trouvez la chaussure de running parfaite pour votre profil en 2 minutes.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
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
