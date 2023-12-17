import { Solution } from "../solution.ts";
import { range, sum, zip } from "../utils/iter.ts";

export default <Solution<string[][]>> {
  parse(input: string): string[][] {
    return input.split("\n\n").map((p) => p.split("\n"));
  },

  part1(patterns: string[][]): number {
    return sum(patterns.map((p) => findMirrorPlane(p, 0)));
  },

  part2(patterns: string[][]): number {
    return sum(patterns.map((p) => findMirrorPlane(p, 1)));
  },
};

export function findMirrorPlane(pattern: string[], tolerance: number): number {
  return by100(
    findMirrorPlaneWithIndexing(
      pattern,
      pattern.length,
      horizontalIndexing,
      tolerance,
    ),
  ) ??
    findMirrorPlaneWithIndexing(
      pattern,
      pattern[0].length,
      verticalIndexing,
      tolerance,
    ) ??
    (() => {
      throw new Error("No mirror plane found");
    })();
}

function findMirrorPlaneWithIndexing(
  pattern: string[],
  length: number,
  indexingFn: (pattern: string[], idx: number) => Iterable<string>,
  tolerance: number,
): number | undefined {
  return range(1, length)
    .find((idx) => {
      const maxOffset = Math.min(idx, length - idx);
      return sum(
        range(0, maxOffset)
          .map((offset) =>
            smudges(
              indexingFn(pattern, idx - offset - 1),
              indexingFn(pattern, idx + offset),
            )
          ),
      ) === tolerance;
    });
}

function horizontalIndexing(pattern: string[], idx: number): Iterable<string> {
  return pattern[idx];
}

function verticalIndexing(pattern: string[], idx: number): Iterable<string> {
  return pattern.map((r) => r[idx]);
}

function smudges(lhs: Iterable<string>, rhs: Iterable<string>): number {
  return zip(lhs, rhs).filter(([l, r]) => l !== r).count();
}

function by100(x: number | undefined): number | undefined {
  return x !== undefined ? x * 100 : undefined;
}
