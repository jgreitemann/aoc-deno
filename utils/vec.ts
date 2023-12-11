type FixedLengthArray<T, N extends number> = N extends N
  ? (number extends N ? T[] : _Array<T, N, []>)
  : never;

type _Array<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _Array<T, N, [T, ...R]>;

export type Vector<N extends number> = FixedLengthArray<number, N>;

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
): Vector<N> {
  const res = [...lhs] as Vector<N>;
  for (const i in res) {
    res[i] += rhs[i];
  }
  return res;
}

export function vectorSub<N extends number>(
  lhs: Readonly<Vector<N>>,
  rhs: Readonly<Vector<N>>,
): Vector<N> {
  const res = [...lhs] as Vector<N>;
  for (const i in res) {
    res[i] -= rhs[i];
  }
  return res;
}

export function vectorMul<N extends number>(
  vec: Readonly<Vector<N>>,
  scalar: number,
): Vector<N> {
  return vec.map((elem) => elem * scalar) as Vector<N>;
}
