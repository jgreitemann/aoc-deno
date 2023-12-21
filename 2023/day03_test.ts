import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";

import {
  gearRatios,
  parseSchematic,
  partNumbers,
  Schematic,
  surroundingPoints,
} from "./day03.ts";

const EXAMPLE_INPUT = `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`;

const EXAMPLE_SCHEMATIC: Schematic = {
  numbers: new Map([
    [[0, 0], "467"],
    [[0, 5], "114"],
    [[2, 2], "35"],
    [[2, 6], "633"],
    [[4, 0], "617"],
    [[5, 7], "58"],
    [[6, 2], "592"],
    [[7, 6], "755"],
    [[9, 1], "664"],
    [[9, 5], "598"],
  ]),
  symbols: new Map([
    [[1, 3], "*"],
    [[3, 6], "#"],
    [[4, 3], "*"],
    [[5, 5], "+"],
    [[8, 3], "$"],
    [[8, 5], "*"],
  ]),
};

Deno.test("Schematic is parsed for example input", () => {
  assertEquals(parseSchematic(EXAMPLE_INPUT), EXAMPLE_SCHEMATIC);
});

Deno.test("Surrounding points can be iterated", () => {
  assertEquals(
    [...surroundingPoints([3, 7])].sort(),
    [
      [2, 6] as const,
      [2, 7] as const,
      [2, 8] as const,
      [3, 8] as const,
      [4, 8] as const,
      [4, 7] as const,
      [4, 6] as const,
      [3, 6] as const,
    ].sort(),
  );

  assertEquals(
    [...surroundingPoints([3, 7], 3)].sort(),
    [
      [2, 6] as const,
      [2, 7] as const,
      [2, 8] as const,
      [2, 9] as const,
      [2, 10] as const,
      [3, 10] as const,
      [4, 10] as const,
      [4, 9] as const,
      [4, 8] as const,
      [4, 7] as const,
      [4, 6] as const,
      [3, 6] as const,
    ].sort(),
  );
});

Deno.test("Valid part numbers are correctly identified", () => {
  assertEquals(
    partNumbers(EXAMPLE_SCHEMATIC).sort(),
    [
      467,
      35,
      633,
      617,
      592,
      755,
      664,
      598,
    ].sort(),
  );
});

Deno.test("Gear ratios are found", () => {
  assertEquals(gearRatios(EXAMPLE_SCHEMATIC).sort(), [16345, 451490]);
});
