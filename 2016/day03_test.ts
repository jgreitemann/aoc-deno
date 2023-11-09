import { assert } from "https://deno.land/std@0.201.0/assert/mod.ts";
import soln, { isTriangle, rearrangeData } from "./day03.ts";
import { assertEquals } from "https://deno.land/std@0.201.0/assert/assert_equals.ts";
import { assertThrows } from "https://deno.land/std@0.201.0/assert/assert_throws.ts";

Deno.test("Valid triangle is accepted", () => {
  assert(isTriangle(2, 3, 4));
  assert(isTriangle(2, 4, 3));
  assert(isTriangle(4, 3, 2));
  assert(isTriangle(4, 2, 3));
  assert(isTriangle(5, 5, 9.9999999));
  assert(isTriangle(1, 1, 1));
  assert(isTriangle(3, 2, 2));
});

Deno.test("Inalid triangle is rejected", () => {
  assert(!isTriangle(5, 10, 25));
  assert(!isTriangle(6, 3, 2));
  assert(!isTriangle(5, 0, 6));
  assert(!isTriangle(5, 5, 0));
  assert(!isTriangle(2, 3, 5));
  assert(!isTriangle(5, 10, 5));
});

Deno.test("`parse` valid number triplets", () => {
  assertEquals(soln.parse("1 2 3\n 1  2\t3\t\n100  200  300"), [
    [1, 2, 3],
    [1, 2, 3],
    [100, 200, 300],
  ]);
});

Deno.test("`parse` throws for non-numeric input", () => {
  assertThrows(() => soln.parse("1 two 3"));
});

Deno.test("`parse` throws if any line does not contain exactly three numbers", () => {
  assertThrows(() => soln.parse("1 2"));
  assertThrows(() => soln.parse("1 2 3 4"));
  assertThrows(() => soln.parse("1 2 3\n 4 5\n 6 7 8"));
});

Deno.test("Data is rearranged correctly", () => {
  const input: [number, number, number][] = [
    [101, 301, 501],
    [102, 302, 502],
    [103, 303, 503],
    [201, 401, 601],
    [202, 402, 602],
    [203, 403, 603],
  ];
  const output: [number, number, number][] = [
    [101, 102, 103],
    [201, 202, 203],
    [301, 302, 303],
    [401, 402, 403],
    [501, 502, 503],
    [601, 602, 603],
  ];
  assertEquals(rearrangeData(input), output);
});
