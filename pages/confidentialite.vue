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
        <UiButton variant="ghost" size="icon" aria-label="Retour" to="/">
          <ArrowLeft class="w-5 h-5" />
        </UiButton>
        <span class="ml-4 font-black tracking-tighter">
          RUN<span class="text-gradient">MATCH</span>
        </span>
      </div>
    </div>

    <div class="container max-w-2xl pt-24 pb-16 px-4 prose prose-sm">
      <h1 class="text-3xl font-black">Politique de confidentialité</h1>
      <p class="text-muted-foreground">Dernière mise à jour : novembre 2026</p>

      <h2 class="text-xl font-black mt-8">1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement est l'éditeur de RunMatch, dont les coordonnées figurent dans les
        <NuxtLink to="/mentions-legales" class="text-brand hover:underline">Mentions légales</NuxtLink>.
        Pour toute question relative à vos données, contactez-nous via le
        <NuxtLink to="/contact" class="text-brand hover:underline">formulaire de contact</NuxtLink>.
      </p>

      <h2 class="text-xl font-black mt-6">2. Données traitées, finalités et bases légales</h2>
      <ul>
        <li>
          <strong>Compte</strong> : adresse e-mail et identifiants d'authentification, pour créer et sécuriser votre compte
          (exécution du service).
        </li>
        <li>
          <strong>Profil coureur</strong> : sexe, taille, poids, foulée, niveau, distance, terrain, objectif, largeur de pied,
          préférences de chaussure, budget, voûte plantaire, volume d'entraînement. Finalité : personnaliser vos
          recommandations (exécution du service).
        </li>
        <li>
          <strong>Mon équipement</strong> : les chaussures que vous déclarez et leurs kilomètres, pour suivre l'usure et vous
          proposer un remplacement (exécution du service).
        </li>
        <li>
          <strong>Clics sur les liens marchands</strong> : identifiant de clic, marchand, chaussure, page d'origine, pays, empreinte
          irréversible et salée de l'adresse IP, navigateur, page de provenance et, si vous êtes connecté, identifiant de compte.
          Finalités : attribuer les commissions d'affiliation, éviter les doublons et la fraude, mesurer l'usage du service
          (intérêt légitime). Ces données sont anonymisées au plus tard 13 mois après le clic.
        </li>
        <li>
          <strong>Messages</strong> envoyés via le formulaire de contact : traités pour répondre à votre demande.
        </li>
      </ul>

      <h2 class="text-xl font-black mt-6">3. Données de santé : consentement explicite</h2>
      <p>
        La question sur vos douleurs ou blessures liées à la course est une donnée relative à la santé. Elle n'est posée
        qu'avec votre <strong>consentement explicite</strong> et sert uniquement à ajuster le niveau de soutien des chaussures
        proposées. Si vous préférez ne pas répondre, aucune donnée de santé n'est conservée et le service reste pleinement
        utilisable. Vous pouvez retirer votre consentement à tout moment depuis votre
        <NuxtLink to="/profil" class="text-brand hover:underline">profil</NuxtLink> : la réponse est alors effacée. Le retrait
        du consentement n'affecte pas la licéité du traitement effectué avant ce retrait.
      </p>

      <h2 class="text-xl font-black mt-6">4. Destinataires et hébergement</h2>
      <p>
        Vos données ne sont ni vendues ni cédées. Elles sont traitées par nos prestataires techniques : Supabase
        (base de données et authentification, infrastructure AWS Frankfurt, Union européenne) et Vercel (hébergement de
        l'application). Lorsque vous cliquez sur un lien marchand, le marchand ou son réseau d'affiliation (Amazon, Awin)
        reçoit un identifiant de clic anonyme, mais ni votre e-mail ni votre profil.
      </p>

      <h2 class="text-xl font-black mt-6">5. Durées de conservation</h2>
      <ul>
        <li>Compte, profil et équipement : tant que votre compte existe, puis suppression à votre demande.</li>
        <li>Clics d'affiliation : données d'identification effacées au plus tard 13 mois après le clic.</li>
        <li>Messages de contact : le temps nécessaire au traitement de votre demande.</li>
      </ul>

      <h2 class="text-xl font-black mt-6">6. Cookies et stockage local</h2>
      <p>
        RunMatch utilise uniquement des cookies et un stockage local fonctionnels : maintien de votre connexion, mémorisation
        de votre profil, de vos matchs et de votre choix concernant les cookies. Aucun cookie publicitaire ou de pistage
        n'est déposé par RunMatch. Lorsque vous cliquez sur un lien d'affiliation, le marchand ou son réseau peut déposer
        un cookie sur son propre site pour attribuer la vente.
      </p>

      <h2 class="text-xl font-black mt-6">7. Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition
        et de portabilité, ainsi que du droit de retirer votre consentement. Pour les exercer, utilisez le
        <NuxtLink to="/contact" class="text-brand hover:underline">formulaire de contact</NuxtLink>. Vous pouvez aussi
        introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" class="text-brand hover:underline">cnil.fr</a>).
      </p>

      <h2 class="text-xl font-black mt-6">8. Liens d'affiliation</h2>
      <p>
        RunMatch utilise des liens d'affiliation vers des marchands partenaires. Consultez les
        <NuxtLink to="/mentions-legales" class="text-brand hover:underline">Mentions légales</NuxtLink>
        pour plus de détails sur notre politique d'affiliation.
      </p>
    </div>

  </div>
</template>
