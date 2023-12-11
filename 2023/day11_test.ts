import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  distanceBetweenStars,
  expand,
  parseUniverse,
  Universe,
} from "./day11.ts";

const EXAMPLE_INPUT = `...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`;

const EXAMPLE_UNIVERSE: Universe = {
  dimensions: [10, 10],
  stars: [
    [0, 3],
    [1, 7],
    [2, 0],
    [4, 6],
    [5, 1],
    [6, 9],
    [8, 7],
    [9, 0],
    [9, 4],
  ],
};

const EXPANDED_INPUT = `....#........
.........#...
#............
.............
.............
........#....
.#...........
............#
.............
.............
.........#...
#....#.......`;

const EXPANDED_UNIVERSE: Universe = {
  dimensions: [12, 13],
  stars: [
    [0, 4],
    [1, 9],
    [2, 0],
    [5, 8],
    [6, 1],
    [7, 12],
    [10, 9],
    [11, 0],
    [11, 5],
  ],
};

Deno.test("Universe can be parsed from input", () => {
  assertEquals(parseUniverse(EXAMPLE_INPUT), EXAMPLE_UNIVERSE);
  assertEquals(parseUniverse(EXPANDED_INPUT), EXPANDED_UNIVERSE);
});

Deno.test("Universe expands", () => {
  assertEquals(expand(EXAMPLE_UNIVERSE, 2), EXPANDED_UNIVERSE);
});

Deno.test("Distance between stars is calculated", () => {
  assertEquals(distanceBetweenStars(EXPANDED_UNIVERSE), 374);
});

Deno.test("Distance between stars for larger expansion rates", () => {
  assertEquals(distanceBetweenStars(expand(EXAMPLE_UNIVERSE, 10)), 1030);
  assertEquals(distanceBetweenStars(expand(EXAMPLE_UNIVERSE, 100)), 8410);
});
