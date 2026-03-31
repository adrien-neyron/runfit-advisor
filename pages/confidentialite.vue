<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

useHead({
  title: 'Politique de confidentialité — RunMatch',
})
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

    <div class="container max-w-2xl pt-24 pb-16 px-4 prose prose-sm">
      <h1 class="text-3xl font-black">Politique de confidentialité</h1>
      <p class="text-muted-foreground">Dernière mise à jour : mars 2026</p>

      <h2 class="text-xl font-black mt-8">1. Données collectées</h2>
      <p>
        RunMatch collecte uniquement les données nécessaires au fonctionnement du service : email, profil coureur
        (type de foulée, terrain, niveau…) et historique des matchs. Aucune donnée sensible n'est collectée.
      </p>

      <h2 class="text-xl font-black mt-6">2. Utilisation des données</h2>
      <p>
        Vos données sont utilisées pour personnaliser vos recommandations de chaussures. Elles ne sont pas
        vendues ni partagées avec des tiers, à l'exception de nos partenaires marchands dans le cadre du
        programme d'affiliation.
      </p>

      <h2 class="text-xl font-black mt-6">3. Cookies</h2>
      <p>
        RunMatch utilise des cookies de session pour maintenir votre connexion et stocker vos préférences
        localement. Aucun cookie publicitaire tiers n'est utilisé.
      </p>

      <h2 class="text-xl font-black mt-6">4. Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d'un droit d'accès, de modification et de suppression de vos données.
        Pour exercer ces droits, contactez-nous via votre espace profil.
      </p>

      <h2 class="text-xl font-black mt-6">5. Hébergement</h2>
      <p>
        Les données sont hébergées sur Supabase (infrastructure AWS Frankfurt, EU).
        Les données ne quittent pas l'Union Européenne.
      </p>

      <h2 class="text-xl font-black mt-6">6. Liens d'affiliation</h2>
      <p>
        RunMatch utilise des liens d'affiliation vers des marchands partenaires. Un cookie de
        session peut être déposé par le marchand lors du clic pour attribuer la vente.
        Consultez les <NuxtLink to="/mentions-legales" class="text-primary hover:underline">Mentions légales</NuxtLink>
        pour plus de détails sur notre politique d'affiliation.
      </p>
    </div>

  </div>
</template>
