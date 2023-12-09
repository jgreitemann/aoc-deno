import { Solution } from "../solution.ts";

import { iter, product, sum } from "../utils/iter.ts";
import { Vector } from "../utils/vec.ts";

import {
  Hasher,
  HashMap,
  HashSet,
} from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";

export default <Solution<Schematic>> {
  parse: parseSchematic,
  part1(schematic: Schematic): number {
    return sum(partNumbers(schematic));
  },
  part2(schematic: Schematic): number {
    return sum(gearRatios(schematic));
  },
};

const FlatHashMap = HashMap.createContext({
  hasher: Hasher.anyFlatHasher(),
});

export type Point = Vector<2>;

export type Schematic = {
  numbers: Map<Point, string>;
  symbols: Map<Point, string>;
};

export function parseSchematic(input: string): Schematic {
  const numbers = new Map<Point, string>();
  const symbols = new Map<Point, string>();
  for (const [row, line] of input.split("\n").entries()) {
    for (const numberMatch of line.matchAll(/[0-9]+/g)) {
      numbers.set([row, numberMatch.index!], numberMatch[0]);
    }
    for (const symbolMatch of line.matchAll(/[^.\d]/g)) {
      symbols.set([row, symbolMatch.index!], symbolMatch[0]);
    }
  }
  return { numbers: numbers, symbols: symbols };
}

export function* surroundingPoints(
  [x, y]: Point,
  extent = 1,
): Generator<Point> {
  for (let yy = y - 1; yy <= y + extent; ++yy) {
    yield [x - 1, yy];
  }
  yield [x, y - 1];
  yield [x, y + extent];
  for (let yy = y - 1; yy <= y + extent; ++yy) {
    yield [x + 1, yy];
  }
}

export function partNumbers(schematic: Schematic): number[] {
  const symbolPositions = HashSet.from(schematic.symbols.keys());
  return iter(schematic.numbers
    .entries())
    .filterMap(([p, num]) =>
      iter(surroundingPoints(p, num.length)).any((q) => symbolPositions.has(q))
        ? +num
        : undefined
    )
    .collect();
}

export function gearRatios(schematic: Schematic): number[] {
  const adjacentParts = FlatHashMap.from(
    iter(schematic.symbols.entries()).filterMap(([coords, s]) =>
      s === "*" ? [coords, []] as [Point, number[]] : undefined
    ),
  );

  for (const [p, num] of schematic.numbers) {
    for (const q of surroundingPoints(p, num.length)) {
      const potentialGear = adjacentParts.get(q);
      if (potentialGear !== undefined) {
        potentialGear.push(+num);
      }
    }
  }

  return iter(adjacentParts.streamValues())
    .filter((parts) => parts.length >= 2)
    .map(product)
    .collect();
}
