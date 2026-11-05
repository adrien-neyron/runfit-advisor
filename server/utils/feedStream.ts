// ============================================================
// Lecture en flux (streaming) d'un gros fichier CSV de produits
// ============================================================
// Un flux Awin complet peut dépasser 200 000 lignes : on ne le charge jamais en mémoire,
// chaque ligne est lue, évaluée puis oubliée.

import { Readable } from 'node:stream'
import { createGunzip } from 'node:zlib'
import { parse as csvParseStream } from 'csv-parse'
import { normalizeCsvRow } from '../parsers/csvFeed.parser'
import type { NormalizedProductFeedItem } from '../types/feed'

const OPEN_TIMEOUT_MS = 30_000

/** Ouvre le flux HTTP ; décompresse si le fichier est gzip (détecté sur les 2 premiers octets). */
export async function openFeedStream(url: string, signal?: AbortSignal): Promise<Readable> {
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), OPEN_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(url, {
      signal: signal ? AbortSignal.any([signal, timeout.signal]) : timeout.signal,
      headers: { 'User-Agent': 'RunFitBot/1.0 (+https://runfit.app/bot)', 'Accept': 'text/csv,application/gzip,*/*' },
    })
  } finally {
    clearTimeout(timer) // le délai ne vaut que pour l'ouverture : le téléchargement peut durer plus longtemps
  }
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status} pour le flux`)

  const source = Readable.fromWeb(res.body as any)
  return pipeIfGzip(source)
}

async function pipeIfGzip(source: Readable): Promise<Readable> {
  const iterator = source[Symbol.asyncIterator]()
  const first = await iterator.next()
  if (first.done) return Readable.from([])
  const head = Buffer.from(first.value)
  const gz = head.length >= 2 && head[0] === 0x1f && head[1] === 0x8b

  const rest = Readable.from((async function* () {
    yield head
    while (true) {
      const n = await iterator.next()
      if (n.done) return
      yield n.value
    }
  })())
  return gz ? rest.pipe(createGunzip()) : rest
}

/** Délimiteur déduit de l'URL du flux (Awin : `/delimiter/%3B/` = point-virgule), virgule par défaut. */
export function delimiterFromUrl(url: string): string {
  return /delimiter\/(%3B|;)/i.test(url) ? ';' : ','
}

/** Produit exploitable par ligne, en flux continu. */
export async function* iterateCsvItems(
  stream: Readable,
  delimiter = ',',
): AsyncGenerator<{ item: NormalizedProductFeedItem | null; rows: number; row: Record<string, string> }> {
  const parser = stream.pipe(
    csvParseStream({
      delimiter,
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      relax_quotes: true,
      bom: true,
    }),
  )
  let rows = 0
  for await (const row of parser as AsyncIterable<Record<string, string>>) {
    rows++
    yield { item: normalizeCsvRow(row), rows, row }
  }
}
