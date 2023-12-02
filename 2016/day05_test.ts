import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";

import { crackPassword } from "./day05.ts";

Deno.test("Password can be brute-forced", () => {
  assertEquals(crackPassword("abc"), "18f47a30");
});
