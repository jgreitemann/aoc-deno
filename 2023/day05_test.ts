import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  Almanac,
  expandSeeds,
  findLocations,
  mapFn,
  parseAlmanac,
} from "./day05.ts";

const EXAMPLE_INPUT = `seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`;

const EXAMPLE_ALMANAC: Almanac = {
  initialSeeds: [79, 14, 55, 13],
  mappings: [
    {
      ranges: [
        { sourceStart: 50, destinationStart: 98, length: 2 },
        { sourceStart: 52, destinationStart: 50, length: 48 },
      ],
    },
    {
      ranges: [
        { sourceStart: 0, destinationStart: 15, length: 37 },
        { sourceStart: 37, destinationStart: 52, length: 2 },
        { sourceStart: 39, destinationStart: 0, length: 15 },
      ],
    },
    {
      ranges: [
        { sourceStart: 49, destinationStart: 53, length: 8 },
        { sourceStart: 0, destinationStart: 11, length: 42 },
        { sourceStart: 42, destinationStart: 0, length: 7 },
        { sourceStart: 57, destinationStart: 7, length: 4 },
      ],
    },
    {
      ranges: [
        { sourceStart: 88, destinationStart: 18, length: 7 },
        { sourceStart: 18, destinationStart: 25, length: 70 },
      ],
    },
    {
      ranges: [
        { sourceStart: 45, destinationStart: 77, length: 23 },
        { sourceStart: 81, destinationStart: 45, length: 19 },
        { sourceStart: 68, destinationStart: 64, length: 13 },
      ],
    },
    {
      ranges: [
        { sourceStart: 0, destinationStart: 69, length: 1 },
        { sourceStart: 1, destinationStart: 0, length: 69 },
      ],
    },
    {
      ranges: [
        { sourceStart: 60, destinationStart: 56, length: 37 },
        { sourceStart: 56, destinationStart: 93, length: 4 },
      ],
    },
  ],
};

Deno.test("Example almanac can be parsed", () => {
  assertEquals(parseAlmanac(EXAMPLE_INPUT), EXAMPLE_ALMANAC);
});

Deno.test("Initial seeds are mapped to soil types", () => {
  const seedToSoil = mapFn(EXAMPLE_ALMANAC.mappings[0]);
  assertEquals(EXAMPLE_ALMANAC.initialSeeds.map(seedToSoil), [81, 14, 57, 13]);
});

Deno.test("Locations are determined", () => {
  assertEquals(
    findLocations(EXAMPLE_ALMANAC.initialSeeds, EXAMPLE_ALMANAC.mappings),
    [82, 43, 86, 35],
  );
});

Deno.test("Minimum location of expanded seeds is identified", () => {
  assertEquals(
    Math.min(
      ...findLocations(
        expandSeeds(EXAMPLE_ALMANAC.initialSeeds),
        EXAMPLE_ALMANAC.mappings,
      ),
    ),
    46,
  );
});
