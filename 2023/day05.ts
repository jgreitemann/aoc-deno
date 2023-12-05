import { Solution } from "../solution.ts";
import { iter } from "../utils/iter.ts";

export default <Solution<Almanac>> {
  parse: parseAlmanac,
  part1(almanac: Almanac): string {
    return Math.min(
      ...findLocations(
        asIndividualSeeds(almanac.initialSeeds),
        almanac.mappings,
      ),
    )
      .toString();
  },
  part2(almanac: Almanac): string {
    return Math.min(
      ...findLocations(asSeedRuns(almanac.initialSeeds), almanac.mappings),
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

export type Run = {
  start: number;
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
): (sources: Run[]) => Run[] {
  return (sources: Run[]) => (
    sources.flatMap((source) => {
      const remainder: Run = { ...source };
      const result: Run[] = [];

      while (remainder.length > 0) {
        const applicableRange = mapping.ranges.find((range) =>
          range.sourceStart <= remainder.start &&
          remainder.start < range.sourceStart + range.length
        );
        if (applicableRange) {
          const applicableLength = Math.min(
            remainder.length,
            applicableRange.length - remainder.start +
              applicableRange.sourceStart,
          );

          result.push({
            start: applicableRange.destinationStart + remainder.start -
              applicableRange.sourceStart,
            length: applicableLength,
          });
          remainder.start += applicableLength;
          remainder.length -= applicableLength;
        } else {
          const applicableLength = Math.min(
            remainder.length,
            ...mapping.ranges.map((r) => r.destinationStart - remainder.start)
              .filter((s) => s >= 0),
          );

          result.push({ start: remainder.start, length: applicableLength });
          remainder.start += applicableLength;
          remainder.length -= applicableLength;
        }
      }

      return result;
    })
  );
}

function pipe<T>(...fns: ((x: T) => T)[]): (x: T) => T {
  return (x) => fns.reduce((acc, fn) => fn(acc), x);
}

export function findLocations(
  initialSeeds: Run[],
  mappings: ResourceMapping[],
): number[] {
  const piped = pipe(...mappings.map(mapFn));
  return piped(initialSeeds)
    .map((run) => run.start);
}

export function asIndividualSeeds(seeds: number[]): Run[] {
  return seeds.map((start) => ({ start, length: 1 }));
}

export function asSeedRuns(seedRuns: number[]): Run[] {
  return iter(seedRuns)
    .chunks(2)
    .map(([start, length]) => ({ start, length }))
    .collect();
}
