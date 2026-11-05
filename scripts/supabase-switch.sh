#!/usr/bin/env bash
# ============================================================
# scripts/supabase-switch.sh
# ============================================================
# Helper pour switcher entre les projets Supabase (dev/staging/prod).
#
# Usage :
#   ./scripts/supabase-switch.sh dev
#   ./scripts/supabase-switch.sh staging
#   ./scripts/supabase-switch.sh prod
#
# Configuration : remplir les REFs ci-dessous après création des projets
# Supabase. Ne JAMAIS committer les vraies refs si tu préfères les garder
# locales (ce fichier est OK à commit, les refs ne sont pas des secrets,
# mais les SERVICE_ROLE_KEY associées le sont).
# ============================================================

set -euo pipefail

# ─── Refs des projets (à compléter) ─────────────────────────
REF_DEV="<REF_PROJET_DEV>"
REF_STAGING="<REF_PROJET_STAGING>"
REF_PROD="<REF_PROJET_PROD>"

ENV="${1:-}"

if [ -z "$ENV" ]; then
  echo "Usage: $0 <dev|staging|prod>"
  exit 1
fi

case "$ENV" in
  dev)
    REF="$REF_DEV"
    ;;
  staging)
    REF="$REF_STAGING"
    ;;
  prod)
    REF="$REF_PROD"
    echo ""
    echo "⚠️  ATTENTION : tu vas te connecter à RUNFIT-PROD."
    echo "    Toute commande 'db push' / 'db reset' affectera la production."
    echo ""
    read -p "Continuer ? (yes/no) : " confirm
    if [ "$confirm" != "yes" ]; then
      echo "Annulé."
      exit 0
    fi
    ;;
  *)
    echo "Env inconnu : $ENV (attendu : dev | staging | prod)"
    exit 1
    ;;
esac

if [ "$REF" = "<REF_PROJET_${ENV^^}>" ] || [[ "$REF" == "<REF_PROJET_"* ]]; then
  echo "❌ Ref non configurée pour $ENV. Édite scripts/supabase-switch.sh et renseigne REF_${ENV^^}."
  exit 1
fi

echo "→ supabase link --project-ref $REF  ($ENV)"
supabase link --project-ref "$REF"

echo ""
echo "✅ Linké à $ENV."
echo "   Vérifier : supabase projects list"
echo "   Pousser  : supabase db push"
