import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { bruteForceCombinations, parseReports, Report } from "./day12.ts";

const EXAMPLE_INPUT = `#.#.### 1,1,3
.#...#....###. 1,1,3
.#.###.#.###### 1,3,1,6
####.#...#... 4,1,1
#....######..#####. 1,6,5
.###.##....# 3,2,1`;

const EXAMPLE_REPORT: Report[] = [
  { pattern: "#.#.###", runs: [1, 1, 3] },
  { pattern: ".#...#....###.", runs: [1, 1, 3] },
  { pattern: ".#.###.#.######", runs: [1, 3, 1, 6] },
  { pattern: "####.#...#...", runs: [4, 1, 1] },
  { pattern: "#....######..#####.", runs: [1, 6, 5] },
  { pattern: ".###.##....#", runs: [3, 2, 1] },
];

Deno.test("Parse condition report", () => {
  assertEquals(parseReports(EXAMPLE_INPUT), EXAMPLE_REPORT);
});

[
  { report: { pattern: "???", runs: [1, 1] }, combinations: 1 },
  { report: { pattern: "???", runs: [1] }, combinations: 3 },
  { report: { pattern: "???", runs: [2] }, combinations: 2 },
  { report: { pattern: "???", runs: [3] }, combinations: 1 },
  { report: { pattern: "???", runs: [1, 2] }, combinations: 0 },
  { report: { pattern: "?#?", runs: [1] }, combinations: 1 },
  { report: { pattern: "?#?", runs: [2] }, combinations: 2 },
  { report: { pattern: "?#?", runs: [3] }, combinations: 1 },
  { report: { pattern: "#??", runs: [1] }, combinations: 1 },
  { report: { pattern: "#??", runs: [2] }, combinations: 1 },
  { report: { pattern: "#??", runs: [3] }, combinations: 1 },
  { report: { pattern: "?.?", runs: [1] }, combinations: 2 },
  { report: { pattern: "?.?", runs: [2] }, combinations: 0 },
  { report: { pattern: "?.?", runs: [3] }, combinations: 0 },
  { report: { pattern: ".??", runs: [1] }, combinations: 2 },
  { report: { pattern: ".??", runs: [2] }, combinations: 1 },
].forEach(({ report: { pattern, runs }, combinations }) =>
  Deno.test(`Simple reports can be brute-forced: ${pattern} ~ [${runs}] => ${combinations}`, () => {
    assertEquals(bruteForceCombinations(pattern, runs), combinations);
  })
);
