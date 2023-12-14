import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  bruteForceCombinations,
  determineCombinations,
  parseReports,
  Report,
  runDistributions,
  unfold,
} from "./day12.ts";

const EXAMPLE_INPUT = `???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`;

const EXAMPLE_REPORT: Report[] = [
  { pattern: "???.###", runs: [1, 1, 3] },
  { pattern: ".??..??...?##.", runs: [1, 1, 3] },
  { pattern: "?#?#?#?#?#?#?#?", runs: [1, 3, 1, 6] },
  { pattern: "????.#...#...", runs: [4, 1, 1] },
  { pattern: "????.######..#####.", runs: [1, 6, 5] },
  { pattern: "?###????????", runs: [3, 2, 1] },
];

Deno.test("Parse condition report", () => {
  assertEquals(parseReports(EXAMPLE_INPUT), EXAMPLE_REPORT);
});

Deno.test("Report can be unfolded", () => {
  assertEquals(unfold(EXAMPLE_REPORT[0]), {
    pattern: "???.###????.###????.###????.###????.###",
    runs: [1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3],
  });
});

Deno.test("Distribute runs over groups", () => {
  assertEquals(
    runDistributions(["#?#", "?#"], [1, 1, 2]),
    [[[1, 1], [2]]],
  );
  assertEquals(
    runDistributions(["?####?????", "#???"], [5, 1, 3]),
    [
      [[5], [1, 3]],
      [[5, 1], [3]],
      [[5, 1, 3], []],
    ],
  );
  assertEquals(
    runDistributions(["??", "?????", "?"], [3, 1]),
    [
      [[], [3], [1]],
      [[], [3, 1], []],
    ],
  );
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

[
  { report: EXAMPLE_REPORT[0], combinations: 1 },
  { report: EXAMPLE_REPORT[1], combinations: 4 },
  { report: EXAMPLE_REPORT[2], combinations: 1 },
  { report: EXAMPLE_REPORT[3], combinations: 1 },
  { report: EXAMPLE_REPORT[4], combinations: 4 },
  { report: EXAMPLE_REPORT[5], combinations: 10 },
  { report: { pattern: "??.?????.?", runs: [3, 1] }, combinations: 4 },
].forEach(({ report: { pattern, runs }, combinations }) =>
  Deno.test(`Example report: ${pattern} ~ [${runs}] => ${combinations}`, () => {
    assertEquals(determineCombinations(pattern, runs), combinations);
  })
);

[
  { report: EXAMPLE_REPORT[0], combinations: 1 },
  { report: EXAMPLE_REPORT[1], combinations: 16384 },
  // { report: EXAMPLE_REPORT[2], combinations: 1 },
  { report: EXAMPLE_REPORT[3], combinations: 16 },
  { report: EXAMPLE_REPORT[4], combinations: 2500 },
  // { report: EXAMPLE_REPORT[5], combinations: 506250 },
].forEach(({ report, combinations }) =>
  Deno.test(`Example report unfolded: ${report.pattern} ~ [${report.runs}] => ${combinations}`, () => {
    const unfolded = unfold(report);
    assertEquals(
      determineCombinations(unfolded.pattern, unfolded.runs),
      combinations,
    );
  })
);
