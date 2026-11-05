// POST /api/contact — enregistre un message du formulaire de contact
//
// - Validation serveur (zod) avec erreurs par champ
// - Honeypot anti-spam (champ « website » qui doit rester vide)
// - Limitation de débit simple par IP (en mémoire : meilleur effort sur serverless)
// - Stockage dans Supabase (table contact_messages, service_role)
// - Notification e-mail optionnelle via Resend si RESEND_API_KEY et CONTACT_TO_EMAIL sont définis
import { z } from 'zod'
import { getSupabaseAdmin } from '../utils/supabaseAdmin'

const SUBJECTS = ['general', 'affiliation', 'bug', 'rgpd', 'other'] as const
const SUBJECT_LABELS: Record<(typeof SUBJECTS)[number], string> = {
  general: 'Question générale',
  affiliation: 'Partenariat / Affiliation',
  bug: 'Signaler un bug',
  rgpd: 'Données personnelles (RGPD)',
  other: 'Autre',
}

const schema = z.object({
  name: z.string().trim().min(2, 'Indique ton nom (2 caractères minimum).').max(100, 'Ce nom est trop long.'),
  email: z.string().trim().max(254, 'Cette adresse est trop longue.').email('Saisis une adresse email valide, par exemple toi@exemple.fr.'),
  subject: z.enum(SUBJECTS).default('general'),
  message: z.string().trim().min(10, 'Ton message est trop court (10 caractères minimum).').max(5000, 'Ton message est trop long (5 000 caractères maximum).'),
  website: z.string().max(0).optional(), // honeypot
})

// ── Limitation de débit : 5 messages / heure / IP ──────────────────────────────
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  return false
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (isRateLimited(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Trop de messages envoyés. Réessaie dans une heure.',
    })
  }

  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    // Honeypot rempli : on répond « succès » sans rien enregistrer (le robot ne doit pas s'adapter)
    if (parsed.error.issues.some((i) => i.path[0] === 'website')) return { ok: true }

    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Entity',
      message: 'Certains champs sont à corriger.',
      data: { fieldErrors },
    })
  }

  const { name, email, subject, message } = parsed.data

  const supabase = getSupabaseAdmin()
  const { error } = await (supabase as any)
    .from('contact_messages')
    .insert({ name, email, subject, message })

  if (error) {
    console.error('[contact] insertion impossible :', error.code ?? error.message)
    throw createError({
      statusCode: 500,
      message: "Ton message n'a pas pu être enregistré. Réessaie dans un instant ou écris-nous directement par email.",
    })
  }

  // Notification e-mail : meilleur effort, n'échoue jamais la requête (le message est déjà stocké)
  const resendKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  if (resendKey && to) {
    try {
      await $fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}` },
        body: {
          from: process.env.CONTACT_FROM_EMAIL || 'RunMatch <onboarding@resend.dev>',
          to: [to],
          reply_to: email,
          subject: `[RunMatch] ${SUBJECT_LABELS[subject]} — ${name}`,
          text: `De : ${name} <${email}>\nSujet : ${SUBJECT_LABELS[subject]}\n\n${message}`,
        },
      })
    } catch (e) {
      console.error('[contact] notification e-mail échouée :', (e as Error).message)
    }
  }

  return { ok: true }
})
