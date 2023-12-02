import { Solution } from "../solution.ts";

import { instantiate } from "../lib/aoc_2016_day05_wasm.generated.js";
export const { crackPassword } = await instantiate();

export default <Solution<string>> {
  parse(input: string): string {
    return input;
  },

  part1: crackPassword,
};
