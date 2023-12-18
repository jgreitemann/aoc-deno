import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { followSteps, lagoon, parseSteps, Step } from "./day18.ts";
import { Vector } from "../utils/vec.ts";
import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { range } from "../utils/iter.ts";

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
  { direction: "EAST", stride: 6 /*(#70c710)*/ },
  { direction: "SOUTH", stride: 5 /*(#0dc571)*/ },
  { direction: "WEST", stride: 2 /*(#5713f0)*/ },
  { direction: "SOUTH", stride: 2 /*(#d2c081)*/ },
  { direction: "EAST", stride: 2 /*(#59c680)*/ },
  { direction: "SOUTH", stride: 2 /*(#411b91)*/ },
  { direction: "WEST", stride: 5 /*(#8ceee2)*/ },
  { direction: "NORTH", stride: 2 /*(#caa173)*/ },
  { direction: "WEST", stride: 1 /*(#1b58a2)*/ },
  { direction: "NORTH", stride: 2 /*(#caa171)*/ },
  { direction: "EAST", stride: 2 /*(#7807d2)*/ },
  { direction: "NORTH", stride: 3 /*(#a77fa3)*/ },
  { direction: "WEST", stride: 2 /*(#015232)*/ },
  { direction: "NORTH", stride: 2 /*(#7a21e3)*/ },
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

function render(mapStr: string): HashSet<Readonly<Vector<2>>> {
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

Deno.test("Steps are followed to trace out the trench", () => {
  assertEquals(
    HashSet.from(followSteps(EXAMPLE_STEPS)).toArray(),
    render(EXAMPLE_TRENCH).toArray(),
  );
});

Deno.test("The lagoon is completely identified, including interior", () => {
  assertEquals(
    lagoon(EXAMPLE_STEPS).toArray(),
    render(EXAMPLE_LAGOON).toArray(),
  );
});
