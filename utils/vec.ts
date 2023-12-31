import { iter } from "./iter.ts";

type FixedLengthArray<T, N extends number> = N extends N
  ? (number extends N ? T[] : _Array<T, N, []>)
  : never;

type _Array<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _Array<T, N, [T, ...R]>;

export type Vector<N extends number> = FixedLengthArray<number, N>;

export type Point = Readonly<Vector<2>>;

export const Unit = {
  NORTH: [-1, 0],
  WEST: [0, -1],
  SOUTH: [1, 0],
  EAST: [0, 1],
} as const;
export type Direction = keyof typeof Unit;

export function vectorCompare<N extends number>(
  lhs: Readonly<Vector<N>>,
  rhs: Readonly<Vector<N>>,
): boolean {
  for (const idx in lhs) {
    if (lhs[idx] !== rhs[idx]) {
      return false;
    }
  }
  return true;
}

export function vectorAdd<N extends number>(
  lhs: Readonly<Vector<N>>,
  rhs: Readonly<Vector<N>>,
): Readonly<Vector<N>> {
  const res = [...lhs] as Vector<N>;
  for (const i in res) {
    res[i] += rhs[i];
  }
  return res;
}

export function vectorSub<N extends number>(
  lhs: Readonly<Vector<N>>,
  rhs: Readonly<Vector<N>>,
): Readonly<Vector<N>> {
  const res = [...lhs] as Vector<N>;
  for (const i in res) {
    res[i] -= rhs[i];
  }
  return res;
}

export function vectorMul<N extends number>(
  vec: Readonly<Vector<N>>,
  scalar: number,
): Readonly<Vector<N>> {
  return vec.map((elem) => elem * scalar) as Readonly<Vector<N>>;
}

export function findStart(map: string[], startChar = "S"): Readonly<Vector<2>> {
  const start: Readonly<Vector<2>> | undefined = iter(map)
    .findMap((line, row) => {
      const col = line.indexOf(startChar);
      return col >= 0 ? [row, col] : undefined;
    });

  if (start === undefined) {
    throw new Error("Starting position could not be found");
  }

  return start;
}
