import { Solution } from "../solution.ts";
import { iter, pairs, sum } from "../utils/iter.ts";
import {
  Vector,
  vectorAdd,
  vectorCompare,
  vectorMul,
  vectorSub,
} from "../utils/vec.ts";

export default <Solution<Hailstone[]>> {
  parse: parseHailstones,
  part1: count2dIntersectionsInBox,
  part2(hail: Hailstone[]): number {
    const { position } = determineRockTrajectory(hail);
    return sum(position);
  },
};

export type Hailstone = {
  position: Readonly<Vector<3>>;
  velocity: Readonly<Vector<3>>;
};

export function parseHailstones(input: string): Hailstone[] {
  return input
    .split("\n")
    .map((line) => {
      const [posStr, velStr] = line.split(" @ ");
      return {
        position: posStr.split(", ")
          .map((x) => +x) as unknown as Readonly<Vector<3>>,
        velocity: velStr.split(", ")
          .map((x) => +x) as unknown as Readonly<Vector<3>>,
      };
    });
}

function proj2([x, y]: Readonly<Vector<3>>): Readonly<Vector<2>> {
  return [x, y];
}

function determinant(
  lhs: Readonly<Vector<2>>,
  rhs: Readonly<Vector<2>>,
): number {
  return lhs[0] * rhs[1] - rhs[0] * lhs[1];
}

export function count2dIntersectionsInBox(
  hail: Hailstone[],
  minCoord = 200000000000000,
  maxCoord = 400000000000000,
): number {
  return pairs(hail
    .map(({ position, velocity }) => ({
      position: proj2(position),
      velocity: proj2(velocity),
    })))
    .filterMap(([h1, h2]) => {
      const minusH2Velocity = vectorMul<2>(h2.velocity, -1);
      const denom = determinant(h1.velocity, minusH2Velocity);
      if (denom === 0) {
        return undefined;
      }

      const rhs = vectorSub<2>(h2.position, h1.position);

      const t1 = determinant(rhs, minusH2Velocity) / denom;
      const t2 = determinant(h1.velocity, rhs) / denom;

      if (t1 < 0 || t2 < 0) {
        return undefined;
      }

      return vectorAdd<2>(h1.position, vectorMul<2>(h1.velocity, t1));
    })
    .filter((coords) => coords.every((c) => c >= minCoord && c <= maxCoord))
    .count();
}

function tryInferTrajectory(
  vr: Readonly<Vector<2>>,
  hail1: Hailstone,
  hail2: Hailstone,
): Hailstone | undefined {
  const { position: p1, velocity: v1 } = hail1;
  const { position: p2, velocity: v2 } = hail2;
  const f1 = (vr[1] - v1[1]) / (vr[0] - v1[0]);
  const f2 = (vr[1] - v2[1]) / (vr[0] - v2[0]);
  const t1 = (p2[1] - p1[1] - f2 * (p2[0] - p1[0])) /
    (-vr[1] + v1[1] - f2 * (-vr[0] + v1[0]));
  const t2 = (p2[1] - p1[1] - f1 * (p2[0] - p1[0])) /
    (vr[1] - v2[1] - f1 * (vr[0] - v2[0]));

  if (t1 < 0 || t2 < 0) {
    return undefined;
  }

  const velocity: Readonly<Vector<3>> = [
    ...vr,
    Math.round(
      determinant([1, 1], [p1[2] + v1[2] * t1, p2[2] + v2[2] * t2]) /
        determinant([1, 1], [t1, t2]),
    ),
  ];

  return {
    position: vectorAdd<3>(
      p1,
      vectorMul<3>(vectorSub<3>(velocity, v1), -t1),
    ),
    velocity,
  };
}

function* spiral(): Generator<Readonly<Vector<2>>> {
  for (let r = 1;; ++r) {
    for (let y = -r; y < r; ++y) {
      yield [r, y];
    }
    for (let x = r; x > -r; --x) {
      yield [x, r];
    }
    for (let y = r; y > -r; --y) {
      yield [-r, y];
    }
    for (let x = -r; x < r; ++x) {
      yield [x, -r];
    }
  }
}

export function determineRockTrajectory(hail: Hailstone[]): Hailstone {
  return iter(spiral())
    .filterMap((vr) => tryInferTrajectory(vr, hail[0], hail[1]))
    .find(({ position: pr, velocity: vr }) =>
      hail
        .every(({ position: ph, velocity: vh }) => {
          let t = 0;
          if (vr[0] !== vh[0]) {
            t = -(pr[0] - ph[0]) / (vr[0] - vh[0]);
          } else if (vr[1] !== vh[1]) {
            t = -(pr[1] - ph[1]) / (vr[1] - vh[1]);
          } else if (vr[2] !== vh[2]) {
            t = -(pr[2] - ph[2]) / (vr[2] - vh[2]);
          } else {
            return vectorCompare(pr, ph);
          }
          return pr[0] === ph[0] - (vr[0] - vh[0]) * t &&
            pr[1] === ph[1] - (vr[1] - vh[1]) * t &&
            pr[2] === ph[2] - (vr[2] - vh[2]) * t;
        })
    )!;
}
