import { Solution } from "../solution.ts";
import { iter } from "../utils/iter.ts";

export default <Solution<Almanac>> {
  parse: parseAlmanac,
  part1(almanac: Almanac): string {
    return Math.min(...findLocations(almanac.initialSeeds, almanac.mappings))
      .toString();
  },
  part2(almanac: Almanac): string {
    return Math.min(
      ...findLocations(expandSeeds(almanac.initialSeeds), almanac.mappings),
    )
      .toString();
  },
};

export type Almanac = {
  initialSeeds: number[];
  mappings: ResourceMapping[];
};

export type ResourceMapping = {
  ranges: MappingRange[];
};

export type MappingRange = {
  destinationStart: number;
  sourceStart: number;
  length: number;
};

export function parseAlmanac(input: string): Almanac {
  const [seedsSection, ...mappingSections] = input.split("\n\n");

  return {
    initialSeeds: seedsSection.slice("seeds: ".length).split(" ").map((num) =>
      +num
    ),
    mappings: mappingSections.map((section) => {
      const [_heading, ...ranges] = section.split("\n");
      return {
        ranges: ranges.map((rangeStr) => {
          const [destinationStart, sourceStart, length] = rangeStr.split(" ")
            .map((num) => +num);
          return { destinationStart, sourceStart, length };
        }),
      };
    }),
  };
}

export function mapFn(
  mapping: ResourceMapping,
): (source: number) => number {
  return (source: number) => {
    const applicableRange = mapping.ranges.find((range) =>
      range.sourceStart <= source &&
      source < range.sourceStart + range.length
    );
    return (applicableRange?.destinationStart ?? 0) -
      (applicableRange?.sourceStart ?? 0) + source;
  };
}

function pipe(...fns: ((x: number) => number)[]): (x: number) => number {
  return (x) => fns.reduce((acc, fn) => fn(acc), x);
}

export function findLocations(
  initialSeeds: number[],
  mappings: ResourceMapping[],
): number[] {
  const piped = pipe(...mappings.map(mapFn));
  return initialSeeds.map(piped);
}

function range(size: number, startAt = 0): ReadonlyArray<number> {
  return [...Array(size).keys()].map((i) => i + startAt);
}

export function expandSeeds(seedRanges: number[]): number[] {
  return iter(seedRanges).chunks(2).flatMap(([begin, length]) =>
    range(length, begin)
  ).collect();
}
