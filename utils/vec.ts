type FixedLengthArray<T, N extends number> = N extends N
  ? (number extends N ? T[] : _Array<T, N, []>)
  : never;

type _Array<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _Array<T, N, [T, ...R]>;

export type Vector<N extends number> = FixedLengthArray<number, N>;

export function vectorCompare<N extends number>(
  lhs: Vector<N>,
  rhs: Vector<N>,
): boolean {
  for (const idx in lhs) {
    if (lhs[idx] !== rhs[idx]) {
      return false;
    }
  }
  return true;
}
