import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";

import soln, { demangle, demangleWithWords } from "./day01.ts";

Deno.test("Calibration values can be demangled", () => {
  assertEquals(demangle("1abc2"), 12);
  assertEquals(demangle("pqr3stu8vwx"), 38);
  assertEquals(demangle("a1b2c3d4e5f"), 15);
  assertEquals(demangle("treb7uchet"), 77);
});

Deno.test("Demangling with words also works", () => {
  assertEquals(demangleWithWords("two1nine"), 29);
  assertEquals(demangleWithWords("eightwothree"), 83);
  assertEquals(demangleWithWords("abcone2threexyz"), 13);
  assertEquals(demangleWithWords("xtwone3four"), 24);
  assertEquals(demangleWithWords("4nineeightseven2"), 42);
  assertEquals(demangleWithWords("zoneight234"), 14);
  assertEquals(demangleWithWords("7pqrstsixteen"), 76);

  // overlapping number words still work!
  assertEquals(demangleWithWords("twone"), 21);
});

Deno.test("The sum is found correctly", () => {
  assertEquals(
    soln.part1!([
      "1abc2",
      "pqr3stu8vwx",
      "a1b2c3d4e5f",
      "treb7uchet",
    ]),
    142,
  );
  assertEquals(
    soln.part2!([
      "two1nine",
      "eightwothree",
      "abcone2threexyz",
      "xtwone3four",
      "4nineeightseven2",
      "zoneight234",
      "7pqrstsixteen",
    ]),
    281,
  );
});
