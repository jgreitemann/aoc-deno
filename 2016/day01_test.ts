import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import soln, {
  Direction,
  INITIAL,
  Instruction,
  intersectionPoints,
  move,
  stepWise,
} from "./day01.ts";

Deno.test("`move` carries out rotation instructions", () => {
  assertEquals(
    move({
      orientation: [1, 0],
      position: [-2, 3],
    }, {
      kind: "rotate",
      direction: Direction.L,
    }),
    {
      orientation: [0, 1],
      position: [-2, 3],
    },
  );
  assertEquals(
    move({
      orientation: [0, -1],
      position: [-2, 3],
    }, {
      kind: "rotate",
      direction: Direction.R,
    }),
    {
      orientation: [-1, 0],
      position: [-2, 3],
    },
  );
});

Deno.test("`move` carries out translation instructions", () => {
  assertEquals(
    move({
      orientation: [1, 0],
      position: [-2, 3],
    }, {
      kind: "translate",
      distance: 4,
    }),
    {
      orientation: [1, 0],
      position: [2, 3],
    },
  );
  assertEquals(
    move({
      orientation: [0, -1],
      position: [-2, 3],
    }, {
      kind: "translate",
      distance: 4,
    }),
    {
      orientation: [0, -1],
      position: [-2, -1],
    },
  );
});

Deno.test("Part 1 examples", () => {
  assertEquals(soln.part1?.(soln.parse("R2, L3")), "5");
  assertEquals(soln.part1?.(soln.parse("R2, R2, R2")), "2");
  assertEquals(soln.part1?.(soln.parse("R5, L5, R5, R3")), "12");
});

Deno.test("`stepwise` leaves rotation instructions unaltered", () => {
  assertEquals([...stepWise({
    kind: "rotate",
    direction: Direction.L,
  })], [
    {
      kind: "rotate",
      direction: Direction.L,
    },
  ]);
  assertEquals([...stepWise({
    kind: "rotate",
    direction: Direction.R,
  })], [
    {
      kind: "rotate",
      direction: Direction.R,
    },
  ]);
});

Deno.test("`stepwise` decomposes translation instruction into unit steps", () => {
  assertEquals(
    [...stepWise({
      kind: "translate",
      distance: 0,
    })],
    [],
  );
  assertEquals(
    [...stepWise({
      kind: "translate",
      distance: 1,
    })],
    [
      {
        kind: "translate",
        distance: 1,
      },
    ],
  );
  assertEquals(
    [...stepWise({
      kind: "translate",
      distance: 3,
    })],
    Array(3).fill(
      {
        kind: "translate",
        distance: 1,
      },
    ),
  );
});

Deno.test("`stepWise` does not mutate the input translation instruction", () => {
  const instruction: Instruction = {
    kind: "translate",
    distance: 3,
  };
  const _steps = [...stepWise(instruction)];
  assertEquals(instruction, {
    kind: "translate",
    distance: 3,
  });
});

Deno.test("`flatMap(stepWise)` produces the intended sequence of instructions", () => {
  assertEquals(
    [...soln.parse("R3").iter().flatMap(stepWise)],
    [
      {
        kind: "rotate",
        direction: Direction.R,
      },
      {
        kind: "translate",
        distance: 1,
      },
      {
        kind: "translate",
        distance: 1,
      },
      {
        kind: "translate",
        distance: 1,
      },
    ],
  );
});

Deno.test("Final position is the same, with or without applying `stepWise`", () => {
  const instructions = soln.parse("R8, R4, R4, R8");
  assertEquals(
    instructions.iter().flatMap(stepWise).fold(move, INITIAL),
    instructions.iter().fold(move, INITIAL),
  );
});

Deno.test("Part 2 example intersection point is found", () => {
  assertEquals(
    [...intersectionPoints(soln.parse("R8, R4, R4, R8"))],
    [[4, 0]],
  );
});
