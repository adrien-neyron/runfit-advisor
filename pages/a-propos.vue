<script setup lang="ts">
import { ArrowLeft, Target, Zap, Shield, Heart } from 'lucide-vue-next'

const router = useRouter()

useHead({
  title: 'À propos — RunMatch',
  meta: [
    {
      name: 'description',
      content:
        'RunMatch est un outil gratuit qui analyse votre profil de coureur pour vous recommander la chaussure de running la plus adaptée à votre foulée et vos objectifs.',
    },
  ],
})

const values = [
  {
    icon: Target,
    title: 'Personnalisation réelle',
    desc: "Pas de liste générique. L'algorithme croise votre foulée, votre morphologie, votre terrain et vos objectifs pour une recommandation unique.",
  },
  {
    icon: Zap,
    title: 'Rapide et sans friction',
    desc: '2 minutes de questionnaire, 30 secondes de swipe. Pas de compte obligatoire pour commencer.',
  },
  {
    icon: Shield,
    title: 'Indépendant et transparent',
    desc: "Les recommandations ne sont pas influencées par les marges d'affiliation. La meilleure chaussure pour vous passe toujours en premier.",
  },
  {
    icon: Heart,
    title: 'Gratuit, toujours',
    desc: "RunMatch sera toujours gratuit pour les coureurs. Le service est financé par des commissions d'affiliation non intrusives.",
  },
]
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="container flex items-center h-16">
        <UiButton variant="ghost" size="icon" aria-label="Retour" @click="router.push('/')">
          <ArrowLeft class="w-5 h-5" />
        </UiButton>
        <span class="ml-4 font-black tracking-tighter">
          RUN<span class="text-gradient">MATCH</span>
        </span>
      </div>
    </div>

    <div class="container max-w-2xl pt-24 pb-16 px-4 space-y-16">
      <!-- Mission -->
      <section
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
      >
        <p class="text-xs text-primary font-bold uppercase tracking-widest mb-3">Notre mission</p>
        <h1 class="text-4xl font-black tracking-tight leading-tight">
          Trouver la bonne chaussure<br />ne devrait pas être un casse-tête.
        </h1>
        <p class="text-muted-foreground leading-relaxed mt-5 text-[15px]">
          Les magasins de running proposent des dizaines de modèles, les sites comparateurs affichent
          des centaines de critères techniques, et au final vous repartez avec celle qui avait la meilleure
          promo — pas forcément la meilleure pour votre pied.
        </p>
        <p class="text-muted-foreground leading-relaxed mt-3 text-[15px]">
          RunMatch prend le problème à l'envers : on part de <strong class="text-foreground">vous</strong>
          — votre foulée, votre morphologie, votre terrain, vos objectifs — pour remonter vers la chaussure.
          Comme un bon conseiller en magasin, en 2 minutes.
        </p>
      </section>

      <!-- Valeurs -->
      <section>
        <h2 class="text-2xl font-black mb-8">Nos engagements</h2>
        <div class="grid sm:grid-cols-2 gap-5">
          <div
            v-for="(v, i) in values"
            :key="v.title"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: i * 80, duration: 350 } }"
            class="bg-secondary/40 rounded-2xl p-5 space-y-3"
          >
            <div class="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center">
              <component :is="v.icon" class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-black text-base">{{ v.title }}</h3>
            <p class="text-muted-foreground text-sm leading-relaxed">{{ v.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Affiliation -->
      <section class="border border-border rounded-2xl p-6 space-y-3">
        <h2 class="text-xl font-black">Comment RunMatch est financé</h2>
        <p class="text-muted-foreground text-sm leading-relaxed">
          RunMatch est un projet indépendant. Le service est entièrement gratuit pour les coureurs
          et est financé par des <strong class="text-foreground">commissions d'affiliation</strong> :
          lorsque vous cliquez sur un lien marchand et réalisez un achat, RunMatch perçoit une
          petite commission sans surcoût pour vous.
        </p>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Nous participons aux programmes Amazon Partenaires et AWIN. Cette relation commerciale
          n'influence en aucun cas l'ordre des recommandations, qui repose uniquement sur la
          compatibilité avec votre profil biomécanique.
        </p>
        <NuxtLink
          to="/mentions-legales#affiliation"
          class="text-primary text-sm font-semibold hover:underline underline-offset-4"
        >
          En savoir plus sur notre politique d'affiliation →
        </NuxtLink>
      </section>

      <!-- Contact CTA -->
      <section class="text-center space-y-4">
        <h2 class="text-xl font-black">Une question ? Un partenariat ?</h2>
        <p class="text-muted-foreground text-sm">
          On est toujours ouverts aux retours coureurs, aux partenariats marchands et aux demandes presse.
        </p>
        <UiButton variant="hero" @click="router.push('/contact')">
          Nous contacter
        </UiButton>
      </section>
    </div>

  </div>
</template>
