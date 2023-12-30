import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  Graph,
  longestPathDirected,
  longestPathUndirected,
  makeUndirected,
  parseMap,
  tracePath,
} from "./day23.ts";

const EXAMPLE_INPUT = `#.#####################
#.......#########...###
#######.#########.#.###
###.....#.>.>.###.#.###
###v#####.#v#.###.#.###
###.>...#.#.#.....#...#
###v###.#.#.#########.#
###...#.#.#.......#...#
#####.#.#.#######.#.###
#.....#.#.#.......#...#
#.#####.#.#.#########v#
#.#...#...#...###...>.#
#.#.#v#######v###.###v#
#...#.>.#...>.>.#.###.#
#####v#.#.###v#.#.###.#
#.....#...#...#.#.#...#
#.#########.###.#.#.###
#...###...#...#...#.###
###.###.#.###v#####v###
#...#...#.#.>.>.#.>.###
#.###.###.#.###.#.#v###
#.....###...###...#...#
#####################.#`;

const EXAMPLE_GRAPH_DIRECTED: Graph = [
  {
    outbound: [
      { destination: 1, weight: 15 },
    ],
  },
  {
    outbound: [
      { destination: 2, weight: 22 },
      { destination: 3, weight: 22 },
    ],
  },
  {
    outbound: [
      { destination: 4, weight: 30 },
      { destination: 5, weight: 24 },
    ],
  },
  {
    outbound: [
      { destination: 5, weight: 12 },
      { destination: 6, weight: 38 },
    ],
  },
  {
    outbound: [
      { destination: 7, weight: 10 },
    ],
  },
  {
    outbound: [
      { destination: 4, weight: 18 },
      { destination: 6, weight: 10 },
    ],
  },
  {
    outbound: [
      { destination: 7, weight: 10 },
    ],
  },
  {
    outbound: [
      { destination: 8, weight: 5 },
    ],
  },
  { outbound: [] },
];

const EXAMPLE_GRAPH_UNDIRECTED: Graph = [
  {
    outbound: [
      { destination: 1, weight: 15 },
    ],
  },
  {
    outbound: [
      { destination: 2, weight: 22 },
      { destination: 3, weight: 22 },
      { destination: 0, weight: 15 },
    ],
  },
  {
    outbound: [
      { destination: 4, weight: 30 },
      { destination: 5, weight: 24 },
      { destination: 1, weight: 22 },
    ],
  },
  {
    outbound: [
      { destination: 5, weight: 12 },
      { destination: 6, weight: 38 },
      { destination: 1, weight: 22 },
    ],
  },
  {
    outbound: [
      { destination: 7, weight: 10 },
      { destination: 2, weight: 30 },
      { destination: 5, weight: 18 },
    ],
  },
  {
    outbound: [
      { destination: 4, weight: 18 },
      { destination: 6, weight: 10 },
      { destination: 2, weight: 24 },
      { destination: 3, weight: 12 },
    ],
  },
  {
    outbound: [
      { destination: 7, weight: 10 },
      { destination: 3, weight: 38 },
      { destination: 5, weight: 10 },
    ],
  },
  {
    outbound: [
      { destination: 8, weight: 5 },
      { destination: 4, weight: 10 },
      { destination: 6, weight: 10 },
    ],
  },
  {
    outbound: [
      { destination: 7, weight: 5 },
    ],
  },
];

Deno.test("Example map is parsed into weighted graph", () => {
  assertEquals(parseMap(EXAMPLE_INPUT), EXAMPLE_GRAPH_DIRECTED);
});

Deno.test("Trace path from start of map", () => {
  assertEquals(
    tracePath([0, 1], [1, 1], EXAMPLE_INPUT.split("\n")),
    { to: [5, 3], distance: 15 },
  );
});

Deno.test("Trace path between vertices", () => {
  assertEquals(
    tracePath([5, 3], [5, 4], EXAMPLE_INPUT.split("\n")),
    { to: [3, 11], distance: 22 },
  );
});

Deno.test("Trace path to the end of the map", () => {
  assertEquals(
    tracePath([19, 19], [20, 19], EXAMPLE_INPUT.split("\n")),
    { to: [22, 21], distance: 5 },
  );
});

Deno.test("Find the longest path when slopes are unidirectional", () => {
  assertEquals(longestPathDirected(EXAMPLE_GRAPH_DIRECTED), 94);
});

Deno.test("Directed graph can be made undirected by mirroring edges", () => {
  assertEquals(
    makeUndirected(EXAMPLE_GRAPH_DIRECTED),
    EXAMPLE_GRAPH_UNDIRECTED,
  );
});

Deno.test("Find the longest path when slopes are bidirectional", () => {
  assertEquals(longestPathUndirected(EXAMPLE_GRAPH_UNDIRECTED, 8), 154);
});
