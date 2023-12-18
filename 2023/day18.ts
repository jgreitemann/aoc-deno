import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { Solution } from "../solution.ts";
import { Direction, Unit, Vector, vectorAdd } from "../utils/vec.ts";
import { iter, repeat } from "../utils/iter.ts";
import { enclosedPoints } from "../utils/topology.ts";

export default <Solution<Step[]>> {
  parse: parseSteps,

  part1(steps: Step[]): number {
    return lagoon(steps).size;
  },
};

export type Step = {
  direction: Direction;
  stride: number;
};

const DirMap: Record<string, Direction> = {
  U: "NORTH",
  L: "WEST",
  D: "SOUTH",
  R: "EAST",
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

export function followSteps(steps: Step[]): Readonly<Vector<2>>[] {
  return iter(steps)
    .flatMap(({ direction, stride }) => repeat(Unit[direction], stride))
    .scan(vectorAdd<2>, [0, 0] as Readonly<Vector<2>>)
    .collect();
}

export function lagoon(steps: Step[]): HashSet<Readonly<Vector<2>>> {
  const loop = followSteps(steps);
  const loopSet = HashSet.from(loop);
  const interior = enclosedPoints(loop);
  return loopSet.union(interior);
}
