import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  Brick,
  identifyIndividuallyExpendableBricks,
  numbersOfFallingBricks,
  parseBricks,
  settleBricks,
  SupportNode,
} from "./day22.ts";

const EXAMPLE_INPUT = `1,0,1~1,2,1
0,0,2~2,0,2
0,2,3~2,2,3
0,0,4~0,2,4
2,0,5~2,2,5
0,1,6~2,1,6
1,1,8~1,1,9`;

const EXAMPLE_BRICKS: Brick[] = [
  { origin: [1, 0, 1], axis: 1, extent: 3 },
  { origin: [0, 0, 2], axis: 0, extent: 3 },
  { origin: [0, 2, 3], axis: 0, extent: 3 },
  { origin: [0, 0, 4], axis: 1, extent: 3 },
  { origin: [2, 0, 5], axis: 1, extent: 3 },
  { origin: [0, 1, 6], axis: 0, extent: 3 },
  { origin: [1, 1, 8], axis: 2, extent: 2 },
];

const OVERHANGING_BRICKS: Brick[] = [
  { origin: [3, 0, 2], axis: 0, extent: 1 },
  { origin: [1, 0, 3], axis: 2, extent: 3 },
  { origin: [3, 0, 4], axis: 1, extent: 1 },
  { origin: [1, 0, 7], axis: 0, extent: 3 },
];

const SETTLED_EXAMPLE_BRICKS: Brick[] = [
  { origin: [1, 0, 1], axis: 1, extent: 3 },
  { origin: [0, 0, 2], axis: 0, extent: 3 },
  { origin: [0, 2, 2], axis: 0, extent: 3 },
  { origin: [0, 0, 3], axis: 1, extent: 3 },
  { origin: [2, 0, 3], axis: 1, extent: 3 },
  { origin: [0, 1, 4], axis: 0, extent: 3 },
  { origin: [1, 1, 5], axis: 2, extent: 2 },
];

const SETTLED_OVERHANGING_BRICKS: Brick[] = [
  { origin: [3, 0, 1], axis: 0, extent: 1 },
  { origin: [1, 0, 1], axis: 2, extent: 3 },
  { origin: [3, 0, 2], axis: 1, extent: 1 },
  { origin: [1, 0, 4], axis: 0, extent: 3 },
];

const EXAMPLE_GRAPH: SupportNode[] = [
  { supportedBy: [], supports: [1] },
  { supportedBy: [0], supports: [2, 3] },
  { supportedBy: [1], supports: [4, 5] },
  { supportedBy: [1], supports: [4, 5] },
  { supportedBy: [2, 3], supports: [6] },
  { supportedBy: [2, 3], supports: [6] },
  { supportedBy: [4, 5], supports: [7] },
  { supportedBy: [6], supports: [] },
];

const OVERHANGING_GRAPH: SupportNode[] = [
  { supportedBy: [], supports: [1, 2] },
  { supportedBy: [0], supports: [3] },
  { supportedBy: [0], supports: [4] },
  { supportedBy: [1], supports: [] },
  { supportedBy: [2], supports: [] },
];

Deno.test("Bricks are parsed from example input", () => {
  assertEquals(parseBricks(EXAMPLE_INPUT), EXAMPLE_BRICKS);
});

Deno.test("Single-cube bricks are parsed, picking an arbitrary axis", () => {
  const [brick] = parseBricks("1,2,3~1,2,3");
  assertEquals(brick.origin, [1, 2, 3]);
  assertArrayIncludes([0, 1, 2], [brick.axis]);
  assertEquals(brick.extent, 1);
});

Deno.test("Bricks settle into their resting positions", () => {
  assertEquals(settleBricks(EXAMPLE_BRICKS).stack, SETTLED_EXAMPLE_BRICKS);
  assertEquals(
    settleBricks(OVERHANGING_BRICKS).stack,
    SETTLED_OVERHANGING_BRICKS,
  );
});

Deno.test("Support graph is created", () => {
  assertEquals(settleBricks(EXAMPLE_BRICKS).graph, EXAMPLE_GRAPH);
  assertEquals(settleBricks(OVERHANGING_BRICKS).graph, OVERHANGING_GRAPH);
});

Deno.test("Determine indices of individually expendable bricks", () => {
  assertEquals(
    identifyIndividuallyExpendableBricks(EXAMPLE_GRAPH),
    [2, 3, 4, 5, 7],
  );
  assertEquals(
    identifyIndividuallyExpendableBricks(OVERHANGING_GRAPH),
    [3, 4],
  );
});

Deno.test("For each brick, determine number of falling bricks if that brick was disintegrated", () => {
  assertEquals(
    numbersOfFallingBricks(EXAMPLE_GRAPH),
    [6, 0, 0, 0, 0, 1, 0],
  );
  assertEquals(
    numbersOfFallingBricks(OVERHANGING_GRAPH),
    [1, 1, 0, 0],
  );
});
