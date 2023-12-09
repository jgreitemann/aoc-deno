import { Solution, ToString } from "../solution.ts";
import { zip } from "../utils/iter.ts";

export default <Solution<[number, number, number][]>> {
  parse(input: string): [number, number, number][] {
    return input.split("\n").map((
      line,
    ) => {
      const triangle = line.trim().split(/\s+/).map((x) => parseInt(x));
      if (triangle.length !== 3 || triangle.some(isNaN)) {
        throw new Error(
          `Failed to parse line as a number triplet: "${line}"; read: ${
            Deno.inspect(triangle)
          }`,
        );
      }
      return triangle as [number, number, number];
    });
  },

  part1(data: [number, number, number][]): number {
    return data.filter((trig) => isTriangle(...trig)).length;
  },

  part2(data: [number, number, number][]): ToString {
    return this.part1!(rearrangeData(data));
  },
};

export function isTriangle(a: number, b: number, c: number): boolean {
  const sortedSides: [number, number, number] = [a, b, c];
  sortedSides.sort((lhs, rhs) => lhs - rhs);
  return sortedSides[0] > 0 && sortedSides[0] + sortedSides[1] > sortedSides[2];
}

export function rearrangeData(
  data: [number, number, number][],
): [number, number, number][] {
  return zip(...data).flatten().chunks(3).collect();
}
