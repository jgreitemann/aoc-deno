import { Solution } from "../solution.ts";
import { sum } from "../utils/iter.ts";

export default <Solution<Scratchcard[]>> {
  parse: parseCards,
  part1(cards: Scratchcard[]): number {
    return sum(
      cards.map(numberOfMatches).map((wins) =>
        wins > 0 ? (1 << (wins - 1)) : 0
      ),
    );
  },
  part2(cards: Scratchcard[]): number {
    return sum(determineCardMultiplicities(cards));
  },
};

export type Scratchcard = {
  winningNumbers: number[];
  scratchedNumbers: number[];
};

export function parseCards(input: string): Scratchcard[] {
  return input
    .split("\n")
    .map((line) => {
      const [_card_id, winningNumStr, scratchedNumStr] = line.split(
        /\s*[:|]\s*/,
      );
      return {
        winningNumbers: winningNumStr.split(/\s+/).map((num) => +num),
        scratchedNumbers: scratchedNumStr.split(/\s+/).map((num) => +num),
      };
    });
}

export function numberOfMatches(card: Scratchcard): number {
  return sum(
    card.scratchedNumbers.map((num) =>
      card.winningNumbers.includes(num) ? 1 : 0
    ),
  );
}

export function determineCardMultiplicities(cards: Scratchcard[]): number[] {
  return cards
    .map(numberOfMatches)
    .reduce(
      (multiplicities, matches, idx) =>
        multiplicities.map((m, i) =>
          (i > idx && i <= idx + matches) ? m + multiplicities[idx] : m
        ),
      Array(cards.length).fill(1) as number[],
    );
}
