import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  Brick,
  identifyIndividuallyExpendableBricks,
  parseBricks,
  settleBricks,
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
  assertEquals(settleBricks(EXAMPLE_BRICKS), SETTLED_EXAMPLE_BRICKS);
  assertEquals(settleBricks(OVERHANGING_BRICKS), SETTLED_OVERHANGING_BRICKS);
});

Deno.test("Determine indices of individually expendable bricks", () => {
  assertEquals(
    identifyIndividuallyExpendableBricks(SETTLED_EXAMPLE_BRICKS),
    [1, 2, 3, 4, 6],
  );
  assertEquals(
    identifyIndividuallyExpendableBricks(SETTLED_OVERHANGING_BRICKS),
    [2, 3],
  );
});
