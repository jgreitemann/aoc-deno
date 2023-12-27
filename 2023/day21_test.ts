import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { findStart, Point } from "../utils/vec.ts";
import { numberOfPossiblePositions, takeManySteps, takeStep } from "./day21.ts";
import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { iter } from "../utils/iter.ts";

const EXAMPLE_MAP = [
  "...........",
  ".....###.#.",
  ".###.##..#.",
  "..#.#...#..",
  "....#.#....",
  ".##..S####.",
  ".##..#...#.",
  ".......##..",
  ".##.#.####.",
  ".##..##.##.",
  "...........",
];

const EXAMPLE_MAP_AFTER_ONE_STEP = [
  "...........",
  ".....###.#.",
  ".###.##..#.",
  "..#.#...#..",
  "....#O#....",
  ".##.OS####.",
  ".##..#...#.",
  ".......##..",
  ".##.#.####.",
  ".##..##.##.",
  "...........",
];

const EXAMPLE_MAP_AFTER_TWO_STEPS = [
  "...........",
  ".....###.#.",
  ".###.##..#.",
  "..#.#O..#..",
  "....#.#....",
  ".##O.O####.",
  ".##.O#...#.",
  ".......##..",
  ".##.#.####.",
  ".##..##.##.",
  "...........",
];

const EXAMPLE_MAP_AFTER_THREE_STEPS = [
  "...........",
  ".....###.#.",
  ".###.##..#.",
  "..#.#.O.#..",
  "...O#O#....",
  ".##.OS####.",
  ".##O.#...#.",
  "....O..##..",
  ".##.#.####.",
  ".##..##.##.",
  "...........",
];

const EXAMPLE_MAP_AFTER_SIX_STEPS = [
  "...........",
  ".....###.#.",
  ".###.##.O#.",
  ".O#O#O.O#..",
  "O.O.#.#.O..",
  ".##O.O####.",
  ".##.O#O..#.",
  ".O.O.O.##..",
  ".##.#.####.",
  ".##O.##.##.",
  "...........",
];

const EXAMPLE_STARTING_POSITION: Point = [5, 5];

function possiblePositionsInMap(map: string[]): Point[] {
  return map.flatMap((line, row) =>
    iter(line.split(""))
      .filterMap((elem, col) => elem === "O" ? [row, col] as const : undefined)
      .collect()
  ).sort();
}

Deno.test("Starting position is found", () => {
  assertEquals(findStart(EXAMPLE_MAP), EXAMPLE_STARTING_POSITION);
});

Deno.test("Possible positions after taking individual steps with open boundary conditions are found", () => {
  assertEquals(
    takeStep(HashSet.of(EXAMPLE_STARTING_POSITION), EXAMPLE_MAP, "open")
      .toArray()
      .sort(),
    possiblePositionsInMap(EXAMPLE_MAP_AFTER_ONE_STEP),
  );
  assertEquals(
    takeStep(
      possiblePositionsInMap(EXAMPLE_MAP_AFTER_ONE_STEP),
      EXAMPLE_MAP,
      "open",
    )
      .toArray().sort(),
    possiblePositionsInMap(EXAMPLE_MAP_AFTER_TWO_STEPS),
  );
  assertEquals(
    takeStep(
      possiblePositionsInMap(EXAMPLE_MAP_AFTER_TWO_STEPS),
      EXAMPLE_MAP,
      "open",
    )
      .toArray().sort(),
    possiblePositionsInMap(EXAMPLE_MAP_AFTER_THREE_STEPS),
  );
  const after_four = takeStep(
    possiblePositionsInMap(EXAMPLE_MAP_AFTER_THREE_STEPS),
    EXAMPLE_MAP,
    "open",
  );
  const after_five = takeStep(after_four, EXAMPLE_MAP, "open");
  const after_six = takeStep(after_five, EXAMPLE_MAP, "open");
  assertEquals(
    after_six.toArray().sort(),
    possiblePositionsInMap(EXAMPLE_MAP_AFTER_SIX_STEPS),
  );
});

Deno.test("Possible positions after taking six steps with open boundary conditions on the example map", () => {
  assertEquals(
    takeManySteps(6, EXAMPLE_STARTING_POSITION, EXAMPLE_MAP, "open").toArray()
      .sort(),
    possiblePositionsInMap(EXAMPLE_MAP_AFTER_SIX_STEPS),
  );
});

[
  { steps: 6, numPossible: 16 },
  { steps: 10, numPossible: 50 },
  { steps: 50, numPossible: 1594 },
  { steps: 100, numPossible: 6536 },
  { steps: 500, numPossible: 167004 },
  // { steps: 1000, numPossible: 668697 },
  // { steps: 5000, numPossible: 16733044 },
].forEach(({ steps, numPossible }) =>
  Deno.test(`${numPossible} possible positions after ${steps} steps with periodic boundary conditions`, () => {
    assertEquals(
      takeManySteps(steps, EXAMPLE_STARTING_POSITION, EXAMPLE_MAP, "periodic")
        .size,
      numPossible,
    );
  })
);

[
  { steps: 6, numPossible: 16 },
  { steps: 10, numPossible: 50 },
  { steps: 50, numPossible: 1594 },
  { steps: 100, numPossible: 6536 },
  { steps: 500, numPossible: 167004 },
  { steps: 1000, numPossible: 668697 },
  { steps: 5000, numPossible: 16733044 },
].forEach(({ steps, numPossible }) =>
  Deno.test(`Extrapolate ${numPossible} possible positions after ${steps} steps with periodic boundary conditions`, () => {
    assertEquals(
      numberOfPossiblePositions(steps, EXAMPLE_STARTING_POSITION, EXAMPLE_MAP),
      numPossible,
    );
  })
);
