import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { Platform } from "./day14.ts";

const EXAMPLE_INPUT = `O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`;

const EXAMPLE_MAP = [
  "O....#....",
  "O.OO#....#",
  ".....##...",
  "OO.#O....O",
  ".O.....O#.",
  "O.#..O.#.#",
  "..O..#O..O",
  ".......O..",
  "#....###..",
  "#OO..#....",
];

const EXAMPLE_MAP_TILTED = [
  "OOOO.#.O..",
  "OO..#....#",
  "OO..O##..O",
  "O..#.OO...",
  "........#.",
  "..#....#.#",
  "..O..#.O.O",
  "..O.......",
  "#....###..",
  "#....#....",
];

Deno.test("Example input is parsed", () => {
  assertEquals(new Platform(EXAMPLE_INPUT).joined(), EXAMPLE_MAP);
});

Deno.test("Example tilted north", () => {
  const platform = new Platform(EXAMPLE_INPUT);
  platform.tilt("NORTH");
  assertEquals(platform.joined(), EXAMPLE_MAP_TILTED);
});

Deno.test("Total load after tilting north", () => {
  const platform = new Platform(EXAMPLE_INPUT);
  platform.tilt("NORTH");
  assertEquals(platform.load(), 136);
});

Deno.test("Total load after a billion spin cycles", () => {
  const platform = new Platform(EXAMPLE_INPUT);
  platform.spin(1000000000);
  assertEquals(platform.load(), 64);
});
