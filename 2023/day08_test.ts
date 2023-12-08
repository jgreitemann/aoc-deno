import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  findGhostOrbits,
  findWinningOrbit,
  isWinningTurn,
  navigateGhostNetwork,
  navigateSimpleNetwork,
  Network,
  Orbit,
  parseNetworkMap,
  turnOfFirstConcurrentWin,
  winningTurns,
} from "./day08.ts";
import { iter } from "../utils/iter.ts";

const EXAMPLE_INPUT = `RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`;

const EXAMPLE_NETWORK: Network = {
  instructions: ["R", "L"],
  map: new Map([
    ["AAA", ["BBB", "CCC"]],
    ["BBB", ["DDD", "EEE"]],
    ["CCC", ["ZZZ", "GGG"]],
    ["DDD", ["DDD", "DDD"]],
    ["EEE", ["EEE", "EEE"]],
    ["GGG", ["GGG", "GGG"]],
    ["ZZZ", ["ZZZ", "ZZZ"]],
  ]),
};

const MINI_NETWORK: Network = {
  instructions: ["L", "L", "R"],
  map: new Map([
    ["AAA", ["BBB", "BBB"]],
    ["BBB", ["AAA", "ZZZ"]],
    ["ZZZ", ["ZZZ", "ZZZ"]],
  ]),
};

const GHOST_NETWORK: Network = {
  instructions: ["L", "R"],
  map: new Map([
    ["11A", ["11B", "XXX"]],
    ["11B", ["XXX", "11Z"]],
    ["11Z", ["11B", "XXX"]],
    ["22A", ["22B", "XXX"]],
    ["22B", ["22C", "22C"]],
    ["22C", ["22Z", "22Z"]],
    ["22Z", ["22B", "22B"]],
    ["XXX", ["XXX", "XXX"]],
  ]),
};

Deno.test("Example network map is parsed", () => {
  assertEquals(parseNetworkMap(EXAMPLE_INPUT), EXAMPLE_NETWORK);
});

Deno.test("Navigate simple network map", () => {
  assertEquals([...navigateSimpleNetwork(EXAMPLE_NETWORK)], ["CCC", "ZZZ"]);
  assertEquals([...navigateSimpleNetwork(MINI_NETWORK)], [
    "BBB",
    "AAA",
    "BBB",
    "AAA",
    "BBB",
    "ZZZ",
  ]);
});

Deno.test("Navigate ghost network", () => {
  assertEquals([...navigateGhostNetwork(GHOST_NETWORK)], [
    ["11B", "22B"],
    ["11Z", "22C"],
    ["11B", "22Z"],
    ["11Z", "22B"],
    ["11B", "22C"],
    ["11Z", "22Z"],
  ]);
});

Deno.test("Winning orbit is correctly identified", () => {
  const EXPECTED_ORBIT: Orbit = { period: 6, offsets: [13, 15] };
  assertEquals(
    //                 123456789012345678901234567890123456789
    findWinningOrbit("12345Z67ZZ89ZAZB89ZAZB89ZAZB89ZAZB89ZAZ".split(""), 3),
    EXPECTED_ORBIT,
  );
  assertEquals(
    findWinningOrbit("12345Z67ZZ89ZAZB89ZAZB89ZAZB89ZAZB89ZA".split(""), 3),
    EXPECTED_ORBIT,
  );
  assertEquals(
    findWinningOrbit("12345Z67ZZ89ZAZB89ZAZB89ZAZB89ZAZB89Z".split(""), 3),
    EXPECTED_ORBIT,
  );
  assertEquals(
    findWinningOrbit("12345Z67ZZ89ZAZB89ZAZB89ZAZB89ZAZB89".split(""), 3),
    EXPECTED_ORBIT,
  );
  assertEquals(
    findWinningOrbit("12345Z67ZZ89ZAZB89ZAZB89ZAZB89ZAZB8".split(""), 3),
    EXPECTED_ORBIT,
  );
});

Deno.test("Ghost orbits are found in example", () => {
  assertEquals(findGhostOrbits(GHOST_NETWORK), [
    { period: 2, offsets: [2] },
    { period: 6, offsets: [3, 6] },
  ]);
});

const EXAMPLE_ORBITS: Orbit[] = [
  { period: 6, offsets: [12, 14] },
  { period: 5, offsets: [23, 26] },
  { period: 3, offsets: [17, 19] },
  { period: 13, offsets: [21, 31] },
];

Deno.test("Sequence of winning turns is reconstructed for one orbit", () => {
  assertEquals(iter(winningTurns(EXAMPLE_ORBITS[3])).take(13).collect(), [
    21,
    31,
    34,
    44,
    47,
    57,
    60,
    70,
    73,
    83,
    86,
    96,
    99,
  ]);
});

Deno.test("Turn can be checked for win condition based on periodicity", () => {
  assertEquals(isWinningTurn(86, EXAMPLE_ORBITS[0]), true);
  assertEquals(isWinningTurn(86, EXAMPLE_ORBITS[1]), true);
  assertEquals(isWinningTurn(86, EXAMPLE_ORBITS[2]), true);
  assertEquals(isWinningTurn(86, EXAMPLE_ORBITS[3]), true);

  for (let turn = 21; turn < 86; ++turn) {
    assertEquals(
      EXAMPLE_ORBITS.every((orbit) => isWinningTurn(turn, orbit)),
      false,
    );
  }
});

Deno.test("Concurrent win is extrapolated correctly based on orbits", () => {
  assertEquals(turnOfFirstConcurrentWin(EXAMPLE_ORBITS), 86);
});

Deno.test("Number of turns required to win the example ghost network", () => {
  assertEquals(turnOfFirstConcurrentWin(findGhostOrbits(GHOST_NETWORK)), 6);
});
