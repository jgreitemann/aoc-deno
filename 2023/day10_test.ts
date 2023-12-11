import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { traceLoop } from "./day10.ts";

const SIMPLE_EXAMPLE_PIPES = [
  "-L|F7",
  "7S-7|",
  "L|7||",
  "-L-J|",
  "L|-JF",
];

const SIMPLE_LOOP_POINTS = [
  [1, 1],
  [2, 1],
  [3, 1],
  [3, 2],
  [3, 3],
  [2, 3],
  [1, 3],
  [1, 2],
];

const COMPLEX_EXAMPLE_PIPES = [
  "..F7.",
  ".FJ|.",
  "SJ.L7",
  "|F--J",
  "LJ...",
];

const COMPLEX_LOOP_POINTS = [
  [2, 0],
  [3, 0],
  [4, 0],
  [4, 1],
  [3, 1],
  [3, 2],
  [3, 3],
  [3, 4],
  [2, 4],
  [2, 3],
  [1, 3],
  [0, 3],
  [0, 2],
  [1, 2],
  [1, 1],
  [2, 1],
];

Deno.test("Simple loop path is traced out and annotated with distance from start", () => {
  assertEquals(traceLoop(SIMPLE_EXAMPLE_PIPES), SIMPLE_LOOP_POINTS);
});

Deno.test("Complex loop path is traced out and annotated with distance from start", () => {
  assertEquals(traceLoop(COMPLEX_EXAMPLE_PIPES), COMPLEX_LOOP_POINTS);
});
