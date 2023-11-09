export type Tuple<T, N extends number> = N extends N ? number extends N ? T[]
  : `${N}` extends `-${string}` ? never
  : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

export function isTuple<T, N extends number>(
  value: T[],
  n: N,
): value is Tuple<T, N> {
  return value.length === Math.floor(n);
}
