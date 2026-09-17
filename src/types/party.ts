/* Who is billing and who is being billed.

   The address is kept in parts rather than as one block of text. A printed
   invoice only ever shows it as lines, but the structured electronic formats
   coming into force across the EU want the town, the post code and the
   country code separately — storing them apart now costs nothing and means
   that export is a mapping job later, not a parsing job. */

export interface PostalAddress {
  line1: string
  line2: string
  city: string
  region: string
  postalCode: string
  /** ISO 3166-1 alpha-2, e.g. "GB", "DE", "US". Empty when not yet chosen. */
  countryCode: string
}

/* A registration number, labelled by the user.

   Deliberately not called "VAT number". A UK company needs "VAT Number", a US
   freelancer has an EIN or nothing at all, an Australian business has an ABN.
   One labelled field covers all of them; hardcoding a label would make the
   app wrong everywhere except one country. */
export interface TaxIdentifier {
  label: string
  value: string
}

export interface Party {
  id: string
  /** Business or person being addressed — the line that leads the block. */
  name: string
  /** An individual at that business, printed under the name when present. */
  contactName: string
  email: string
  phone: string
  website: string
  address: PostalAddress
  /** Up to two labelled registration numbers: VAT plus a company number, say. */
  taxIds: TaxIdentifier[]
  notes: string
}

export const emptyAddress = (): PostalAddress => ({
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  countryCode: '',
})

export const emptyParty = (id: string): Party => ({
  id,
  name: '',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  address: emptyAddress(),
  taxIds: [],
  notes: '',
})
