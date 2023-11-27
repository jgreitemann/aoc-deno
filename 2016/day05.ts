import { crypto } from "https://deno.land/std@0.207.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.207.0/encoding/hex.ts";

import "../utils/iter.ts";

import { Solution } from "../solution.ts";

export default <Solution<string>> {
  parse(input: string): string {
    return input;
  },

  part1: crackPassword,
};

export function* doorIdSequence(doorId: string): Generator<string> {
  for (let i = 0;; ++i) {
    yield `${doorId}${i}`;
  }
}

export function md5String(input: string): string {
  const encodedInput = new TextEncoder().encode(input);
  const hashBuffer = crypto.subtle.digestSync("MD5", encodedInput);
  return encodeHex(hashBuffer);
}

export function crackPassword(doorId: string): string {
  return doorIdSequence(doorId)
    .iter()
    .map(md5String)
    .filter((hash) => hash.startsWith("00000"))
    .map((hash) => hash[5])
    .take(8)
    .collect()
    .join("");
}
