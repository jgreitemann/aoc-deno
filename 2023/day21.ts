import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { Solution } from "../solution.ts";
import { findStart, Point } from "../utils/vec.ts";
import { inBounds, neighbors } from "../utils/topology.ts";
import { iter } from "../utils/iter.ts";

export default <Solution<string[]>> {
  parse(input: string): string[] {
    return input.split("\n");
  },

  part1(map: string[]): number {
    return takeManySteps(64, findStart(map), map, "open").size;
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
