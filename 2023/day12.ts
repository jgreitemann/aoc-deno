import { Hasher, HashMap } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { Solution } from "../solution.ts";
import { sum } from "../utils/iter.ts";

export default <Solution<Report[]>> {
  parse: parseReports,
  part1(reports: Report[]): number {
    return sum(
      reports.map(({ pattern, runs }) => determineCombinations(pattern, runs)),
    );
  },
  part2(reports: Report[]): number {
    return sum(
      reports.map((report) => {
        const { pattern, runs } = unfold(report);
        return determineCombinations(pattern, runs);
      }),
    );
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

export function unfold(report: Report, repetitions = 5): Report {
  return {
    pattern: Array(repetitions).fill(report.pattern).join("?"),
    runs: Array(repetitions).fill(report.runs).flat(),
  };
}

function shiftingRunCombinations(
  pattern: string,
  runs: number[],
  cache = FlatHashMap.builder<Report, number>(),
): number {
  function combinationsInRange(
    left: number,
    right: number,
    runs: number[],
  ): number {
    if (runs.length === 0) {
      for (let i = left; i < right; ++i) {
        if (pattern[i] === "#") {
          return 0;
        }
      }
      return 1;
    }

    const subpattern = pattern.substring(left, right);
    const cached = cache.get({ pattern: subpattern, runs });
    if (cached !== undefined) {
      return cached;
    }

    const [run, ...rest] = runs;
    const length = sum(runs) + rest.length;
    let count = 0;
    for (let start = left; start <= right - length; ++start) {
      if (start > 0 && pattern[start - 1] === "#") {
        break;
      }
      if (pattern.substring(start, start + run).includes(".")) {
        continue;
      }
      if (pattern[start + run] === "#") {
        continue;
      }

      count += combinationsInRange(start + run + 1, right, rest);
    }

    cache.set({ pattern: subpattern, runs }, count);

    return count;
  }

  return combinationsInRange(0, pattern.length, runs);
}

const FlatHashMap = HashMap.createContext({
  hasher: Hasher.anyFlatHasher(),
});

export function determineCombinations(
  pattern: string,
  runs: number[],
): number {
  const cache = FlatHashMap.builder<Report, number>();
  return shiftingRunCombinations(pattern, runs, cache);
}
