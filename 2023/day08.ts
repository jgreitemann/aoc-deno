import { Solution } from "../solution.ts";
import { iter } from "../utils/iter.ts";

import { lcm } from "https://deno.land/x/tiny_math@0.1.4/mod.ts";

export default <Solution<Network>> {
  parse: parseNetworkMap,
  part1(network: Network): number {
    return iter(navigateSimpleNetwork(network)).count();
  },
  part2(network: Network): number {
    // The naive solution is way too slow:
    // return iter(navigateGhostNetwork(network)).count().toString();

    // This solution finishes in under 2 min and is general:
    // return turnOfFirstConcurrentWin(findGhostOrbits(network)).toString();

    // It turns out that the inputs are crafted in such a way that the
    // orbits are not offset, i.e., there are no transients which need to
    // be skipped. That means that LCM can be used to find the common
    // orbital period and that will be the exact turn where the orbits
    // first align.
    //
    // The problem statement does not guarantee this to be the case and it is
    // easy to find inputs for which the LCM trick fails. In those cases, the
    // above solution should still work. I'm including the LCM solution here
    // to prevent this task from slowing down the execution of the AoC suite:
    return commonPeriod(findGhostOrbits(network));
  },
};

export function parseNetworkMap(input: string): Network {
  const [instructionStr, nodes] = input.split("\n\n");
  return {
    instructions: instructionStr.split("") as Turn[],
    map: new Map(
      nodes.split("\n").map((line) => {
        const [_match, node, left, right] = line.match(
          /([A-Z]{3}) = \(([A-Z]{3}), ([A-Z]{3})\)/i,
        )!;
        return [node, [left, right]];
      }),
    ),
  };
}

export type Network = {
  instructions: Turn[];
  map: Map<string, [string, string]>;
};

export type Turn = "L" | "R";

export function* navigateNetwork<T>(
  startingPosition: T,
  takeTurn: (pos: T, turn: Turn, network: Network) => T,
  network: Network,
): Generator<T> {
  let current = startingPosition;
  const turns = [...network.instructions];
  while (true) {
    const turn = turns.shift()!;
    turns.push(turn);
    current = takeTurn(current, turn, network);
    yield current;
  }
}

function takeSingleTurn(pos: string, turn: Turn, network: Network): string {
  return turn === "L" ? network.map.get(pos)![0] : network.map.get(pos)![1];
}

export function navigateSimpleNetwork(network: Network): Iterable<string> {
  return iter(navigateNetwork("AAA", takeSingleTurn, network))
    .takeWhileInclusive((pos) => pos !== "ZZZ");
}

export function navigateGhostNetwork(network: Network): Iterable<string[]> {
  return iter(navigateNetwork(
    [...network.map.keys()].filter((node) => node.endsWith("A")),
    (pos, turn, network) =>
      pos.map((pos) => takeSingleTurn(pos, turn, network)),
    network,
  ))
    .takeWhileInclusive((pos) => !pos.every((node) => node.endsWith("Z")));
}

export type Orbit = {
  period: number;
  offsets: number[];
};

export function findWinningOrbit(
  nodeIter: Iterable<string>,
  base: number,
): Orbit {
  const sample = iter(nodeIter).take(1000 * base).collect();
  let period = base;
  while (!isPeriodic(sample, period)) {
    period += base;
  }

  const offsets = sample
    .slice(sample.length - period)
    .map((node, index) => ({ node, index }))
    .filter(({ node }) => node.endsWith("Z"))
    .map(({ index }) => {
      let offset = sample.length - period + index;
      while (
        offset >= period && isPeriodic(sample.slice(0, offset + 1), period)
      ) {
        offset -= period;
      }
      return offset < period ? offset + 1 : offset - period + 1;
    });
  offsets.sort();

  return { period, offsets };
}

export function findGhostOrbits(network: Network): Orbit[] {
  const ghostStarts = [...network.map.keys()].filter((node) =>
    node.endsWith("A")
  );
  return ghostStarts.map((ghost) =>
    findWinningOrbit(
      navigateNetwork(ghost, takeSingleTurn, network),
      network.instructions.length,
    )
  );
}

function isPeriodic(seq: string[], period: number): boolean {
  if (seq.length < 2 * period) {
    return false;
  }
  for (let i = seq.length - period; i < seq.length; ++i) {
    if (seq[i] !== seq[i - period]) {
      return false;
    }
  }
  return true;
}

export function* winningTurns(orbit: Orbit): Generator<number> {
  for (let multiple = 0;; multiple += orbit.period) {
    for (const offset of orbit.offsets) {
      yield offset + multiple;
    }
  }
}

export function isWinningTurn(turn: number, orbit: Orbit): boolean {
  return orbit.offsets.some((offset) => (turn - offset) % orbit.period === 0);
}

export function turnOfFirstConcurrentWin(orbits: Orbit[]): number {
  const [referenceCycle, ...otherCycles] = orbits.toSorted((lhs, rhs) =>
    rhs.period - lhs.period
  );
  return iter(winningTurns(referenceCycle)).find((turn) =>
    otherCycles.every((cycle) => isWinningTurn(turn, cycle))
  )!;
}

export function commonPeriod(orbits: Orbit[]): number {
  return lcm(...orbits.map((orbit) => orbit.period));
}
