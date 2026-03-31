/**
 * amazonPaApi.service.ts
 * Amazon Product Advertising API 5.0 — recherche d'ASIN avec signature AWS SigV4.
 */

import crypto from 'crypto'

const PA_HOST    = 'webservices.amazon.fr'
const PA_PATH    = '/paapi5/searchitems'
const PA_REGION  = 'eu-west-1'
const PA_SERVICE = 'ProductAdvertisingAPI'
const PA_TAG     = 'runmatch-21'
const PA_MARKET  = 'www.amazon.fr'

export interface AmazonLookupResult {
  product_name: string
  gender: string
  ASIN: string | null
  affiliate_link: string | null
  price: string | null
  availability: string
  image_url: string | null
}

// ─── SigV4 helpers ───────────────────────────────────────────────────────────

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest()
}

function sha256(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex')
}

function signingKey(secret: string, dateStamp: string): Buffer {
  const kDate    = hmac(`AWS4${secret}`, dateStamp)
  const kRegion  = hmac(kDate, PA_REGION)
  const kService = hmac(kRegion, PA_SERVICE)
  return hmac(kService, 'aws4_request')
}

function buildAuthHeader(
  accessKey: string,
  secretKey: string,
  amzDate: string,
  dateStamp: string,
  payloadHash: string,
): string {
  const contentType = 'application/json; charset=UTF-8; type=SearchItemsRequest'
  const target      = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'

  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${PA_HOST}`,
    `x-amz-date:${amzDate}`,
    `x-amz-target:${target}`,
  ].join('\n') + '\n'

  const signedHeaders = 'content-type;host;x-amz-date;x-amz-target'

  const canonicalRequest = [
    'POST',
    PA_PATH,
    '',               // no query string
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const credentialScope = `${dateStamp}/${PA_REGION}/${PA_SERVICE}/aws4_request`
  const stringToSign    = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n')

  const signature = hmac(signingKey(secretKey, dateStamp), stringToSign).toString('hex')

  return `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function lookupAmazonAsin(
  brand: string,
  model: string,
  gender: 'Homme' | 'Femme',
  accessKey: string,
  secretKey: string,
  extraKeywords = '',
): Promise<AmazonLookupResult> {
  const productName  = `${brand} ${model}`
  const genderWord   = gender === 'Femme' ? 'femme' : 'homme'
  const searchQuery  = [brand, model, genderWord, extraKeywords || 'running'].join(' ').trim()

  const payload = JSON.stringify({
    PartnerTag:  PA_TAG,
    PartnerType: 'Associates',
    Marketplace: PA_MARKET,
    Keywords:    searchQuery,
    SearchIndex: 'SportingGoods',
    ItemCount:   5,
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Offers.Listings.Availability.Message',
    ],
  })

  const now       = new Date()
  const amzDate   = now.toISOString().replace(/[:\-]/g, '').replace(/\.\d{3}Z$/, 'Z').slice(0, 16) + '00Z'
  const dateStamp = amzDate.slice(0, 8)

  const payloadHash   = sha256(payload)
  const authorization = buildAuthHeader(accessKey, secretKey, amzDate, dateStamp, payloadHash)

  let response: any
  try {
    response = await $fetch(`https://${PA_HOST}${PA_PATH}`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json; charset=UTF-8; type=SearchItemsRequest',
        'X-Amz-Date':    amzDate,
        'X-Amz-Target':  'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
        'Authorization': authorization,
      },
      body: payload,
    })
  } catch (err: any) {
    // PA API errors arrive as 4xx with JSON body
    const body = err?.data ?? err?.response?._data
    throw createError({
      statusCode:    err?.statusCode ?? 502,
      statusMessage: body?.Errors?.[0]?.Message ?? 'Erreur Amazon PA API',
    })
  }

  const items: any[] = response?.SearchResult?.Items ?? []

  if (!items.length) {
    return { product_name: productName, gender, ASIN: null, affiliate_link: null, price: null, availability: 'Introuvable', image_url: null }
  }

  // Meilleur match : le titre doit contenir la marque ET au moins un mot du modèle
  const brandLow = brand.toLowerCase()
  const modelLow = model.toLowerCase().split(' ')

  const best = items.find((item: any) => {
    const title = (item.ItemInfo?.Title?.DisplayValue ?? '').toLowerCase()
    return title.includes(brandLow) && modelLow.some((w: string) => title.includes(w))
  }) ?? items[0]

  const asin         = best.ASIN as string
  const price        = best.Offers?.Listings?.[0]?.Price?.DisplayAmount ?? null
  const availability = best.Offers?.Listings?.[0]?.Availability?.Message ?? 'Inconnu'
  const imageUrl     = best.Images?.Primary?.Large?.URL ?? null

  return {
    product_name:   productName,
    gender,
    ASIN:           asin,
    affiliate_link: `https://www.amazon.fr/dp/${asin}/?tag=${PA_TAG}`,
    price,
    availability,
    image_url:      imageUrl,
  }
}
