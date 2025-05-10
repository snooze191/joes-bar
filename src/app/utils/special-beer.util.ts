export enum SpecialBeerId {
  DecreaseAlcoholRandomly = 10,
  IncreaseAlcoholRandomly = 11,
  ResetAlcohol = 12,
  DecreaseAlcoholAndBoostLimit = 30,
}

export const specialBeerIds = new Set<number>([
  SpecialBeerId.DecreaseAlcoholRandomly,
  SpecialBeerId.IncreaseAlcoholRandomly,
  SpecialBeerId.ResetAlcohol,
  SpecialBeerId.DecreaseAlcoholAndBoostLimit,
]);
