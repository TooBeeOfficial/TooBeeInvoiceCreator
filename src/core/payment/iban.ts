/* IBANs.

   An account number that is one character wrong is not a near miss, it is
   somebody else's account or a transfer that bounces a week later. The
   checksum an IBAN carries exists precisely so that a typo can be caught
   before the money moves, and it costs four lines to check — so nothing here
   prints a payment code for an account number that fails it.

   Everything is done on the normalised form: no spaces, upper case. That is
   what goes into a payment code and into the ISO 20022 message behind it.
   The spaced form is for human eyes only, and is produced at the edge. */

/** No spaces, no punctuation, upper case — the form a machine reads. */
export function normalizeIban (iban: string): string {
  return (iban || '').replace(/[\s-]/g, '').toUpperCase()
}

/* Two letters for the country, two check digits, then up to 30 of the
   country's own account characters. The total length is fixed per country
   and ranges from 15 (Norway) to 34; the outer bounds are checked here and
   the checksum catches almost everything a per-country table would. */
const SHAPE = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/

/* ISO 13616: move the country code and check digits to the end, replace each
   letter with its position in the alphabet plus 9, and read the result as one
   long decimal. A valid IBAN leaves a remainder of 1 modulo 97.

   The number is far past what a double can hold — a 34-character IBAN becomes
   nearly 70 digits — so the remainder is carried along a few digits at a
   time, which is the same arithmetic anyone does by hand. */
export function isValidIban (iban: string): boolean {
  const value = normalizeIban(iban)
  if (!SHAPE.test(value)) return false

  const rearranged = value.slice(4) + value.slice(0, 4)
  let remainder = 0
  for (const character of rearranged) {
    const digits = character >= 'A' && character <= 'Z'
      ? String(character.charCodeAt(0) - 55)
      : character
    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97
    }
  }
  return remainder === 1
}

/** "GB29 NWBK 6016 1331 9268 19" — how an IBAN is written down for a person. */
export function formatIban (iban: string): string {
  return normalizeIban(iban).replace(/(.{4})/g, '$1 ').trim()
}
