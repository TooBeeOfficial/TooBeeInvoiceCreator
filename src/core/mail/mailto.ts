/* Handing an address to whatever the machine sends mail with.

   Opened through window.open rather than by setting location, because this
   app is a window with an invoice in it: navigating that window to a mailto:
   would, on a bad day, take the invoice off the screen. The shell intercepts
   the open, hands the URL to the operating system and denies the navigation,
   so the mail client comes up and the editor stays exactly where it was. In
   a browser the same call does the same thing.

   Nothing here composes a message. A subject line written by an invoicing
   app is a subject line the sender has to delete, and the one thing they
   actually wanted — not typing the address — is done by the time the window
   opens. */

/* Deliberately loose. This decides whether to offer a button, not whether an
   address is deliverable, and a rule strict enough to be worth arguing about
   would start refusing addresses that work. */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmailAddress (value: string): boolean {
  return LOOKS_LIKE_EMAIL.test((value || '').trim())
}

/** The href an anchor or a printed document uses. */
export function mailtoHref (address: string): string {
  return `mailto:${encodeURIComponent((address || '').trim()).replace(/%40/g, '@')}`
}

/** Opens the machine's mail client on `address`. Does nothing for a blank or
    obviously broken one, so a half-typed address cannot launch anything. */
export function sendMailTo (address: string): void {
  if (!isEmailAddress(address)) return
  window.open(mailtoHref(address), '_blank', 'noopener')
}
