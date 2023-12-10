import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { vectorAdd, vectorCompare, vectorMul } from "./vec.ts";

Deno.test("vectorCompare compares two vectors for equality", () => {
  const a = [1, 2];
  assertEquals(vectorCompare(a, a), true);
  assertEquals(vectorCompare(a, [1, 2]), true);
  assertEquals(vectorCompare(a, [1, 3]), false);
  assertEquals(vectorCompare(a, [2, 2]), false);
});

Deno.test("vectorAdd adds two vectors together", () => {
  assertEquals(vectorAdd([1, 2], [3, -1]), [4, 1]);
});

Deno.test("vectorMul multiplies a vector with a scalar", () => {
  assertEquals(vectorMul([1, 2], 2), [2, 4]);
  assertEquals(vectorMul([1, 2], 1), [1, 2]);
  assertEquals(vectorMul([1, 2], 0), [0, 0]);
  assertEquals(vectorMul([1, 2], -1), [-1, -2]);
});
