// ============================================================
// Logger sécurisé pour Nitro (server-only)
// ============================================================
// Wrapper autour de console.* qui scrub automatiquement :
//   - tokens / clés / secrets
//   - emails
//   - cookies / authorization headers
//
// Usage :
//   import { logger } from '~/server/utils/logger'
//   logger.info('User connected', { userId: user.id, email: user.email })
//   → en prod : email scrubé en "u***@***.com"

const SENSITIVE_KEYS = [
  'password', 'pwd', 'token', 'access_token', 'refresh_token',
  'authorization', 'cookie', 'secret', 'service_role',
  'supabase_service_role_key', 'amazon_pa_secret_key',
  'amazon_pa_access_key', 'api_key', 'private_key',
]

const EMAIL_REGEX = /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+)/g

const isProd = (): boolean => {
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV
  return env === 'production'
}

/**
 * Scrub récursif d'un objet pour masquer les valeurs sensibles.
 * Ne mute pas l'original.
 */
function scrub(value: unknown, depth = 0): unknown {
  if (depth > 5) return '[Max depth reached]'
  if (value === null || value === undefined) return value

  if (typeof value === 'string') {
    // Masquer les emails
    return value.replace(EMAIL_REGEX, '$1***@***')
  }

  if (Array.isArray(value)) {
    return value.map((item) => scrub(item, depth + 1))
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const lowerKey = k.toLowerCase()
      if (SENSITIVE_KEYS.some((sk) => lowerKey.includes(sk))) {
        result[k] = '[REDACTED]'
      } else {
        result[k] = scrub(v, depth + 1)
      }
    }
    return result
  }

  return value
}

function format(args: unknown[]): unknown[] {
  return args.map((a) => scrub(a))
}

export const logger = {
  info: (...args: unknown[]) => {
    console.log('[info]', ...format(args))
  },
  warn: (...args: unknown[]) => {
    console.warn('[warn]', ...format(args))
  },
  error: (...args: unknown[]) => {
    console.error('[error]', ...format(args))
  },
  /**
   * Debug — silent en production.
   * Utiliser pour les logs verbeux qui ne doivent pas polluer les logs Vercel prod.
   */
  debug: (...args: unknown[]) => {
    if (isProd()) return
    console.debug('[debug]', ...format(args))
  },
}
