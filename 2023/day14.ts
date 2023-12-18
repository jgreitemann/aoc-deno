import { Solution } from "../solution.ts";
import { Iter, iter, range } from "../utils/iter.ts";
import { Direction, Unit, Vector, vectorAdd, vectorMul } from "../utils/vec.ts";

export default <Solution<Platform>> {
  parse: (input) => new Platform(input),

  part1(platform: Platform): number {
    platform.tilt("NORTH");
    return platform.load();
  },

  part2(platform: Platform): number {
    platform.spin(1000000000);
    return platform.load();
  },
};

export class Platform {
  map: string[][];

  constructor(input: string) {
    this.map = input.split("\n").map((line) => line.split(""));
  }

  joined(): string[] {
    return this.map.map((line) => line.join(""));
  }

  dimensions(): Vector<2> {
    return [
      this.map.length,
      this.map[0].length,
    ];
  }

  inBounds([row, col]: Readonly<Vector<2>>): boolean {
    return row >= 0 && col >= 0 && row < this.map.length &&
      col < this.map[row].length;
  }

  edge(dir: Direction): Iter<Vector<2>> {
    const [height, width] = this.dimensions();
    switch (dir) {
      case "NORTH":
        return range(0, width).map((col) => [0, col]);
      case "WEST":
        return range(0, height).map((row) => [row, 0]);
      case "SOUTH":
        return range(0, width).map((col) => [height - 1, col]);
      case "EAST":
        return range(0, height).map((row) => [row, width - 1]);
    }
  }

  *line(
    start: Readonly<Vector<2>>,
    incr: Readonly<Vector<2>>,
  ): Generator<Readonly<Vector<2>>> {
    while (this.inBounds(start)) {
      yield start;
      start = vectorAdd<2>(start, incr);
    }
  }

  tilt(dir: Direction) {
    const movement = Unit[dir];
    const next = vectorMul<2>(movement, -1);
    for (const edgePoint of this.edge(dir)) {
      for (const src of this.line(edgePoint, next)) {
        if (this.map[src[0]][src[1]] !== "O") {
          continue;
        }
        const dest = iter(this.line(src, movement))
          .skip(1)
          .takeWhile((p) => this.map[p[0]][p[1]] === ".")
          .last();
        if (dest !== undefined) {
          this.map[src[0]][src[1]] = ".";
          this.map[dest[0]][dest[1]] = "O";
        }
      }
    }
  }

  private spinInternal(cycles: number) {
    for (let i = 0; i < cycles; ++i) {
      this.tilt("NORTH");
      this.tilt("WEST");
      this.tilt("SOUTH");
      this.tilt("EAST");
    }
  }

  spin(cycles: number) {
    const transient = Math.min(cycles, 100);
    this.spinInternal(transient);
    const snapshot = this.joined().join();
    let period = 0;
    while (transient + period < cycles) {
      this.spinInternal(1);
      period += 1;
      const newSnapshot = this.joined().join();
      if (newSnapshot === snapshot) {
        break;
      }
    }
    const remainder = (cycles - transient) % period;
    this.spinInternal(remainder);
  }

  load(): number {
    let totalLoad = 0;
    for (let row = 0; row < this.map.length; ++row) {
      totalLoad += (this.map.length - row) *
        iter(this.map[row]).filter((e) => e === "O").count();
    }
    return totalLoad;
  }
}
