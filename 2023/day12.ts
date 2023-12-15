import { Solution } from "../solution.ts";
import { iter, product, sum, zip } from "../utils/iter.ts";

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

export function shiftingRunCombinations(
  pattern: string,
  runs: number[],
  standalone = true,
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

    const [run, ...rest] = runs;
    const length = sum(runs) + rest.length;
    let count = 0;
    for (let start = left; start <= right - length; ++start) {
      if (start > 0 && pattern[start - 1] === "#") {
        break;
      }
      if (standalone && pattern.substring(start, start + run).includes(".")) {
        continue;
      }
      if (pattern[start + run] === "#") {
        continue;
      }

      count += combinationsInRange(start + run + 1, right, rest);
    }
    return count;
  }

  return combinationsInRange(0, pattern.length, runs);
}

export function runDistributions(
  groups: string[],
  runs: number[],
): number[][][] {
  const maxRunsByGroup = groups
    .map((group) =>
      iter(group)
        .scan(
          (last, elem) => elem === "?" ? (last === "." ? "#" : ".") : elem,
          ".",
        )
        .collect() // TODO: Use case for Iter.split
        .join("")
        .split(".")
        .filter((s) => s.length > 0).length
    );

  const lengthByGroup = groups.map((group) => group.length);

  function* generateDistributions(
    maxRunsByGroup: number[],
    lengthByGroup: number[],
    runs: number[],
  ): Generator<number[][]> {
    if (sum(maxRunsByGroup) < runs.length) {
      return;
    }
    const [max, ...maxRest] = maxRunsByGroup;
    const [length, ...lengthRest] = lengthByGroup;
    if (maxRest.length === 0) {
      yield [runs];
    } else {
      for (let n = 0; n <= Math.min(max, runs.length); ++n) {
        const slice = runs.slice(0, n);
        if (2 * sum(slice) + slice.length > 2 * length + 1) {
          break;
        }
        for (
          const rest of generateDistributions(
            maxRest,
            lengthRest,
            runs.slice(n),
          )
        ) {
          yield [slice, ...rest];
        }
      }
    }
  }

  return [...generateDistributions(maxRunsByGroup, lengthByGroup, runs)];
}

export function determineCombinations(pattern: string, runs: number[]): number {
  const groups = pattern.split(/\.+/).filter((s) => s.length > 0);

  return sum(
    iter(runDistributions(groups, runs))
      .map((distribution) =>
        product(
          zip(groups, distribution)
            .map(([group, groupRuns]) =>
              shiftingRunCombinations(group, groupRuns, false)
            ),
        )
      ),
  );
}
