import { Solution } from "../solution.ts";
import { iter, sum } from "../utils/iter.ts";

export default <Solution<Report[]>> {
  parse: parseReports,
  part1(reports: Report[]): number {
    return sum(reports.map(({ pattern, runs }) => combinations(pattern, runs)));
  },
};

export type Report = {
  pattern: string;
  runs: number[];
};

export function parseReports(input: string): Report[] {
  return input.split("\n").map((line) => {
    const [pattern, runsStr] = line.split(" ");
    const runs = runsStr.split(",").map((r) => +r);
    return { pattern, runs };
  });
}

function applyPattern(pattern: string, replacements: string[]): string {
  return replacements.reduce(
    (pattern, replacement) => pattern.replace("?", replacement),
    pattern,
  );
}

function* arrangements(n: number, k: number): Generator<string[]> {
  if (n < k || k < 0) {
    return;
  } else if (n === k) {
    yield Array(n).fill("#");
  } else if (k === 0) {
    yield Array(n).fill(".");
  } else {
    for (const a of arrangements(n - 1, k)) {
      yield [".", ...a];
    }
    for (const a of arrangements(n - 1, k - 1)) {
      yield ["#", ...a];
    }
  }
}

function isCompatible(pattern: string, runs: number[]): boolean {
  const tokens = pattern.split(/\.+/).map((s) => s.length).filter((l) => l > 0);
  if (tokens.length !== runs.length) {
    return false;
  }
  return tokens.every((t, i) => t === runs[i]);
}

export function bruteForceCombinations(
  pattern: string,
  runs: number[],
): number {
  const hashes = pattern.split("").filter((c) => c === "#").length;
  const blanks = pattern.split("").filter((c) => c === "?").length;
  return iter(arrangements(blanks, sum(runs) - hashes))
    .map((replacements) => applyPattern(pattern, replacements))
    .filter((p) => isCompatible(p, runs))
    .count();
}

export function combinations(pattern: string, runs: number[]): number {
  return bruteForceCombinations(pattern, runs);
}
