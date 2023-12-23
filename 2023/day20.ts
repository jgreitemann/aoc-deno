import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { gcd, lcm } from "https://deno.land/x/tiny_math@0.1.4/mod.ts";
import { Solution } from "../solution.ts";
import { iter, range, zip } from "../utils/iter.ts";

export default <Solution<Configuration>> {
  parse: parseConfiguration,

  part1(config: Configuration): number {
    const stats = pushButtonManyTimes(1000, config);
    return stats.low * stats.high;
  },

  part2(config: Configuration): number {
    const subgraphConfigs = findSubgraphs(config);

    const subgraphIntervals = subgraphConfigs.map((c) =>
      iter(pushesUntilReceiverTriggered(c)).take(2).collect() as [
        number,
        number,
      ]
    );

    return pushesUntilSubgraphsLineUp(...subgraphIntervals);
  },
};

export type Configuration = Map<string, Module>;

type ModuleOutput = {
  destinations: readonly string[];
  isHigh: boolean;
};

export abstract class Module {
  constructor(public destinations: readonly string[]) {}
  abstract handle(source: string, isHigh: boolean): ModuleOutput;
  abstract reset(): void;
}

export class Broadcaster extends Module {
  handle(_source: string, isHigh: boolean): ModuleOutput {
    return { destinations: this.destinations, isHigh };
  }
  reset(): void {}
}

export class FlipFlop extends Module {
  private on = false;

  handle(_source: string, isHigh: boolean): ModuleOutput {
    if (isHigh) {
      return { destinations: [], isHigh: false };
    }
    this.on = !this.on;
    return { destinations: this.destinations, isHigh: this.on };
  }

  reset() {
    this.on = false;
  }
}

export class Conjunction extends Module {
  public received = new Map<string, boolean>();

  handle(source: string, isHigh: boolean): ModuleOutput {
    this.received.set(source, isHigh);
    return {
      destinations: this.destinations,
      isHigh: !iter(this.received.values()).all(),
    };
  }

  reset() {
    for (const connected in this.received) {
      this.received.set(connected, false);
    }
  }

  connect(source: string): Conjunction {
    this.received.set(source, false);
    return this;
  }
}

export class Receiver extends Module {
  public triggered = false;

  handle(_source: string, isHigh: boolean): ModuleOutput {
    if (!isHigh) {
      this.triggered = true;
    }
    return { destinations: [], isHigh };
  }

  reset(): void {
    this.triggered = false;
  }
}

export function parseConfiguration(input: string): Configuration {
  const config = new Map(
    input.split("\n").map((line): [string, Module] => {
      const [label, destinationStr] = line.split(" -> ");
      const destinations = destinationStr.split(", ");
      if (label.startsWith("broadcaster")) {
        return [label, new Broadcaster(destinations)];
      } else if (label.startsWith("%")) {
        return [label.substring(1), new FlipFlop(destinations)];
      } else if (label.startsWith("&")) {
        return [label.substring(1), new Conjunction(destinations)];
      } else {
        throw new Error(`Unknown module type: ${label}`);
      }
    }),
  );

  for (const [name, { destinations }] of config.entries()) {
    for (const destination of destinations) {
      const destinationModule = config.get(destination);
      if (destinationModule instanceof Conjunction) {
        destinationModule.connect(name);
      }
    }
  }

  return config;
}

type PulseStats = {
  low: number;
  high: number;
};

type Pulse = {
  source: string;
  destination: string;
  isHigh: boolean;
};

export function pushButton(config: Configuration): PulseStats {
  let stats = { low: 1, high: 0 };

  let pendingPulses: Pulse[] = [
    { source: "", "destination": "broadcaster", isHigh: false },
  ];

  while (pendingPulses.length > 0) {
    pendingPulses = pendingPulses.flatMap(
      ({ source, destination: current, isHigh }) => {
        const output = config.get(current)
          ?.handle(source, isHigh);
        return output?.destinations
          .map((destination) => ({
            source: current,
            destination,
            isHigh: output.isHigh,
          })) ?? [];
      },
    );

    stats = pendingPulses.reduce((stats, { isHigh }) => {
      if (isHigh) {
        stats.high += 1;
      } else {
        stats.low += 1;
      }
      return stats;
    }, stats);
  }

  return stats;
}

export function pushButtonManyTimes(
  n: number,
  config: Configuration,
): PulseStats {
  return range(0, n)
    .map(() => pushButton(config))
    .fold((stats, { low, high }) => {
      stats.low += low;
      stats.high += high;
      return stats;
    }, { low: 0, high: 0 });
}

