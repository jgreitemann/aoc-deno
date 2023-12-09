import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  extrapolateBackwards,
  extrapolateForward,
  parseHistories,
} from "./day09.ts";

const EXAMPLE_INPUT = `0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`;

const EXAMPLE_HISTORIES = [
  [0, 3, 6, 9, 12, 15],
  [1, 3, 6, 10, 15, 21],
  [10, 13, 16, 21, 30, 45],
];

Deno.test("Example histories can be parsed", () => {
  assertEquals(parseHistories(EXAMPLE_INPUT), EXAMPLE_HISTORIES);
});

Deno.test("Example histories can be extrapolated forward", () => {
  assertEquals(EXAMPLE_HISTORIES.map(extrapolateForward), [18, 28, 68]);
});

Deno.test("Example histories can be extrapolated backwards", () => {
  assertEquals(EXAMPLE_HISTORIES.map(extrapolateBackwards), [-3, 0, 5]);
});
