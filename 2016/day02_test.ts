import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import {
  COMPLEX_KEYPAD,
  Direction,
  executeSequence,
  findBathroomCode,
  SIMPLE_KEYPAD,
} from "./day02.ts";

const EXAMPLE_SEQUENCES = [
  [Direction.U, Direction.L, Direction.L],
  [Direction.R, Direction.R, Direction.D, Direction.D, Direction.D],
  [Direction.L, Direction.U, Direction.R, Direction.D, Direction.L],
  [Direction.U, Direction.U, Direction.U, Direction.U, Direction.D],
];

Deno.test("`executeSequence` on individual example sequences", () => {
  const x = executeSequence(SIMPLE_KEYPAD);
  assertEquals(x(5, EXAMPLE_SEQUENCES[0]), 1);
  assertEquals(x(1, EXAMPLE_SEQUENCES[1]), 9);
  assertEquals(x(9, EXAMPLE_SEQUENCES[2]), 8);
  assertEquals(x(8, EXAMPLE_SEQUENCES[3]), 5);
});

Deno.test("`findBathroomCode` for example document", () => {
  assertEquals(findBathroomCode(SIMPLE_KEYPAD, 5)(EXAMPLE_SEQUENCES), "1985");
  assertEquals(findBathroomCode(COMPLEX_KEYPAD, 5)(EXAMPLE_SEQUENCES), "5DB3");
});
