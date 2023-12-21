import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { Solution } from "../solution.ts";
import { Direction, Point, Unit, vectorAdd, vectorMul } from "../utils/vec.ts";
import { iter, repeat, sum, zip } from "../utils/iter.ts";
import { enclosedPoints } from "../utils/topology.ts";

export default <Solution<string>> {
  parse: (input) => input,

  part1(input: string): number {
    return lagoon(followSteps(parseSteps(input))).size;
  },

  part2(input: string): number {
    return findRealLagoonArea(parseColorSteps(input));
  },
};

export type Step = {
  direction: Direction;
  stride: number;
};

const DirMap: Record<string, Direction> = {
  R: "EAST",
  D: "SOUTH",
  L: "WEST",
  U: "NORTH",
};

export function parseSteps(input: string): Step[] {
  return input.split("\n")
    .map((line) => {
      const [_, dir, strideStr] = line.match(
        /^([ULDR]) (\d+) \(#[0-9a-f]{6}\)$/,
      )!;
      return {
        direction: DirMap[dir],
        stride: +strideStr,
      };
    });
}

export function parseColorSteps(input: string): Step[] {
  const dirArray = [...Object.values(DirMap)];
  return [...input.matchAll(/#([0-9a-f]{5})([0-9a-f])/g)]
    .map(([_, hexStride, hexDir]) => ({
      direction: dirArray[+hexDir],
      stride: parseInt(hexStride, 16),
    }));
}

export function followSteps(
  steps: Step[],
  start: Point = [0, 0],
): Point[] {
  return iter(steps)
    .flatMap(({ direction, stride }) => repeat(Unit[direction], stride))
    .scan(vectorAdd<2>, start)
    .collect();
}

export function lagoon(
  loop: Point[],
): HashSet<Point> {
  const loopSet = HashSet.from(loop);
  const interior = enclosedPoints(loop);
  return loopSet.union(interior);
}

export type Distortion = {
  start: Point;
  distortedSteps: Step[];
  rowScaling: number[];
  colScaling: number[];
};

export function distortSteps(steps: Step[]): Distortion {
  const vertices = [
    [0, 0] as const,
    ...iter(steps)
      .map(({ direction, stride }) => vectorMul<2>(Unit[direction], stride))
      .scan(
        (current, delta) => vectorAdd<2>(current, delta),
        [0, 0] as Point,
      ),
  ];

  const rowMapping = iter(
    vertices
      .map(([row, _]) => row)
      .sort((lhs, rhs) => lhs - rhs),
  )
    .dedup()
    .collect();
  const colMapping = iter(
    vertices
      .map(([_, col]) => col)
      .sort((lhs, rhs) => lhs - rhs),
  )
    .dedup()
    .collect();

  const distortedVertices = vertices
    .map(([row, col]) => [rowMapping.indexOf(row), colMapping.indexOf(col)]);

  return {
    start: [2 * rowMapping.indexOf(0), 2 * colMapping.indexOf(0)],
    distortedSteps: zip(steps, iter(distortedVertices).windows(2))
      .map(([step, [from, to]]) => ({
        direction: step.direction,
        stride: 2 * (Math.abs(to[0] - from[0]) + Math.abs(to[1] - from[1])),
      }))
      .collect(),
    rowScaling: [
      1,
      ...iter(rowMapping).windows(2).flatMap(([l, r]) => [r - l - 1, 1]),
    ],
    colScaling: [
      1,
      ...iter(colMapping).windows(2).flatMap(([l, r]) => [r - l - 1, 1]),
    ],
  };
}

export function findRealLagoonArea(steps: Step[]): number {
  const { start, distortedSteps, rowScaling, colScaling } = distortSteps(steps);
  const distortedLagoon = lagoon(followSteps(distortedSteps, start));

  return sum(
    distortedLagoon.stream()
      .map(([row, col]) => rowScaling[row] * colScaling[col]),
  );
}
