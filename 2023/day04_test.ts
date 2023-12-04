import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import {
  determineCardMultiplicities,
  numberOfMatches,
  parseCards,
  Scratchcard,
} from "./day04.ts";

const EXAMPLE_INPUT = `Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`;

const EXAMPLE_CARDS: Scratchcard[] = [
  {
    winningNumbers: [41, 48, 83, 86, 17],
    scratchedNumbers: [83, 86, 6, 31, 17, 9, 48, 53],
  },
  {
    winningNumbers: [13, 32, 20, 16, 61],
    scratchedNumbers: [61, 30, 68, 82, 17, 32, 24, 19],
  },
  {
    winningNumbers: [1, 21, 53, 59, 44],
    scratchedNumbers: [69, 82, 63, 72, 16, 21, 14, 1],
  },
  {
    winningNumbers: [41, 92, 73, 84, 69],
    scratchedNumbers: [59, 84, 76, 51, 58, 5, 54, 83],
  },
  {
    winningNumbers: [87, 83, 26, 28, 32],
    scratchedNumbers: [88, 30, 70, 12, 93, 22, 82, 36],
  },
  {
    winningNumbers: [31, 18, 13, 56, 72],
    scratchedNumbers: [74, 77, 10, 23, 35, 67, 36, 11],
  },
];

Deno.test("Input is parsed into Scratchcards", () => {
  assertEquals(parseCards(EXAMPLE_INPUT), EXAMPLE_CARDS);
});

Deno.test("Correct number of matches is found for each card", () => {
  assertEquals(numberOfMatches(EXAMPLE_CARDS[0]), 4);
  assertEquals(numberOfMatches(EXAMPLE_CARDS[1]), 2);
  assertEquals(numberOfMatches(EXAMPLE_CARDS[2]), 2);
  assertEquals(numberOfMatches(EXAMPLE_CARDS[3]), 1);
  assertEquals(numberOfMatches(EXAMPLE_CARDS[4]), 0);
  assertEquals(numberOfMatches(EXAMPLE_CARDS[5]), 0);
});

Deno.test("The multiplicities of each card are determined", () => {
  assertEquals(determineCardMultiplicities(EXAMPLE_CARDS), [1, 2, 4, 8, 14, 1]);
});
