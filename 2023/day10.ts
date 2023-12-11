import { Solution } from "../solution.ts";
import { sum, zip } from "../utils/iter.ts";
import { Vector, vectorAdd, vectorSub } from "../utils/vec.ts";

import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";

export default <Solution<string[]>> {
  parse(input: string): string[] {
    return input.split("\n");
  },
  part1(pipes: string[]): number {
    return Math.floor(traceLoop(pipes).length / 2);
  },
  part2(pipes: string[]): number {
    return enclosedPoints(traceLoop(pipes)).length;
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
          (CONNECTIONS.get(tile)?.includes(facing) ?? false);
      })
      .map(({ q }) => q);
  }

  return loop;
}

function* neighbors(p: Point): Generator<Point> {
  yield [p[0] - 1, p[1]];
  yield [p[0], p[1] - 1];
  yield [p[0] + 1, p[1]];
  yield [p[0], p[1] + 1];
}

export function enclosedPoints(loop: Point[]): Point[] {
  const winding = Math.sign(sum(
    zip(loop, [...loop.slice(1), loop[0]])
      .map(([[x1, y1], [x2, y2]]) => (x2 - x1) * (y2 + y1)),
  ));
  const loopSet = HashSet.from(loop);
  let seeds = zip(loop, [...loop.slice(1), loop[0]])
    .flatMap(([from, to]) => {
      const dir = vectorSub<2>(to, from);
      const inside = [winding * dir[1], -winding * dir[0]] as const;
      return [vectorAdd<2>(from, inside), vectorAdd<2>(to, inside)];
    })
    .filter((p) => !loopSet.has(p))
    .collect();

  const interior = HashSet.builder<Point>();
  while (seeds.length > 0) {
    seeds = seeds.flatMap((seed) => {
      if (!loopSet.has(seed) && interior.add(seed)) {
        return [...neighbors(seed)];
      } else {
        return [];
      }
    });
  }

  return interior.build().toArray();
}
