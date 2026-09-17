/* Identifiers for things that live inside a document.

   Lines get ids so React can keep track of a row while its text changes, and
   so reordering never confuses one line with another. They mean nothing
   outside the file that holds them. */

let counter = 0

export function makeId (prefix = 'id'): string {
  counter += 1
  const stamp = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 7)
  return `${prefix}_${stamp}${counter.toString(36)}${rand}`
}
