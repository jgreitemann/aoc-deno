import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  minHeatLoss,
  NormalCrucibleRules,
  UltraCrucibleRules,
} from "./day17.ts";

const EXAMPLE_MAP = [
  [2, 4, 1, 3, 4, 3, 2, 3, 1, 1, 3, 2, 3],
  [3, 2, 1, 5, 4, 5, 3, 5, 3, 5, 6, 2, 3],
  [3, 2, 5, 5, 2, 4, 5, 6, 5, 4, 2, 5, 4],
  [3, 4, 4, 6, 5, 8, 5, 8, 4, 5, 4, 5, 2],
  [4, 5, 4, 6, 6, 5, 7, 8, 6, 7, 5, 3, 6],
  [1, 4, 3, 8, 5, 9, 8, 7, 9, 8, 4, 5, 4],
  [4, 4, 5, 7, 8, 7, 6, 9, 8, 7, 7, 6, 6],
  [3, 6, 3, 7, 8, 7, 7, 9, 7, 9, 6, 5, 3],
  [4, 6, 5, 4, 9, 6, 7, 9, 8, 6, 8, 8, 7],
  [4, 5, 6, 4, 6, 7, 9, 9, 8, 6, 4, 5, 3],
  [1, 2, 2, 4, 6, 8, 6, 8, 6, 5, 5, 6, 3],
  [2, 5, 4, 6, 5, 4, 8, 8, 8, 7, 7, 3, 5],
  [4, 3, 2, 2, 6, 7, 4, 6, 5, 5, 5, 3, 3],
];

const ULTRA_BAD_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 1],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 1],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 1],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 1],
];

Deno.test("Heat loss is minimized with normal crucibles", () => {
  assertEquals(minHeatLoss(NormalCrucibleRules)(EXAMPLE_MAP), 102);
});

Deno.test("Heat loss is minimized with ultra crucibles", () => {
  assertEquals(minHeatLoss(UltraCrucibleRules)(EXAMPLE_MAP), 94);
});

Deno.test("Heat loss is minimized with ultra crucibles on unfortunate map", () => {
  assertEquals(minHeatLoss(UltraCrucibleRules)(ULTRA_BAD_MAP), 71);
});
