<template>
  <footer class="py-8 border-t border-border">
    <div class="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <span>© 2026 RunMatch. Tous droits réservés.</span>
      <nav class="flex flex-wrap justify-center gap-x-5 gap-y-1">
        <NuxtLink
          to="/a-propos"
          class="hover:text-primary transition-colors underline-offset-4 hover:underline"
        >
          À propos
        </NuxtLink>
        <NuxtLink
          to="/contact"
          class="hover:text-primary transition-colors underline-offset-4 hover:underline"
        >
          Contact
        </NuxtLink>
        <NuxtLink
          to="/mentions-legales"
          class="hover:text-primary transition-colors underline-offset-4 hover:underline"
        >
          Mentions légales
        </NuxtLink>
        <NuxtLink
          to="/confidentialite"
          class="hover:text-primary transition-colors underline-offset-4 hover:underline"
        >
          Politique de confidentialité
        </NuxtLink>
      </nav>
    </div>
  </footer>
</template>
