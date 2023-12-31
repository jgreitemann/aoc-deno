import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { energizedTiles, mostEnergizedTiles, Tile } from "./day16.ts";
import { Point } from "../utils/vec.ts";

const EXAMPLE_MAP: Tile[][] = [
  ".|...\\....".split("") as Tile[],
  "|.-.\\.....".split("") as Tile[],
  ".....|-...".split("") as Tile[],
  "........|.".split("") as Tile[],
  "..........".split("") as Tile[],
  ".........\\".split("") as Tile[],
  "..../.\\\\..".split("") as Tile[],
  ".-.-/..|..".split("") as Tile[],
  ".|....-|.\\".split("") as Tile[],
  "..//.|....".split("") as Tile[],
];

const EXAMPLE_ENERGIZED = `######....
.#...#....
.#...#####
.#...##...
.#...##...
.#...##...
.#..####..
########..
.#######..
.#...#.#..`;

function render(
  energized: Iterable<Point>,
  map: Tile[][],
): string {
  const rendering = map.map((row) => row.map((_) => "."));
  for (const [row, col] of energized) {
    rendering[row][col] = "#";
  }
  return rendering.map((row) => row.join("")).join("\n");
}

Deno.test("Path of energized tiles is traced out", () => {
  assertEquals(
    render(energizedTiles(EXAMPLE_MAP), EXAMPLE_MAP),
    EXAMPLE_ENERGIZED,
  );
});

Deno.test("Number of energized tiles is maximized", () => {
  assertEquals(mostEnergizedTiles(EXAMPLE_MAP), 51);
});
