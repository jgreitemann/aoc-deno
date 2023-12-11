import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { enclosedPoints, Point, traceLoop } from "./day10.ts";

const SIMPLE_EXAMPLE_PIPES = [
  "-L|F7",
  "7S-7|",
  "L|7||",
  "-L-J|",
  "L|-JF",
];

const SIMPLE_LOOP_POINTS: Point[] = [
  [1, 1],
  [2, 1],
  [3, 1],
  [3, 2],
  [3, 3],
  [2, 3],
  [1, 3],
  [1, 2],
];

const COMPLEX_EXAMPLE_PIPES = [
  "..F7.",
  ".FJ|.",
  "SJ.L7",
  "|F--J",
  "LJ...",
];

const COMPLEX_LOOP_POINTS: Point[] = [
  [2, 0],
  [3, 0],
  [4, 0],
  [4, 1],
  [3, 1],
  [3, 2],
  [3, 3],
  [3, 4],
  [2, 4],
  [2, 3],
  [1, 3],
  [0, 3],
  [0, 2],
  [1, 2],
  [1, 1],
  [2, 1],
];

const PIPE_INTERIOR_GAP = [
  "...........",
  ".S-------7.",
  ".|F-----7|.",
  ".||.....||.",
  ".||.....||.",
  ".|L-7.F-J|.",
  ".|II|.|II|.",
  ".L--J.L--J.",
  "...........",
];

const PIPE_INTERIOR_NO_GAP = [
  "..........",
  ".S------7.",
  ".|F----7|.",
  ".||OOOO||.",
  ".||OOOO||.",
  ".|L-7F-J|.",
  ".|II||II|.",
  ".L--JL--J.",
  "..........",
];

const PIPE_INTERIOR_BULK = [
  "..........",
  ".F------7.",
  ".|IIIIII|.",
  ".SIIIIII|.",
  ".|IIIIII|.",
  ".L------J.",
  "..........",
];

const MESSY_PIPE_INTERIOR = [
  "FF7FSF7F7F7F7F7F---7",
  "L|LJ||||||||||||F--J",
  "FL-7LJLJ||||||LJL-77",
  "F--JF--7||LJLJIF7FJ-",
  "L---JF-JLJIIIIFJLJJ7",
  "|F|F-JF---7IIIL7L|7|",
  "|FFJF7L7F-JF7IIL---7",
  "7-L-JL7||F7|L7F-7F7|",
  "L.L7LFJ|||||FJL7||LJ",
  "L7JLJL-JLJLJL--JLJ.L",
];

function interiorPoints(input: string[]): Point[] {
  return input
    .flatMap((line, row) =>
      line.split("")
        .flatMap((c, col) => c === "I" ? [[row, col] as Point] : [])
    )
    .sort();
}

Deno.test("Simple loop path is traced out and annotated with distance from start", () => {
  assertEquals(traceLoop(SIMPLE_EXAMPLE_PIPES), SIMPLE_LOOP_POINTS);
});

Deno.test("Complex loop path is traced out and annotated with distance from start", () => {
  assertEquals(traceLoop(COMPLEX_EXAMPLE_PIPES), COMPLEX_LOOP_POINTS);
});

Deno.test("Point enclosed by the loop are identified", () => {
  assertEquals(enclosedPoints(SIMPLE_LOOP_POINTS), [[2, 2]]);
  assertEquals(enclosedPoints(COMPLEX_LOOP_POINTS), [[2, 2]]);
  assertEquals(
    enclosedPoints(traceLoop(PIPE_INTERIOR_GAP)).sort(),
    interiorPoints(PIPE_INTERIOR_GAP),
  );
  assertEquals(
    enclosedPoints(traceLoop(PIPE_INTERIOR_NO_GAP)).sort(),
    interiorPoints(PIPE_INTERIOR_NO_GAP),
  );
  assertEquals(
    enclosedPoints(traceLoop(PIPE_INTERIOR_BULK)).sort(),
    interiorPoints(PIPE_INTERIOR_BULK),
  );
  assertEquals(
    enclosedPoints(traceLoop(MESSY_PIPE_INTERIOR)).sort(),
    interiorPoints(MESSY_PIPE_INTERIOR),
  );
});
