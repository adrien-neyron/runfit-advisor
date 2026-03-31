<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

useHead({
  title: 'Mentions légales — RunMatch',
  meta: [{ name: 'robots', content: 'noindex' }],
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

    <div class="container max-w-2xl pt-24 pb-16 px-4 prose prose-sm dark:prose-invert">
      <h1 class="text-3xl font-black">Mentions légales</h1>
      <p class="text-muted-foreground">Dernière mise à jour : mars 2026</p>

      <h2 class="text-xl font-black mt-8">Éditeur du site</h2>
      <p>
        Le site RunMatch est édité à titre personnel.<br />
        Directeur de publication : Adrien Y.<br />
        Contact : <a href="/contact" class="text-primary hover:underline">via le formulaire de contact</a>
      </p>

      <h2 class="text-xl font-black mt-6">Hébergement</h2>
      <p>
        Ce site est hébergé par <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 701,
        San Francisco, CA 94104, États-Unis (<a href="https://vercel.com" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">vercel.com</a>).<br />
        Les données des utilisateurs sont stockées sur <strong>Supabase</strong>, infrastructure AWS
        Frankfurt (Union Européenne).
      </p>

      <h2 class="text-xl font-black mt-6">Propriété intellectuelle</h2>
      <p>
        L'ensemble du contenu du site RunMatch (textes, visuels, algorithmes de recommandation)
        est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans
        autorisation préalable.
      </p>
      <p>
        Les noms et logos des marques de chaussures (Nike, Adidas, ASICS, etc.) sont la propriété
        de leurs détenteurs respectifs. RunMatch n'est affilié à aucune marque.
      </p>

      <h2 class="text-xl font-black mt-6">Liens d'affiliation</h2>
      <p>
        RunMatch participe à des programmes d'affiliation. Lorsque vous cliquez sur un lien vers
        un marchand partenaire (Amazon, i-Run, Intersport, etc.) et effectuez un achat, RunMatch
        peut percevoir une commission sans surcoût pour vous.
      </p>
      <p>
        Cette commission nous permet de maintenir le service gratuit. Les recommandations restent
        indépendantes : aucune chaussure n'est mise en avant en raison de commissions plus
        avantageuses.
      </p>
      <p>
        RunMatch est partenaire des programmes suivants :
      </p>
      <ul>
        <li>Amazon Partenaires (amazon.fr) — tag : <code>runmatch-21</code></li>
        <li>Réseau AWIN (i-Run, The Running Collective, Courir, Intersport)</li>
      </ul>

      <h2 class="text-xl font-black mt-6">Limitation de responsabilité</h2>
      <p>
        Les recommandations de RunMatch sont fournies à titre indicatif. Les prix, disponibilités
        et caractéristiques des produits sont susceptibles de changer. RunMatch ne peut être tenu
        responsable des erreurs ou variations de prix chez les marchands partenaires.
      </p>

      <h2 class="text-xl font-black mt-6">Données personnelles</h2>
      <p>
        Pour toute information relative au traitement de vos données, consultez notre
        <NuxtLink to="/confidentialite" class="text-primary hover:underline">
          Politique de confidentialité
        </NuxtLink>.
      </p>

      <h2 class="text-xl font-black mt-6">Droit applicable</h2>
      <p>
        Les présentes mentions légales sont soumises au droit français. Tout litige sera de la
        compétence exclusive des tribunaux français.
      </p>
    </div>

  </div>
</template>
