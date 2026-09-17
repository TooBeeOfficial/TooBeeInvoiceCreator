/* Splitting one rounded amount across several lines without losing a penny.

   A 10% discount on three lines of £3.33 is £1.00, but a tenth of each line
   rounds to 33p three times over and leaves you a penny short. The largest
   remainder method hands the leftovers to the lines that were rounded down
   hardest, so the parts always sum to exactly the whole. */

export function allocate (total: number, weights: number[]): number[] {
  const count = weights.length
  if (count === 0) return []

  const weightTotal = weights.reduce((a, b) => a + b, 0)
  if (weightTotal === 0) {
    // Nothing to weigh against: put it all on the first line rather than nowhere.
    const out = new Array(count).fill(0)
    out[0] = total
    return out
  }

  const exact = weights.map((w) => (total * w) / weightTotal)
  const floors = exact.map((v) => (v < 0 ? Math.ceil(v) : Math.floor(v)))
  let remainder = total - floors.reduce((a, b) => a + b, 0)

  /* Rank by how much each line lost to the floor, biggest loser first. */
  const order = exact
    .map((value, index) => ({ index, fraction: Math.abs(value - floors[index]) }))
    .sort((a, b) => b.fraction - a.fraction)

  const step = remainder < 0 ? -1 : 1
  let cursor = 0
  while (remainder !== 0 && order.length > 0) {
    floors[order[cursor % order.length].index] += step
    remainder -= step
    cursor += 1
  }

  return floors
}
