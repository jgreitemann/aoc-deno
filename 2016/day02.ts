import { Solution } from "../solution.ts";
import { iter } from "../utils/iter.ts";

export enum Direction {
  U,
  D,
  L,
  R,
}

type Keypad<K extends number | string> = { [F in K]: { [D in Direction]: K } };

type SimpleKey = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const SIMPLE_KEYPAD: Keypad<SimpleKey> = {
  [1]: {
    [Direction.U]: 1,
    [Direction.D]: 4,
    [Direction.L]: 1,
    [Direction.R]: 2,
  },
  [2]: {
    [Direction.U]: 2,
    [Direction.D]: 5,
    [Direction.L]: 1,
    [Direction.R]: 3,
  },
  [3]: {
    [Direction.U]: 3,
    [Direction.D]: 6,
    [Direction.L]: 2,
    [Direction.R]: 3,
  },
  [4]: {
    [Direction.U]: 1,
    [Direction.D]: 7,
    [Direction.L]: 4,
    [Direction.R]: 5,
  },
  [5]: {
    [Direction.U]: 2,
    [Direction.D]: 8,
    [Direction.L]: 4,
    [Direction.R]: 6,
  },
  [6]: {
    [Direction.U]: 3,
    [Direction.D]: 9,
    [Direction.L]: 5,
    [Direction.R]: 6,
  },
  [7]: {
    [Direction.U]: 4,
    [Direction.D]: 7,
    [Direction.L]: 7,
    [Direction.R]: 8,
  },
  [8]: {
    [Direction.U]: 5,
    [Direction.D]: 8,
    [Direction.L]: 7,
    [Direction.R]: 9,
  },
  [9]: {
    [Direction.U]: 6,
    [Direction.D]: 9,
    [Direction.L]: 8,
    [Direction.R]: 9,
  },
};

type ComplexKey = SimpleKey | "A" | "B" | "C" | "D";
export const COMPLEX_KEYPAD: Keypad<ComplexKey> = {
  1: {
    [Direction.U]: 1,
    [Direction.D]: 3,
    [Direction.L]: 1,
    [Direction.R]: 1,
  },
  2: {
    [Direction.U]: 2,
    [Direction.D]: 6,
    [Direction.L]: 2,
    [Direction.R]: 3,
  },
  3: {
    [Direction.U]: 1,
    [Direction.D]: 7,
    [Direction.L]: 2,
    [Direction.R]: 4,
  },
  4: {
    [Direction.U]: 4,
    [Direction.D]: 8,
    [Direction.L]: 3,
    [Direction.R]: 4,
  },
  5: {
    [Direction.U]: 5,
    [Direction.D]: 5,
    [Direction.L]: 5,
    [Direction.R]: 6,
  },
  6: {
    [Direction.U]: 2,
    [Direction.D]: "A",
    [Direction.L]: 5,
    [Direction.R]: 7,
  },
  7: {
    [Direction.U]: 3,
    [Direction.D]: "B",
    [Direction.L]: 6,
    [Direction.R]: 8,
  },
  8: {
    [Direction.U]: 4,
    [Direction.D]: "C",
    [Direction.L]: 7,
    [Direction.R]: 9,
  },
  9: {
    [Direction.U]: 9,
    [Direction.D]: 9,
    [Direction.L]: 8,
    [Direction.R]: 9,
  },
  A: {
    [Direction.U]: 6,
    [Direction.D]: "A",
    [Direction.L]: "A",
    [Direction.R]: "B",
  },
  B: {
    [Direction.U]: 7,
    [Direction.D]: "D",
    [Direction.L]: "A",
    [Direction.R]: "C",
  },
  C: {
    [Direction.U]: 8,
    [Direction.D]: "C",
    [Direction.L]: "B",
    [Direction.R]: "C",
  },
  D: {
    [Direction.U]: "B",
    [Direction.D]: "D",
    [Direction.L]: "D",
    [Direction.R]: "D",
  },
};

export default <Solution<Direction[][]>> {
  parse(input: string): Direction[][] {
    return input.split("\n").map((
      line,
    ) => [...iter(line).filterMap(toDirection)]);
  },

  part1: findBathroomCode(SIMPLE_KEYPAD, 5),
  part2: findBathroomCode(COMPLEX_KEYPAD, 5),
};

function toDirection(dir: string): Direction | undefined {
  return Direction[dir as keyof typeof Direction];
}

function executeMove<K extends number | string>(keypad: Keypad<K>) {
  return (key: K, dir: Direction): K => keypad[key][dir];
}

export function executeSequence<K extends number | string>(keypad: Keypad<K>) {
  return (startingKey: K, sequence: Direction[]): K =>
    sequence.reduce(executeMove(keypad), startingKey);
}

export function findBathroomCode<K extends number | string>(
  keypad: Keypad<K>,
  initialKey: K,
) {
  return (document: Direction[][]): string =>
    [...iter(document).scan(executeSequence(keypad), initialKey)].join("");
}
