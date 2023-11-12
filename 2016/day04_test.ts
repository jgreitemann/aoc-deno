import {
  assert,
  assertEquals,
  assertFalse,
} from "https://deno.land/std@0.201.0/assert/mod.ts";

import soln, {
  decrypt,
  histogram,
  isRealRoom,
  parseRoom,
  Room,
  sectorIdSum,
} from "./day04.ts";

const EXAMPLE_INPUTS = [
  "aaaaa-bbb-z-y-x-123[abxyz]",
  "a-b-c-d-e-f-g-h-987[abcde]",
  "not-a-real-room-404[oarel]",
  "totally-real-room-200[decoy]",
];

const EXAMPLE_ROOMS: Room[] = [
  {
    encryptedNames: ["aaaaa", "bbb", "z", "y", "x"],
    sectorId: 123,
    checksum: "abxyz",
  },
  {
    encryptedNames: ["a", "b", "c", "d", "e", "f", "g", "h"],
    sectorId: 987,
    checksum: "abcde",
  },
  {
    encryptedNames: ["not", "a", "real", "room"],
    sectorId: 404,
    checksum: "oarel",
  },
  {
    encryptedNames: ["totally", "real", "room"],
    sectorId: 200,
    checksum: "decoy",
  },
];

Deno.test("Room strings are parsed correctly", () => {
  assertEquals(parseRoom(EXAMPLE_INPUTS[0]), EXAMPLE_ROOMS[0]);
  assertEquals(parseRoom(EXAMPLE_INPUTS[1]), EXAMPLE_ROOMS[1]);
  assertEquals(parseRoom(EXAMPLE_INPUTS[2]), EXAMPLE_ROOMS[2]);
  assertEquals(parseRoom(EXAMPLE_INPUTS[3]), EXAMPLE_ROOMS[3]);
  assertEquals(soln.parse(EXAMPLE_INPUTS.join("\n")), EXAMPLE_ROOMS);
});

Deno.test("Character frequencies are found in descending order, breaking ties alphabetically", () => {
  assertEquals(
    histogram("notarealroom"),
    new Map([
      ["o", 3],
      ["a", 2],
      ["r", 2],
      ["e", 1],
      ["l", 1],
      ["m", 1],
      ["n", 1],
      ["t", 1],
    ]),
  );
  assertEquals(
    histogram("totallyrealroom"),
    new Map([
      ["l", 3],
      ["o", 3],
      ["a", 2],
      ["r", 2],
      ["t", 2],
      ["e", 1],
      ["m", 1],
      ["y", 1],
    ]),
  );
});

Deno.test("Decoys are identified correctly", () => {
  assert(isRealRoom(EXAMPLE_ROOMS[0]));
  assert(isRealRoom(EXAMPLE_ROOMS[1]));
  assert(isRealRoom(EXAMPLE_ROOMS[2]));
  assertFalse(isRealRoom(EXAMPLE_ROOMS[3]));
});

Deno.test("Sector ID sum is found", () => {
  assertEquals(sectorIdSum(EXAMPLE_ROOMS), 1514);
});

Deno.test("Encrypted words can be decrypted", () => {
  assertEquals(decrypt("qzmt", 343), "very");
  assertEquals(decrypt("zixmtkozy", 343), "encrypted");
  assertEquals(decrypt("ivhz", 343), "name");
});
