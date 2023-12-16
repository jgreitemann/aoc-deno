import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  bruteForceCombinations,
  determineCombinations,
  parseReports,
  reduceReport,
  Report,
  runDistributions,
  shiftingRunCombinations,
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

const ALL_QUESTION_MARK_REPORTS: Report[] = [
  { pattern: "?????", runs: [3, 1] },
  { pattern: "?????", runs: [2, 1] },
  { pattern: "?????", runs: [1, 2] },
  { pattern: "?????", runs: [1, 1] },
  { pattern: "????????", runs: [1, 2] },
  { pattern: "????????", runs: [1, 2, 1] },
  { pattern: "????????", runs: [1, 1, 1, 1] },
  { pattern: "?????????????", runs: [1, 2, 2, 1] },
  { pattern: "?????", runs: [] },
  { pattern: "?????", runs: [1, 1, 2] },
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

Deno.test("Reduce reports with leading/trailing dots or hashes", () => {
  assertEquals(reduceReport({ pattern: "#????", runs: [1, 2] }), {
    pattern: "???",
    runs: [2],
  });
  assertEquals(reduceReport({ pattern: "#????", runs: [2, 1] }), {
    pattern: "??",
    runs: [1],
  });
  assertEquals(reduceReport({ pattern: "###??", runs: [2, 1] }), {
    pattern: "#",
    runs: [],
  });
  assertEquals(reduceReport({ pattern: "????#", runs: [2, 1] }), {
    pattern: "???",
    runs: [2],
  });
  assertEquals(reduceReport({ pattern: "????#", runs: [1, 2] }), {
    pattern: "??",
    runs: [1],
  });
  assertEquals(reduceReport({ pattern: "#???#", runs: [1, 2] }), {
    pattern: "",
    runs: [],
  });
  assertEquals(reduceReport({ pattern: "#????#", runs: [1, 2] }), {
    pattern: "?",
    runs: [],
  });
  assertEquals(
    reduceReport({
      pattern: "#?#?#???#???#?#??#",
      runs: [1, 1, 1, 3, 1, 1, 2],
    }),
    { pattern: "??#??", runs: [3] },
  );
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
  { report: ALL_QUESTION_MARK_REPORTS[0], combinations: 1 },
  { report: ALL_QUESTION_MARK_REPORTS[1], combinations: 3 },
  { report: ALL_QUESTION_MARK_REPORTS[2], combinations: 3 },
  { report: ALL_QUESTION_MARK_REPORTS[3], combinations: 6 },
  { report: ALL_QUESTION_MARK_REPORTS[4], combinations: 15 },
  { report: ALL_QUESTION_MARK_REPORTS[5], combinations: 10 },
  { report: ALL_QUESTION_MARK_REPORTS[6], combinations: 5 },
  { report: ALL_QUESTION_MARK_REPORTS[7], combinations: 70 },
  { report: ALL_QUESTION_MARK_REPORTS[8], combinations: 1 },
  { report: ALL_QUESTION_MARK_REPORTS[9], combinations: 0 },
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
  {
    report: { pattern: "#?????????#????", runs: [1, 3, 2, 2] },
    combinations: 17,
  },
  {
    report: { pattern: "?#??#..#?#???#??#.", runs: [5, 1, 1, 4] },
    combinations: 1,
  },
  {
    report: { pattern: "?????.????#?#?", runs: [1, 1, 2, 4] },
    combinations: 18,
  },
  { report: ALL_QUESTION_MARK_REPORTS[0], combinations: 1 },
  { report: ALL_QUESTION_MARK_REPORTS[1], combinations: 3 },
  { report: ALL_QUESTION_MARK_REPORTS[2], combinations: 3 },
  { report: ALL_QUESTION_MARK_REPORTS[3], combinations: 6 },
  { report: ALL_QUESTION_MARK_REPORTS[4], combinations: 15 },
  { report: ALL_QUESTION_MARK_REPORTS[5], combinations: 10 },
  { report: ALL_QUESTION_MARK_REPORTS[6], combinations: 5 },
  { report: ALL_QUESTION_MARK_REPORTS[7], combinations: 70 },
  { report: ALL_QUESTION_MARK_REPORTS[8], combinations: 1 },
  { report: ALL_QUESTION_MARK_REPORTS[9], combinations: 0 },
].forEach(({ report: { pattern, runs }, combinations }) =>
  Deno.test(`Example report using shiftingRuns: ${pattern} ~ [${runs}] => ${combinations}`, () => {
    assertEquals(shiftingRunCombinations(pattern, runs), combinations);
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
  {
    report: { pattern: "#?????????#????", runs: [1, 3, 2, 2] },
    combinations: 17,
  },
  {
    report: { pattern: "?????.????#?#?", runs: [1, 1, 2, 4] },
    combinations: 18,
  },
  { report: ALL_QUESTION_MARK_REPORTS[0], combinations: 1 },
  { report: ALL_QUESTION_MARK_REPORTS[1], combinations: 3 },
  { report: ALL_QUESTION_MARK_REPORTS[2], combinations: 3 },
  { report: ALL_QUESTION_MARK_REPORTS[3], combinations: 6 },
  { report: ALL_QUESTION_MARK_REPORTS[4], combinations: 15 },
  { report: ALL_QUESTION_MARK_REPORTS[5], combinations: 10 },
  { report: ALL_QUESTION_MARK_REPORTS[6], combinations: 5 },
  { report: ALL_QUESTION_MARK_REPORTS[7], combinations: 70 },
  { report: ALL_QUESTION_MARK_REPORTS[8], combinations: 1 },
  { report: ALL_QUESTION_MARK_REPORTS[9], combinations: 0 },
  {
    report: {
      pattern: "?????????????????#??????????????????#??????????????????#",
      runs: [1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 3, 3],
    },
    combinations: 1318970,
  },
].forEach(({ report: { pattern, runs }, combinations }) =>
  Deno.test(`Example report: ${pattern} ~ [${runs}] => ${combinations}`, () => {
    assertEquals(determineCombinations(pattern, runs), combinations);
  })
);

[
  { report: EXAMPLE_REPORT[0], combinations: 1 },
  { report: EXAMPLE_REPORT[1], combinations: 16384 },
  { report: EXAMPLE_REPORT[2], combinations: 1 },
  { report: EXAMPLE_REPORT[3], combinations: 16 },
  { report: EXAMPLE_REPORT[4], combinations: 2500 },
  { report: EXAMPLE_REPORT[5], combinations: 506250 },
  {
    report: { pattern: "#?????????#????", runs: [1, 3, 2, 2] },
    combinations: 79434432,
  },
  { report: ALL_QUESTION_MARK_REPORTS[0], combinations: 1 },
  { report: ALL_QUESTION_MARK_REPORTS[1], combinations: 3003 },
  { report: ALL_QUESTION_MARK_REPORTS[2], combinations: 3003 },
  { report: ALL_QUESTION_MARK_REPORTS[3], combinations: 184756 },
  { report: ALL_QUESTION_MARK_REPORTS[4], combinations: 30045015 },
  { report: ALL_QUESTION_MARK_REPORTS[5], combinations: 3268760 },
  { report: ALL_QUESTION_MARK_REPORTS[6], combinations: 53130 },
  { report: ALL_QUESTION_MARK_REPORTS[7], combinations: 137846528820 },
].forEach(({ report: { pattern, runs }, combinations }) =>
  Deno.test(`Example report unfolded: ${pattern} ~ [${runs}] => ${combinations}`, () => {
    const unfolded = unfold({ pattern, runs });
    assertEquals(
      determineCombinations(unfolded.pattern, unfolded.runs),
      combinations,
    );
  })
);
