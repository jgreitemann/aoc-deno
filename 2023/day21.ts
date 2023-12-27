import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { Solution } from "../solution.ts";
import { findStart, Point, vectorSub } from "../utils/vec.ts";
import { inBounds, neighbors } from "../utils/topology.ts";
import { iter, sum } from "../utils/iter.ts";

export default <Solution<string[]>> {
  parse(input: string): string[] {
    return input.split("\n");
  },

  part1(map: string[]): number {
    return takeManySteps(64, findStart(map), map, "open").size;
  },

  part2(map: string[]): number {
    return numberOfPossiblePositions(26501365, findStart(map), map);
  },
};

type BoundaryCondition = "open" | "periodic";

function posMod(x: number, length: number): number {
  const mod = x % length;
  return mod < 0 ? mod + length : mod;
}

export function takeStep(
  possiblePositions: Iterable<Point>,
  map: string[],
  bcond: BoundaryCondition,
  prevPositions: HashSet<Point> = HashSet.empty(),
): HashSet<Point> {
  const predicate = bcond === "periodic"
    ? (n: Point) => {
      const row = map[posMod(n[0], map.length)];
      return row[posMod(n[1], row.length)] !== "#";
    }
    : (n: Point) => inBounds(n, map) && map[n[0]][n[1]] !== "#";
  return HashSet.from(
    iter(possiblePositions)
      .flatMap(neighbors)
      .filter(predicate)
      .filter((n) => !prevPositions.has(n)),
  );
}

export function takeManySteps(
  n: number,
  start: Point,
  map: string[],
  bcond: BoundaryCondition,
): HashSet<Point> {
  let prevPrevPossibilities: HashSet<Point> = HashSet.empty();
  let prevPossibilities: HashSet<Point> = HashSet.empty();
  let currentPossibilities: HashSet<Point> = HashSet.of(start);
  for (let i = 0; i < n; ++i) {
    const combinedPossibilities = prevPrevPossibilities.union(
      currentPossibilities,
    );
    prevPrevPossibilities = prevPossibilities;
    currentPossibilities = takeStep(
      currentPossibilities,
      map,
      bcond,
      prevPossibilities,
    );
    prevPossibilities = combinedPossibilities;
  }
  return prevPrevPossibilities.union(currentPossibilities);
}

export function numberOfPossiblePositions(
  n: number,
  start: Point,
  map: string[],
): number {
  const a = map.length;
  let base = 4;
  if (n <= base * a) {
    return takeManySteps(n, start, map, "periodic").size;
  }

  let scale = Math.floor(n / a) - base;
  if (scale % 2 === 1) {
    base += 1;
    scale -= 1;
  }

  const basePositions = takeManySteps(base * a + n % a, start, map, "periodic");
  const supercellCounts = Array(base).fill(0);
  let axisCount = 0;
  let centerCount = 0;
  let crossCount = 0;
  for (const p of basePositions) {
    const abs = vectorSub(p, start).map(Math.abs);
    if (abs[0] < a / 2 && abs[1] < a / 2) {
      centerCount += 1;
    } else if (abs[0] < a / 2 || abs[1] < a / 2) {
      if (abs[0] < 3 * a / 2 && abs[1] < 3 * a / 2) {
        crossCount += 1;
      } else {
        axisCount += 1;
      }
    } else if (abs[1] < 3 * a / 2) {
      supercellCounts[Math.floor((abs[0] - a / 2) / a)] += 1;
    }
  }

  const n_o = (scale + scale % 2 + 1) ** 2;
  const n_x = (scale + (scale + 1) % 2 + 1) ** 2;
  return n_o * centerCount +
    n_x * crossCount / 4 +
    axisCount +
    sum(supercellCounts.map((c, i) => (scale + i + 1) * c));
}
