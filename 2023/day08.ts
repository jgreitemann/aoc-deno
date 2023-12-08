import { Solution } from "../solution.ts";
import { iter } from "../utils/iter.ts";

export default <Solution<Network>> {
  parse: parseNetworkMap,
  part1(network: Network): string {
    return iter(navigateSimpleNetwork(network)).count().toString();
  },
  part2(network: Network): string {
    return turnOfFirstConcurrentWin(findGhostOrbits(network)).toString();
    // return findGhostCycles(network).map((c) =>
    //   `{p:${c.period},o:[${c.offsets}]}`
    // ).toString();
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
  goalReached: (pos: T) => boolean,
  network: Network,
): Generator<T> {
  let current = startingPosition;
  const turns = [...network.instructions];
  while (!goalReached(current)) {
    const turn = turns.shift()!;
    turns.push(turn);
    current = takeTurn(current, turn, network);
    yield current;
  }
}

function takeSingleTurn(pos: string, turn: Turn, network: Network): string {
  return turn === "L" ? network.map.get(pos)![0] : network.map.get(pos)![1];
}

export function* navigateSimpleNetwork(network: Network): Generator<string> {
  yield* navigateNetwork(
    "AAA",
    takeSingleTurn,
    (pos) => pos === "ZZZ",
    network,
  );
}

export function* navigateGhostNetwork(network: Network): Generator<string[]> {
  yield* navigateNetwork(
    [...network.map.keys()].filter((node) => node.endsWith("A")),
    (pos, turn, network) =>
      pos.map((pos) => takeSingleTurn(pos, turn, network)),
    (pos) => pos.every((node) => node.endsWith("Z")),
    network,
  );
}

export type Orbit = {
  period: number;
  offsets: number[];
};

export function findWinningOrbit(
  nodeIter: Iterable<string>,
  base: number,
): Orbit {
  const sample = iter(nodeIter).take(10000 * base).collect();
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
      navigateNetwork(ghost, takeSingleTurn, () => false, network),
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
