import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";

import { crackPassword, doorIdSequence, md5String } from "./day05.ts";

import "../utils/iter.ts";

Deno.test("The sequence of unhashed door IDs is produced", () => {
  assertEquals(doorIdSequence("abc").iter().take(13).collect(), [
    "abc0",
    "abc1",
    "abc2",
    "abc3",
    "abc4",
    "abc5",
    "abc6",
    "abc7",
    "abc8",
    "abc9",
    "abc10",
    "abc11",
    "abc12",
  ]);
});

Deno.test("MD5 hashes can be formed as hex strings", () => {
  assertEquals(md5String("abc3231929"), "00000155f8105dff7f56ee10fa9b9abd");
});

Deno.test("Password can be brute-forced", () => {
  assertEquals(crackPassword("abc"), "18f47a30");
});
