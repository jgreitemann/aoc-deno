import {
  assertEquals,
  assertLess,
} from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  compareHands,
  Hand,
  parseHands,
  Rules,
  totalWinnings,
  TypeOfHand,
  typeOfHand,
  typeOfHandWithJoker,
} from "./day07.ts";

const EXAMPLE_INPUT = `32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`;

const EXAMPLE_HANDS = [
  [["3", "2", "T", "3", "K"] as Hand, 765],
  [["T", "5", "5", "J", "5"] as Hand, 684],
  [["K", "K", "6", "7", "7"] as Hand, 28],
  [["K", "T", "J", "J", "T"] as Hand, 220],
  [["Q", "Q", "Q", "J", "A"] as Hand, 483],
] as [Hand, number][];

Deno.test("Example input is parsed into pairs of hand and bit", () => {
  assertEquals(parseHands(EXAMPLE_INPUT), EXAMPLE_HANDS);
});

Deno.test("Type of hand is determined", () => {
  assertEquals(
    typeOfHand(["A", "A", "A", "A", "A"] as Hand),
    TypeOfHand.FiveOfAKind,
  );
  assertEquals(
    typeOfHand(["A", "A", "8", "A", "A"] as Hand),
    TypeOfHand.FourOfAKind,
  );
  assertEquals(
    typeOfHand(["3", "2", "2", "2", "2"] as Hand),
    TypeOfHand.FourOfAKind,
  );
  assertEquals(
    typeOfHand(["2", "3", "3", "3", "2"] as Hand),
    TypeOfHand.FullHouse,
  );
  assertEquals(
    typeOfHand(["T", "T", "T", "9", "8"] as Hand),
    TypeOfHand.ThreeOfAKind,
  );
  assertEquals(
    typeOfHand(["T", "5", "5", "J", "5"] as Hand),
    TypeOfHand.ThreeOfAKind,
  );
  assertEquals(
    typeOfHand(["Q", "Q", "Q", "J", "A"] as Hand),
    TypeOfHand.ThreeOfAKind,
  );
  assertEquals(
    typeOfHand(["1", "2", "2", "2", "3"] as Hand),
    TypeOfHand.ThreeOfAKind,
  );
  assertEquals(
    typeOfHand(["2", "3", "4", "3", "2"] as Hand),
    TypeOfHand.TwoPair,
  );
  assertEquals(
    typeOfHand(["K", "K", "6", "7", "7"] as Hand),
    TypeOfHand.TwoPair,
  );
  assertEquals(
    typeOfHand(["K", "T", "J", "J", "T"] as Hand),
    TypeOfHand.TwoPair,
  );
  assertEquals(
    typeOfHand(["A", "2", "3", "A", "4"] as Hand),
    TypeOfHand.OnePair,
  );
  assertEquals(
    typeOfHand(["3", "2", "T", "3", "K"] as Hand),
    TypeOfHand.OnePair,
  );
  assertEquals(
    typeOfHand(["2", "3", "4", "5", "6"] as Hand),
    TypeOfHand.HighCard,
  );
  assertEquals(
    typeOfHand(["A", "A", "A", "A", "A"] as Hand),
    TypeOfHand.FiveOfAKind,
  );
  assertEquals(
    typeOfHand(["A", "A", "A", "A", "A"] as Hand),
    TypeOfHand.FiveOfAKind,
  );
});

Deno.test("Hands can be sorted", () => {
  assertEquals(
    EXAMPLE_HANDS
      .map(([hand, _]) => hand)
      .sort((lhs, rhs) => compareHands(lhs, rhs, Rules.Jack))
      .map((hand) => hand.join("")),
    ["32T3K", "KTJJT", "KK677", "T55J5", "QQQJA"],
  );
});

Deno.test("Total winnings for part 1 are determined", () => {
  assertEquals(totalWinnings(EXAMPLE_HANDS, Rules.Jack), 6440);
});

Deno.test("Jokers affect type of hand in part 2", () => {
  assertEquals(
    typeOfHandWithJoker(["T", "5", "5", "J", "5"] as Hand),
    TypeOfHand.FourOfAKind,
  );
  assertEquals(
    typeOfHandWithJoker(["K", "T", "J", "J", "T"] as Hand),
    TypeOfHand.FourOfAKind,
  );
  assertEquals(
    typeOfHandWithJoker(["Q", "Q", "Q", "J", "A"] as Hand),
    TypeOfHand.FourOfAKind,
  );
});

Deno.test("When using jokers, they are individually the weakest card", () => {
  assertLess(
    compareHands(
      ["J", "K", "K", "K", "2"] as Hand,
      ["Q", "Q", "Q", "Q", "2"] as Hand,
      Rules.Joker,
    ),
    0,
  );
  assertLess(
    compareHands(
      ["J", "K", "K", "K", "2"] as Hand,
      ["0", "0", "0", "0", "2"] as Hand,
      Rules.Joker,
    ),
    0,
  );
});

Deno.test("Hands can be sorted, considering jokers", () => {
  assertEquals(
    EXAMPLE_HANDS
      .map(([hand, _]) => hand)
      .sort((lhs, rhs) => compareHands(lhs, rhs, Rules.Joker))
      .map((hand) => hand.join("")),
    ["32T3K", "KK677", "T55J5", "QQQJA", "KTJJT"],
  );
});

Deno.test("Total winnings for part 2 are determined", () => {
  assertEquals(totalWinnings(EXAMPLE_HANDS, Rules.Joker), 5905);
});
