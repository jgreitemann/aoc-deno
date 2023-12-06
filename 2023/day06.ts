import { Solution } from "../solution.ts";
import { product, zip } from "../utils/iter.ts";

export default <Solution<Race[]>> {
  parse: parseInput,
  part1(races: Race[]): string {
    return product(races.map(waysToBeatRecord)).toString();
  },
  part2(races: Race[]): string {
    return waysToBeatRecord(unkern(races)).toString();
  },
};

export type Race = {
  timeAllowed: number;
  recordDistance: number;
};

export function parseInput(input: string): Race[] {
  const [timesLine, distancesLine] = input.split("\n");
  const times = timesLine.slice(10).trim().split(/\s+/).map((s) => +s);
  const distances = distancesLine.slice(10).trim().split(/\s+/).map((s) => +s);
  return zip(times, distances)
    .map(([timeAllowed, recordDistance]) => ({ timeAllowed, recordDistance }))
    .collect();
}

export function unkern(races: Race[]): Race {
  return {
    timeAllowed: +races.map((r) => r.timeAllowed.toString()).join(""),
    recordDistance: +races.map((r) => r.recordDistance.toString()).join(""),
  };
}

export function waysToBeatRecord(race: Race): number {
  const center = race.timeAllowed / 2;
  const discriminant = Math.sqrt(
    race.timeAllowed ** 2 / 4 - race.recordDistance,
  );
  const eps = 0.0000001;
  const lowest = Math.ceil(center - discriminant + eps);
  const highest = Math.floor(center + discriminant - eps);
  return highest - lowest + 1;
}
