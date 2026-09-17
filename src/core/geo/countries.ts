/* Countries.

   Stored as ISO 3166-1 alpha-2 codes and turned into names by the platform,
   so the list is never out of date and never needs translating by hand. The
   code is what the file keeps — it is what the European structured invoice
   formats ask for — and the name is only ever for reading. */

const CODES = [
  'AE', 'AR', 'AT', 'AU', 'BE', 'BG', 'BR', 'CA', 'CH', 'CL', 'CN', 'CO', 'CY', 'CZ',
  'DE', 'DK', 'EE', 'EG', 'ES', 'FI', 'FR', 'GB', 'GR', 'HK', 'HR', 'HU', 'ID', 'IE',
  'IL', 'IN', 'IS', 'IT', 'JP', 'KE', 'KR', 'LT', 'LU', 'LV', 'MA', 'MT', 'MX', 'MY',
  'NG', 'NL', 'NO', 'NZ', 'PE', 'PH', 'PL', 'PT', 'RO', 'RS', 'SA', 'SE', 'SG', 'SI',
  'SK', 'TH', 'TR', 'TW', 'UA', 'US', 'VN', 'ZA',
]

export interface Country { code: string; name: string }

let cache: Country[] | null = null

export function countries (locale = 'en'): Country[] {
  if (cache) return cache
  let names: Intl.DisplayNames | null = null
  try {
    names = new Intl.DisplayNames([locale], { type: 'region' })
  } catch {
    names = null
  }
  cache = CODES
    .map((code) => ({ code, name: names?.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return cache
}

export function countryName (code: string, locale = 'en'): string {
  const upper = (code || '').trim().toUpperCase()
  if (!upper) return ''
  return countries(locale).find((c) => c.code === upper)?.name ?? upper
}
