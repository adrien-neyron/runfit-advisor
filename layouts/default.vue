<template>
  <div>
    <a
      href="#contenu"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground focus:shadow-lg"
    >
      Aller au contenu
    </a>
    <main id="contenu" tabindex="-1" class="outline-none">
      <slot />
    </main>
    <AppFooter />
    <CookieBanner />
  </div>
</template>
