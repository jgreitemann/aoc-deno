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
    return takeManySteps(64, findStart(map), map).size;
  },
};

export function takeStep(
  possiblePositions: Iterable<Point>,
  map: string[],
): HashSet<Point> {
  return HashSet.from(
    iter(possiblePositions)
      .flatMap(neighbors)
      .filter((n) => inBounds(n, map) && map[n[0]][n[1]] !== "#"),
  );
}

export function takeManySteps(
  n: number,
  start: Point,
  map: string[],
): HashSet<Point> {
  let currentPossibilities: HashSet<Point> = HashSet.of(start);
  for (let i = 0; i < n; ++i) {
    currentPossibilities = takeStep(currentPossibilities, map);
  }
  return currentPossibilities;
}
