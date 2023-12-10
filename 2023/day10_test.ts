import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { Point, traceLoop } from "./day10.ts";
import { HashMap } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";

const SIMPLE_EXAMPLE_PIPES = [
  "-L|F7",
  "7S-7|",
  "L|7||",
  "-L-J|",
  "L|-JF",
];

const SIMPLE_LOOP_DISTANCES = [
  ".....",
  ".012.",
  ".1.3.",
  ".234.",
  ".....",
];

const COMPLEX_EXAMPLE_PIPES = [
  "..F7.",
  ".FJ|.",
  "SJ.L7",
  "|F--J",
  "LJ...",
];

const COMPLEX_LOOP_DISTANCES = [
  "..45.",
  ".236.",
  "01.78",
  "14567",
  "23...",
];

function assertDistances(
  distanceMap: HashMap<Point, number>,
  expected: string[],
) {
  for (const [p, distance] of distanceMap) {
    assertEquals(
      distance.toString(),
      expected.at(p[0])?.at(p[1]),
      `while comparing distance for point (${p})`,
    );
  }
  for (const row in expected) {
    for (let col = 0; col < expected[row].length; ++col) {
      if (expected[row][col] !== ".") {
        assertEquals(
          distanceMap.get([+row, col]),
          +expected[row][col],
          `while comparing distance at point (${row}, ${col})`,
        );
      }
    }
  }
}

Deno.test("Simple loop path is traced out and annotated with distance from start", () => {
  assertDistances(traceLoop(SIMPLE_EXAMPLE_PIPES), SIMPLE_LOOP_DISTANCES);
});

Deno.test("Complex loop path is traced out and annotated with distance from start", () => {
  assertDistances(traceLoop(COMPLEX_EXAMPLE_PIPES), COMPLEX_LOOP_DISTANCES);
});
