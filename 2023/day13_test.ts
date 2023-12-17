import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { findMirrorPlane } from "./day13.ts";

const EXAMPLE_PATTERNS = [
  [
    "#.##..##.",
    "..#.##.#.",
    "##......#",
    "##......#",
    "..#.##.#.",
    "..##..##.",
    "#.#.##.#.",
  ],
  [
    "#...##..#",
    "#....#..#",
    "..##..###",
    "#####.##.",
    "#####.##.",
    "..##..###",
    "#....#..#",
  ],
];

Deno.test("Vertical mirror plane in first example pattern is found", () => {
  assertEquals(findMirrorPlane(EXAMPLE_PATTERNS[0], 0), 5);
});

Deno.test("Horizontal mirror plane in second example pattern is found", () => {
  assertEquals(findMirrorPlane(EXAMPLE_PATTERNS[1], 0), 400);
});

Deno.test("Accounting for smudges, the patterns have different mirror planes", () => {
  assertEquals(findMirrorPlane(EXAMPLE_PATTERNS[0], 1), 300);
  assertEquals(findMirrorPlane(EXAMPLE_PATTERNS[1], 1), 100);
});
