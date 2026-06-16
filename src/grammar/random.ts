export type RandomSource = {
  next: () => number
  range: (min: number, max: number) => number
  int: (min: number, max: number) => number
  chance: (odds: number) => boolean
}

export function createRandom(seed: number): RandomSource {
  let state = seed >>> 0
  const next = () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    range: (min, max) => min + (max - min) * next(),
    int: (min, max) => Math.floor(min + (max - min + 1) * next()),
    chance: (odds) => next() < odds,
  }
}
