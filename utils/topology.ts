import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { Vector, vectorAdd, vectorSub } from "./vec.ts";
import { sum, zip } from "./iter.ts";

function* neighbors(p: Readonly<Vector<2>>): Generator<Readonly<Vector<2>>> {
  yield [p[0] - 1, p[1]];
  yield [p[0], p[1] - 1];
  yield [p[0] + 1, p[1]];
  yield [p[0], p[1] + 1];
}

export function enclosedPoints(
  loop: Readonly<Vector<2>>[],
): HashSet<Readonly<Vector<2>>> {
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

  const interior = HashSet.builder<Readonly<Vector<2>>>();
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
