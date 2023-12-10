import { Solution } from "../solution.ts";
import { Vector, vectorAdd } from "../utils/vec.ts";

import { Hasher, HashMap } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";

export default <Solution<string[]>> {
  parse(input: string): string[] {
    return input.split("\n");
  },
  part1(pipes: string[]): number {
    return traceLoop(pipes).streamValues().max() ?? -1;
  },
};

export type Point = Vector<2>;

const FlatHashMap = HashMap.createContext({
  hasher: Hasher.anyFlatHasher(),
});

const NORTH = [-1, 0] as const;
const WEST = [0, -1] as const;
const SOUTH = [1, 0] as const;
const EAST = [0, 1] as const;

type Direction = typeof NORTH | typeof WEST | typeof SOUTH | typeof EAST;

const CONNECTIONS: ReadonlyMap<string, readonly Direction[]> = new Map([
  ["|", [NORTH, SOUTH]],
  ["-", [WEST, EAST]],
  ["L", [NORTH, EAST]],
  ["J", [NORTH, WEST]],
  ["7", [WEST, SOUTH]],
  ["F", [SOUTH, EAST]],
  [".", []],
  ["S", [NORTH, WEST, SOUTH, EAST]],
]);

function invert(direction: Direction): Direction {
  switch (direction) {
    case NORTH:
      return SOUTH;
    case SOUTH:
      return NORTH;
    case WEST:
      return EAST;
    case EAST:
      return WEST;
  }
  throw new Error("unreachable");
}

export function traceLoop(pipes: string[]): HashMap<Point, number> {
  // TODO: Use case for Iter.findMap
  const startRow = pipes.findIndex((row) => row.includes("S"));
  const startCol = pipes[startRow].indexOf("S");
  const start: Point = [startRow, startCol];

  const loopBuilder = FlatHashMap.builder<Point, number>();

  let looseEnds = [start];
  for (let distance = 0; looseEnds.length > 0; ++distance) {
    looseEnds = looseEnds.flatMap((p) => {
      if (loopBuilder.hasKey(p)) {
        return [];
      }

      const tile = pipes.at(p[0])?.at(p[1]);
      if (tile === undefined) {
        return [];
      }
      loopBuilder.set(p, distance);
      const connections = CONNECTIONS.get(tile)!;
      return connections
        .map((dir) => ({
          q: vectorAdd<2>(p, dir),
          facing: invert(dir),
        }))
        .filter(({ q, facing }) => {
          const tile = pipes.at(q[0])?.at(q[1]);
          return tile !== undefined &&
            CONNECTIONS.get(tile)!.includes(facing);
        })
        .map(({ q }) => q);
    });
  }

  return loopBuilder.build();
}
