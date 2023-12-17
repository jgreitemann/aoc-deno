import { HashSet } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";

import { Solution } from "../solution.ts";
import { Direction, Unit, vectorAdd } from "../utils/vec.ts";
import { Vector } from "../utils/vec.ts";
import { range } from "../utils/iter.ts";

export default <Solution<Tile[][]>> {
  parse(input: string): Tile[][] {
    return input.split("\n").map((line) => line.split("") as Tile[]);
  },

  part1(map: Tile[][]): number {
    return energizedTiles(map).size;
  },

  part2(map: Tile[][]): number {
    return mostEnergizedTiles(map);
  },
};

type Ray = {
  pos: Vector<2>;
  dir: Direction;
};

export type Tile = "." | "/" | "\\" | "|" | "-";
type IncidenceMap = { [incidence in Direction]: Direction[] };

const Optics: { [element in Tile]: IncidenceMap } = {
  ".": {
    NORTH: ["NORTH"],
    WEST: ["WEST"],
    SOUTH: ["SOUTH"],
    EAST: ["EAST"],
  },
  "/": {
    NORTH: ["EAST"],
    WEST: ["SOUTH"],
    SOUTH: ["WEST"],
    EAST: ["NORTH"],
  },
  "\\": {
    NORTH: ["WEST"],
    WEST: ["NORTH"],
    SOUTH: ["EAST"],
    EAST: ["SOUTH"],
  },
  "|": {
    NORTH: ["NORTH"],
    WEST: ["NORTH", "SOUTH"],
    SOUTH: ["SOUTH"],
    EAST: ["NORTH", "SOUTH"],
  },
  "-": {
    NORTH: ["WEST", "EAST"],
    WEST: ["WEST"],
    SOUTH: ["WEST", "EAST"],
    EAST: ["EAST"],
  },
};

function propagate(ray: Ray, map: Tile[][]): Ray[] {
  const tile = map[ray.pos[0]][ray.pos[1]];
  const newDirs = Optics[tile][ray.dir];
  return newDirs.map((dir) => ({
    pos: vectorAdd<2>(ray.pos, Unit[dir]),
    dir,
  }));
}

export function energizedTiles(
  map: Tile[][],
  start: Ray = { pos: [0, 0], dir: "EAST" },
): HashSet<Vector<2>> {
  const width = map[0].length;
  const height = map.length;

  let rays: Ray[] = [start];
  const knownRays = HashSet.from(rays).toBuilder();
  while (rays.length > 0) {
    rays = rays
      .flatMap((ray) => propagate(ray, map))
      .filter(({ pos: [row, col] }) =>
        row >= 0 && row < height && col >= 0 && col < width
      )
      .filter((ray) => knownRays.add(ray));
  }

  return HashSet.from(knownRays.build().stream().map(({ pos }) => pos));
}

export function mostEnergizedTiles(map: Tile[][]): number {
  const width = map[0].length;
  const height = map.length;
  const startingConfigurations = [
    ...range(0, width).map((col): Ray => ({ pos: [0, col], dir: "SOUTH" })),
    ...range(0, height).map((row): Ray => ({ pos: [row, 0], dir: "EAST" })),
    ...range(0, width).map((col): Ray => ({
      pos: [height - 1, col],
      dir: "NORTH",
    })),
    ...range(0, height).map((row): Ray => ({
      pos: [row, width - 1],
      dir: "WEST",
    })),
  ];
  return Math.max(
    ...startingConfigurations.map((start) => energizedTiles(map, start).size),
  );
}
