import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { parseInput, Race, unkern, waysToBeatRecord } from "./day06.ts";

const EXAMPLE_INPUT = `Time:      7  15   30
Distance:  9  40  200`;

const EXAMPLE_RACES: Race[] = [
  { timeAllowed: 7, recordDistance: 9 },
  { timeAllowed: 15, recordDistance: 40 },
  { timeAllowed: 30, recordDistance: 200 },
];

const EXAMPLE_UNKERNED_RACE: Race = {
  timeAllowed: 71530,
  recordDistance: 940200,
};

Deno.test("Input table is parsed into races data", () => {
  assertEquals(parseInput(EXAMPLE_INPUT), EXAMPLE_RACES);
});

Deno.test("Number of ways to beat the record is determined for each race", () => {
  assertEquals(EXAMPLE_RACES.map(waysToBeatRecord), [4, 8, 9]);
});

Deno.test("Races can be 'unkerned' into one", () => {
  assertEquals(unkern(EXAMPLE_RACES), EXAMPLE_UNKERNED_RACE);
});

Deno.test("Number of ways to beat the 'unkerned' race is correct", () => {
  assertEquals(waysToBeatRecord(EXAMPLE_UNKERNED_RACE), 71503);
});