export function* pushesUntilReceiverTriggered(
  config: Configuration,
): Generator<number> {
  config.forEach((module) => module.reset());
  const rx = new Receiver([]);
  config.set("rx", rx);
  let buttonPushes = 0;
  while (true) {
    pushButton(config);
    buttonPushes += 1;

    if (rx.triggered) {
      yield buttonPushes;
      buttonPushes = 0;
      rx.reset();
    }
  }
}

export function findSubgraphs(config: Configuration): Configuration[] {
  const collector = iter(config.values())
    .find((module) => module.destinations.includes("rx"))!;

  if (!(collector instanceof Conjunction)) {
    throw new Error(
      "Expected rx to be connected to a collector conjunction",
    );
  }

  const subgraphInverterNames = [...collector.received.keys()];
  const subgraphModuleNames = subgraphInverterNames.map(
    (subgraphInverterName) => {
      const names = HashSet.builder<string>();
      let newNames = [subgraphInverterName];
      while (newNames.length > 0) {
        newNames = newNames
          .flatMap((name) =>
            iter(config)
              .filter(([_, m]) => m.destinations.includes(name))
              .map(([n, _]) => n)
              .collect()
          )
          .filter((name) => names.add(name));
      }
      return names.build();
    },
  );

  const broadcaster = config.get("broadcaster")!;

  return zip(subgraphInverterNames, subgraphModuleNames)
    .map(([subgraphInverterName, subgraphModuleNames]) => {
      // Create a new broadcaster which only targets subgraph modules
      const subgraphBroadcaster = new Broadcaster(
        broadcaster.destinations
          .filter((n) => subgraphModuleNames.has(n)),
      );

      const subgraphConfig = new Map<string, Module>([
        ["broadcaster", subgraphBroadcaster],
        ...iter(config)
          .filter(([n, _]) => n !== "broadcaster")
          .filter(([n, _]) => subgraphModuleNames.has(n))
          .map(([n, m]) => {
            m.destinations = m.destinations.map((d) =>
              d === subgraphInverterName ? "rx" : d
            );
            return [n, m] as const;
          }),
      ]);

      return subgraphConfig;
    })
    .collect();
}

export function pushesUntilSubgraphsLineUp(
  ...subgraphIntervals: [number, number][]
): number {
  const [combinedPhase, _combinedPeriod] = subgraphIntervals
    .reduce(([phaseA, periodA], [phaseB, periodB]) => {
      const gcdPeriod = gcd(periodA, periodB);
      const commonPeriod = BigInt(lcm(periodA, periodB));

      if ((phaseB - phaseA) % gcdPeriod !== 0) {
        // With these phases, the subgraphs would never align.
        // However, we can add 1 to phaseA to account for alignment
        // while one subgraph is already updated but the other isn't yet.
        phaseA += 1;
      }

      if ((phaseB - phaseA) % gcdPeriod !== 0) {
        throw new Error("Subgraphs do not align!");
      }

      const [nA, nB] = extendedEuclidean(periodA, periodB);
      const scale = BigInt((phaseB - phaseA) / gcdPeriod);

      const cyclesA = (BigInt(nA) * scale + commonPeriod) %
        (commonPeriod / BigInt(periodA));
      const cyclesB = (BigInt(-nB) * scale + commonPeriod) %
        (commonPeriod / BigInt(periodB));

      const pushesA = phaseA + periodA * Number(cyclesA);
      const pushesB = phaseB + periodB * Number(cyclesB);

      if (pushesA !== pushesB) {
        throw new Error(
          `Subgraphs don't align after all: ${pushesA} vs ${pushesB}`,
        );
      }

      return [pushesA, Number(commonPeriod)];
    });

  return combinedPhase;
}

// https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
export function extendedEuclidean(a: number, b: number): [number, number] {
  let remPrev = a;
  let rem = b;
  let sPrev = 1;
  let s = 0;
  let tPrev = 0;
  let t = 1;

  while (rem !== 0) {
    const quot = Math.floor(remPrev / rem);
    const remNext = remPrev % rem;
    remPrev = rem;
    rem = remNext;
    const sNext = sPrev - quot * s;
    const tNext = tPrev - quot * t;
    sPrev = s;
    s = sNext;
    tPrev = t;
    t = tNext;
  }

  return [sPrev, tPrev];
}
