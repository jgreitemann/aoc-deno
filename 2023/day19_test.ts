import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  isPartAccepted,
  numberOfAcceptableParts,
  parseInput,
  splitInterval,
  totalRatingOfAcceptedParts,
  Workflow,
} from "./day19.ts";

const EXAMPLE_INPUT = `px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}`;

const EXAMPLE_WORKFLOWS: Map<string, Workflow> = new Map([
  ["px", {
    rules: [
      {
        category: "a",
        relation: "<",
        threshold: 2006,
        outcome: "qkq",
      },
      {
        category: "m",
        relation: ">",
        threshold: 2090,
        outcome: true,
      },
    ],
    defaultOutcome: "rfg",
  }],
  ["pv", {
    rules: [
      {
        category: "a",
        relation: ">",
        threshold: 1716,
        outcome: false,
      },
    ],
    defaultOutcome: true,
  }],
  ["lnx", {
    rules: [
      {
        category: "m",
        relation: ">",
        threshold: 1548,
        outcome: true,
      },
    ],
    defaultOutcome: true,
  }],
  ["rfg", {
    rules: [
      { category: "s", relation: "<", threshold: 537, outcome: "gd" },
      {
        category: "x",
        relation: ">",
        threshold: 2440,
        outcome: false,
      },
    ],
    defaultOutcome: true,
  }],
  ["qs", {
    rules: [
      {
        category: "s",
        relation: ">",
        threshold: 3448,
        outcome: true,
      },
    ],
    defaultOutcome: "lnx",
  }],
  ["qkq", {
    rules: [
      {
        category: "x",
        relation: "<",
        threshold: 1416,
        outcome: true,
      },
    ],
    defaultOutcome: "crn",
  }],
  ["crn", {
    rules: [
      {
        category: "x",
        relation: ">",
        threshold: 2662,
        outcome: true,
      },
    ],
    defaultOutcome: false,
  }],
  ["in", {
    rules: [
      {
        category: "s",
        relation: "<",
        threshold: 1351,
        outcome: "px",
      },
    ],
    defaultOutcome: "qqz",
  }],
  ["qqz", {
    rules: [
      {
        category: "s",
        relation: ">",
        threshold: 2770,
        outcome: "qs",
      },
      {
        category: "m",
        relation: "<",
        threshold: 1801,
        outcome: "hdj",
      },
    ],
    defaultOutcome: false,
  }],
  ["gd", {
    rules: [
      {
        category: "a",
        relation: ">",
        threshold: 3333,
        outcome: false,
      },
    ],
    defaultOutcome: false,
  }],
  ["hdj", {
    rules: [
      { category: "m", relation: ">", threshold: 838, outcome: true },
    ],
    defaultOutcome: "pv",
  }],
]);

const EXAMPLE_PARTS = [
  { x: 787, m: 2655, a: 1222, s: 2876 },
  { x: 1679, m: 44, a: 2067, s: 496 },
  { x: 2036, m: 264, a: 79, s: 2244 },
  { x: 2461, m: 1339, a: 466, s: 291 },
  { x: 2127, m: 1623, a: 2188, s: 1013 },
];

Deno.test("Workflows and ratings are parsed from input", () => {
  assertEquals(parseInput(EXAMPLE_INPUT), {
    workflows: EXAMPLE_WORKFLOWS,
    parts: EXAMPLE_PARTS,
  });
});

Deno.test("The correct parts are accepted", () => {
  assertEquals(
    EXAMPLE_PARTS
      .map((p) => isPartAccepted(p, EXAMPLE_WORKFLOWS)),
    [true, false, true, false, true],
  );
});

Deno.test("Sum of accepted part ratings is calculated", () => {
  assertEquals(
    totalRatingOfAcceptedParts({
      parts: EXAMPLE_PARTS,
      workflows: EXAMPLE_WORKFLOWS,
    }),
    19114,
  );
});

Deno.test("Intervals are split according to threshold", () => {
  const wholeInterval = { start: 4, end: 9 };
  assertEquals(splitInterval(wholeInterval, "<", 3), [
    undefined,
    wholeInterval,
  ]);
  assertEquals(splitInterval(wholeInterval, "<", 4), [
    undefined,
    wholeInterval,
  ]);
  assertEquals(splitInterval(wholeInterval, "<", 5), [
    { start: 4, end: 5 },
    { start: 5, end: 9 },
  ]);
  assertEquals(splitInterval(wholeInterval, "<", 8), [
    { start: 4, end: 8 },
    { start: 8, end: 9 },
  ]);
  assertEquals(splitInterval(wholeInterval, "<", 9), [
    wholeInterval,
    undefined,
  ]);
  assertEquals(splitInterval(wholeInterval, "<", 10), [
    wholeInterval,
    undefined,
  ]);
  assertEquals(splitInterval(wholeInterval, ">", 3), [
    wholeInterval,
    undefined,
  ]);
  assertEquals(splitInterval(wholeInterval, ">", 4), [
    { start: 5, end: 9 },
    { start: 4, end: 5 },
  ]);
  assertEquals(splitInterval(wholeInterval, ">", 5), [
    { start: 6, end: 9 },
    { start: 4, end: 6 },
  ]);
  assertEquals(splitInterval(wholeInterval, ">", 8), [
    undefined,
    wholeInterval,
  ]);
  assertEquals(splitInterval(wholeInterval, ">", 9), [
    undefined,
    wholeInterval,
  ]);
  assertEquals(splitInterval(wholeInterval, ">", 10), [
    undefined,
    wholeInterval,
  ]);
});

Deno.test("Number of acceptable part ratings is determined", () => {
  assertEquals(numberOfAcceptableParts(EXAMPLE_WORKFLOWS), 167409079868000);
});
