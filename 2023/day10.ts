import { Solution } from "../solution.ts";
import { Vector, vectorAdd } from "../utils/vec.ts";

import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";

export default <Solution<string[]>> {
  parse(input: string): string[] {
    return input.split("\n");
  },
  part1(pipes: string[]): number {
    return Math.floor(traceLoop(pipes).length / 2);
  },
};

export type Point = Vector<2>;

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

export function traceLoop(pipes: string[]): Point[] {
  // TODO: Use case for Iter.findMap
  const startRow = pipes.findIndex((row) => row.includes("S"));
  const startCol = pipes[startRow].indexOf("S");
  const start: Point = [startRow, startCol];

  const loop: Point[] = [];
  const loopBuilder = HashSet.builder<Point>();

  let looseEnds = [start];
  for (let distance = 0; looseEnds.length > 0; ++distance) {
    const p = looseEnds.find((p) => !loopBuilder.has(p));
    if (p === undefined) {
      break;
    }

    const tile = pipes.at(p[0])?.at(p[1]);
    if (tile === undefined) {
      break;
    }
    loopBuilder.add(p);
    loop.push(p);
    const connections = CONNECTIONS.get(tile)!;
    looseEnds = connections
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
  }

  return loop;
}
