import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  Box,
  calculateHASH,
  carryOutHASHMAP,
  totalFocusingPower,
} from "./day15.ts";
import { zip } from "../utils/iter.ts";

const EXAMPLE_INSTRUCTIONS = [
  "rn=1",
  "cm-",
  "qp=3",
  "cm=2",
  "qp-",
  "pc=4",
  "ot=9",
  "ab=5",
  "pc-",
  "pc=6",
  "ot=7",
];

const EXAMPLE_INSTRUCTION_HASHES = [
  30,
  253,
  97,
  47,
  14,
  180,
  9,
  197,
  48,
  214,
  231,
];

const EXAMPLE_BOXES = [
  new Map([["rn", 1], ["cm", 2]]),
  ,
  ,
  new Map([["ot", 7], ["ab", 5], ["pc", 6]]),
] as Box[];

zip(
  EXAMPLE_INSTRUCTIONS,
  EXAMPLE_INSTRUCTION_HASHES,
).collect().forEach((
  [instruction, hash],
) =>
  Deno.test("Calculate HASH of example words", () => {
    assertEquals(calculateHASH(instruction), hash);
  })
);

Deno.test("Boxes after instructions are carried out", () => {
  assertEquals(
    carryOutHASHMAP(EXAMPLE_INSTRUCTIONS),
    EXAMPLE_BOXES,
  );
});

Deno.test("Focusing power is calculated", () => {
  assertEquals(totalFocusingPower(EXAMPLE_BOXES), 145);
});
