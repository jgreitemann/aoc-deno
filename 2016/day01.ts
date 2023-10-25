import { Solution } from "../solution.ts";
import "../utils/iter.ts";
import { Iter } from "../utils/iter.ts";
import { Vector, vectorCompare } from "../utils/vec.ts";

export default <Solution<Instruction[]>> {
  parse(input: string): Instruction[] {
    return input
      .split(", ")
      .flatMap(([direction, ...digits]): [Rotate, Translate] => [
        { kind: "rotate", direction: toDirection(direction) },
        { kind: "translate", distance: +digits.join("") },
      ]);
  },

  part1(instructions: Instruction[]): string {
    const end = instructions
      .iter()
      .fold(move, INITIAL);
    return normL1(end.position).toString();
  },

  part2(instructions: Instruction[]): string {
    const hq = intersectionPoints(instructions).first();
    if (hq === undefined) {
      throw new Error("Path does not intersect with itself");
    }
    return normL1(hq).toString();
  },
};

export enum Direction {
  L,
  R,
}

type Rotate = {
  kind: "rotate";
  direction: Direction;
};

type Translate = {
  kind: "translate";
  distance: number;
};

export type Instruction = Rotate | Translate;

type State = {
  orientation: Vector<2>;
  position: Vector<2>;
};

export const INITIAL: State = {
  orientation: [0, 1],
  position: [0, 0],
};

function toDirection(dir: string): Direction {
  if (dir in Direction) {
    return Direction[dir as keyof typeof Direction];
  } else {
    throw new Error(`Invalid direction input: ${dir}`);
  }
}

function rotate(
  [x, y]: Vector<2>,
  direction: Direction,
): Vector<2> {
  switch (direction) {
    case Direction.L:
      return [-y, x];
    case Direction.R:
      return [y, -x];
    default: {
      const _checkExhaustive: never = direction;
      throw new Error(`Invalid direction value: ${direction}`);
    }
  }
}

export function move(
  { orientation, position }: State,
  instruction: Instruction,
): State {
  if (instruction.kind === "rotate") {
    return {
      orientation: rotate(orientation, instruction.direction),
      position,
    };
  } else {
    return {
      orientation,
      position: [
        position[0] + instruction.distance * orientation[0],
        position[1] + instruction.distance * orientation[1],
      ],
    };
  }
}

function normL1([x, y]: Vector<2>): number {
  return Math.abs(x) + Math.abs(y);
}

export function* stepWise(instruction: Instruction): Generator<Instruction> {
  if (instruction.kind === "translate") {
    let distance = instruction.distance;
    while (distance > 0) {
      yield { kind: "translate", distance: 1 };
      distance -= 1;
    }
  } else {
    yield instruction;
  }
}

export function intersectionPoints(
  instructions: Iterable<Instruction>,
): Iter<Vector<2>> {
  return instructions
    .iter()
    .flatMap(stepWise)
    .scan(move, INITIAL)
    .map((state) => state.position)
    .dedup()
    .duplicates(vectorCompare);
}
