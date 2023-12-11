import { Solution } from "../solution.ts";
import { pairs, sum, zip } from "../utils/iter.ts";

export default <Solution<Universe>> {
  parse: parseUniverse,
  part1(universe: Universe): number {
    return distanceBetweenStars(expand(universe, 2));
  },
  part2(universe: Universe): number {
    return distanceBetweenStars(expand(universe, 1000000));
  },
};

type Coords = number[];

export type Universe = {
  dimensions: number[];
  stars: Coords[];
};

export function parseUniverse(input: string): Universe {
  const lines = input.split("\n");
  return {
    dimensions: [lines.length, lines[0].length],
    stars: lines.flatMap((line, row) =>
      line.split("")
        .flatMap((c, col) => c === "#" ? [[row, col]] : [])
    ),
  };
}

export function expand(initial: Universe, rate: number): Universe {
  const empty = [...initial.dimensions.keys()]
    .map((dim) =>
      [...Array(initial.dimensions[dim] + 1).keys()]
        .filter((loc) => initial.stars.every((coords) => coords[dim] !== loc))
    );

  return {
    dimensions: zip(initial.dimensions, empty)
      .map(([init, e]) => init + (e.length - 1) * (rate - 1))
      .collect(),
    stars: initial.stars
      .map((coords) =>
        zip(coords, empty)
          .map(([c, e]) => c + e.findIndex((ee) => ee >= c) * (rate - 1))
          .collect()
      ),
  };
}

export function distanceBetweenStars(universe: Universe): number {
  return sum(
    pairs(universe.stars).map(([a, b]) =>
      sum(zip(a, b).map(([l, r]) => Math.abs(l - r)))
    ),
  );
}
