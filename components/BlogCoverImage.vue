<script setup lang="ts">
defineProps<{
  src: string
  alt: string
}>()
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- Image — filtre cinématique sport -->
    <img
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover blog-cover-img group-hover:scale-105 transition-transform duration-500"
    />

    <!-- Streak orange — énergie / vitesse depuis le coin haut-gauche -->
    <div class="absolute inset-0 blog-cover-streak pointer-events-none" aria-hidden="true" />

    <!-- Vignette sombre — profondeur cinématique -->
    <div class="absolute inset-0 blog-cover-vignette pointer-events-none" aria-hidden="true" />

    <!-- Ligne de vitesse diagonale — signature graphique -->
    <div class="absolute inset-0 blog-cover-speedline pointer-events-none" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* ─── Image ─── */
.blog-cover-img {
  /* Légèrement sous-exposé, contrasté, désaturé — look photo sportive magazine */
  filter: brightness(0.82) contrast(1.14) saturate(0.65);
}

/* ─── Streak orange diagonal — énergie, vitesse ─── */
.blog-cover-streak {
  background: linear-gradient(
    128deg,
    rgba(249, 115, 22, 0.30) 0%,
    rgba(234, 88, 12, 0.10) 26%,
    transparent 50%
  );
}

/* ─── Vignette cinématique ─── */
.blog-cover-vignette {
  background:
    radial-gradient(ellipse at 50% 110%, rgba(0, 0, 0, 0.65) 0%, transparent 68%),
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.12) 0%,
      transparent 38%,
      rgba(0, 0, 0, 0.40) 100%
    );
}

/* ─── Ligne de vitesse diagonale fine ─── */
.blog-cover-speedline {
  background: linear-gradient(
    128deg,
    transparent 30%,
    rgba(249, 115, 22, 0.18) 31%,
    rgba(249, 115, 22, 0.06) 32.5%,
    transparent 33.5%
  );
}
</style>
