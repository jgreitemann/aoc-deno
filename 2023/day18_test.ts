import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  Distortion,
  distortSteps,
  findRealLagoonArea,
  followSteps,
  lagoon,
  parseColorSteps,
  parseSteps,
  Step,
} from "./day18.ts";
import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { range } from "../utils/iter.ts";
import { Point } from "../utils/vec.ts";

const EXAMPLE_INPUT = `R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`;

const EXAMPLE_STEPS: Step[] = [
  { direction: "EAST", stride: 6 },
  { direction: "SOUTH", stride: 5 },
  { direction: "WEST", stride: 2 },
  { direction: "SOUTH", stride: 2 },
  { direction: "EAST", stride: 2 },
  { direction: "SOUTH", stride: 2 },
  { direction: "WEST", stride: 5 },
  { direction: "NORTH", stride: 2 },
  { direction: "WEST", stride: 1 },
  { direction: "NORTH", stride: 2 },
  { direction: "EAST", stride: 2 },
  { direction: "NORTH", stride: 3 },
  { direction: "WEST", stride: 2 },
  { direction: "NORTH", stride: 2 },
];

const EXAMPLE_COLOR_STEPS: Step[] = [
  { direction: "EAST", stride: 461937 },
  { direction: "SOUTH", stride: 56407 },
  { direction: "EAST", stride: 356671 },
  { direction: "SOUTH", stride: 863240 },
  { direction: "EAST", stride: 367720 },
  { direction: "SOUTH", stride: 266681 },
  { direction: "WEST", stride: 577262 },
  { direction: "NORTH", stride: 829975 },
  { direction: "WEST", stride: 112010 },
  { direction: "SOUTH", stride: 829975 },
  { direction: "WEST", stride: 491645 },
  { direction: "NORTH", stride: 686074 },
  { direction: "WEST", stride: 5411 },
  { direction: "NORTH", stride: 500254 },
];

const EXAMPLE_TRENCH = `#######
#.....#
###...#
..#...#
..#...#
###.###
#...#..
##..###
.#....#
.######`;

const EXAMPLE_LAGOON = `#######
#######
#######
..#####
..#####
#######
#####..
#######
.######
.######`;

const SIMPLE_WIDE_STEPS: Step[] = [
  { direction: "SOUTH", stride: 2000 },
  { direction: "EAST", stride: 2000 },
  { direction: "SOUTH", stride: 1000 },
  { direction: "EAST", stride: 1000 },
  { direction: "NORTH", stride: 2000 },
  { direction: "WEST", stride: 2000 },
  { direction: "NORTH", stride: 1000 },
  { direction: "WEST", stride: 1000 },
];

const INVERSE_WIDE_STEPS: Step[] = [
  { direction: "NORTH", stride: 2000 },
  { direction: "EAST", stride: 2000 },
  { direction: "NORTH", stride: 1000 },
  { direction: "EAST", stride: 1000 },
  { direction: "SOUTH", stride: 2000 },
  { direction: "WEST", stride: 2000 },
  { direction: "SOUTH", stride: 1000 },
  { direction: "WEST", stride: 1000 },
];

const SIMPLE_WIDE_DISTORTION: Distortion = {
  start: [0, 0],
  distortedSteps: [
    { direction: "SOUTH", stride: 4 },
    { direction: "EAST", stride: 4 },
    { direction: "SOUTH", stride: 2 },
    { direction: "EAST", stride: 2 },
    { direction: "NORTH", stride: 4 },
    { direction: "WEST", stride: 4 },
    { direction: "NORTH", stride: 2 },
    { direction: "WEST", stride: 2 },
  ],
  rowScaling: [1, 999, 1, 999, 1, 999, 1],
  colScaling: [1, 999, 1, 999, 1, 999, 1],
};

function render(mapStr: string): HashSet<Point> {
  const map = mapStr.split("\n");

  return HashSet.from(
    map.flatMap((line, row) =>
      range(0, line.length)
        .filter((col) => line[col] === "#")
        .map((col) => [row, col] as const)
        .collect()
    ),
  );
}

Deno.test("Input steps are parsed", () => {
  assertEquals(parseSteps(EXAMPLE_INPUT), EXAMPLE_STEPS);
});

Deno.test("Real steps are parsed based on hex 'color' decoding", () => {
  assertEquals(parseColorSteps(EXAMPLE_INPUT), EXAMPLE_COLOR_STEPS);
});

Deno.test("Steps are followed to trace out the trench", () => {
  assertEquals(
    HashSet.from(followSteps(EXAMPLE_STEPS)).toArray(),
    render(EXAMPLE_TRENCH).toArray(),
  );
});

Deno.test("The lagoon is completely identified, including interior", () => {
  assertEquals(
    lagoon(followSteps(EXAMPLE_STEPS)).toArray(),
    render(EXAMPLE_LAGOON).toArray(),
  );
});

Deno.test("Steps with a very wide stride can be distorted to keep managable", () => {
  assertEquals(distortSteps(SIMPLE_WIDE_STEPS), SIMPLE_WIDE_DISTORTION);
});

Deno.test("The area of the real lagoon is found by accounting for the effect of distortion", () => {
  assertEquals(
    findRealLagoonArea(SIMPLE_WIDE_STEPS),
    12 * 1000 + 4 * 999 + 5 * 999 ** 2,
  );
  assertEquals(
    findRealLagoonArea(INVERSE_WIDE_STEPS),
    12 * 1000 + 4 * 999 + 5 * 999 ** 2,
  );
  assertEquals(
    findRealLagoonArea(EXAMPLE_COLOR_STEPS),
    952408144115,
  );
});
