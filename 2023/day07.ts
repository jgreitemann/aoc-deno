import { Solution } from "../solution.ts";
import { sum, zip } from "../utils/iter.ts";

export default <Solution<[Hand, number][]>> {
  parse: parseHands,
  part1(hands: [Hand, number][]): number {
    return totalWinnings(hands, Rules.Jack);
  },
  part2(hands: [Hand, number][]): number {
    return totalWinnings(hands, Rules.Joker);
  },
};

export function parseHands(input: string): [Hand, number][] {
  return input.split("\n").map((line) => {
    const [hand, bid] = line.split(" ");
    const cards = hand.split("");
    if (cards.length !== 5 || !cards.every((c) => c in VALUATION)) {
      throw new Error("Invalid hand: " + hand);
    }
    return [cards as Hand, +bid];
  });
}

const VALUATION = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "T": 10,
  "J": 11,
  "Q": 12,
  "K": 13,
  "A": 14,
};

const JOKER_VALUATION: Valuation = { ...VALUATION, "J": -1 };

export type Valuation = typeof VALUATION;
export type Card = keyof typeof VALUATION;
export type Hand = [Card, Card, Card, Card, Card];

export enum Rules {
  Jack,
  Joker,
}

export enum TypeOfHand {
  HighCard,
  OnePair,
  TwoPair,
  ThreeOfAKind,
  FullHouse,
  FourOfAKind,
  FiveOfAKind,
}

export function typeOfHand(hand: Hand): TypeOfHand {
  const sortedHand = hand.toSorted();
  if (allSame(sortedHand)) {
    return TypeOfHand.FiveOfAKind;
  } else if (allSame(sortedHand.slice(0, 4)) || allSame(sortedHand.slice(1))) {
    return TypeOfHand.FourOfAKind;
  } else if (
    allSame(sortedHand.slice(0, 3)) || allSame(sortedHand.slice(1, 4)) ||
    allSame(sortedHand.slice(2))
  ) {
    if (allSame(sortedHand.slice(0, 2)) && allSame(sortedHand.slice(3))) {
      return TypeOfHand.FullHouse;
    } else {
      return TypeOfHand.ThreeOfAKind;
    }
  }

  const pairCount = sum(
    zip(sortedHand.slice(0, 4), sortedHand.slice(1)).map(([lhs, rhs]) =>
      lhs === rhs ? 1 : 0
    ),
  );

  if (pairCount >= 2) {
    return TypeOfHand.TwoPair;
  } else if (pairCount === 1) {
    return TypeOfHand.OnePair;
  } else {
    return TypeOfHand.HighCard;
  }
}

function allSame<T>(seq: T[]): boolean {
  return seq.every((x) => x === seq[0]);
}

export function typeOfHandWithJoker(hand: Hand): TypeOfHand {
  const handWithoutJokers = hand.filter((c) => c !== "J");

  const frequencies = new Map<Card, number>();
  for (const card of handWithoutJokers) {
    const prevFreq = frequencies.get(card) ?? 0;
    frequencies.set(card, prevFreq + 1);
  }

  let substitute: Card = "A";
  let highestFrequency = 0;
  for (const [card, freq] of frequencies.entries()) {
    if (freq > highestFrequency) {
      highestFrequency = freq;
      substitute = card;
    }
  }

  return typeOfHand(hand.map((c) => c === "J" ? substitute : c) as Hand);
}

export function compareHands(lhs: Hand, rhs: Hand, rules: Rules): number {
  const valuation = rules === Rules.Joker ? JOKER_VALUATION : VALUATION;
  const type_fn = rules === Rules.Joker ? typeOfHandWithJoker : typeOfHand;
  const lhs_type = type_fn(lhs);
  const rhs_type = type_fn(rhs);
  if (lhs_type !== rhs_type) {
    return lhs_type - rhs_type;
  } else {
    return zip(lhs, rhs).fold(
      (acc, [l, r]) => acc === 0 ? valuation[l] - valuation[r] : acc,
      0,
    );
  }
}

export function totalWinnings(hands: [Hand, number][], rules: Rules): number {
  return sum(
    hands.toSorted(([lhs], [rhs]) => compareHands(lhs, rhs, rules)).map((
      [_, bid],
      index,
    ) => bid * (index + 1)),
  );
}
