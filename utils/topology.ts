import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { Point, vectorAdd, vectorSub } from "./vec.ts";
import { sum, zip } from "./iter.ts";

export function* neighbors(
  p: Point,
): Generator<Point> {
  yield [p[0] - 1, p[1]];
  yield [p[0], p[1] - 1];
  yield [p[0] + 1, p[1]];
  yield [p[0], p[1] + 1];
}

export function inBounds<T>([row, col]: Point, map: ArrayLike<T>[]): boolean {
  return row >= 0 && col >= 0 && row < map.length && col < map[row].length;
}

export function enclosedPoints(
  loop: Point[],
): HashSet<Point> {
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

  return interior.build();
}
