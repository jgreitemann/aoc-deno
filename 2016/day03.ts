import { Solution } from "../solution.ts";

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

  part1(data: [number, number, number][]): string {
    return data.filter((trig) => isTriangle(...trig)).length.toString();
  },
};

export function isTriangle(a: number, b: number, c: number): boolean {
  const sortedSides: [number, number, number] = [a, b, c];
  sortedSides.sort((lhs, rhs) => lhs - rhs);
  return sortedSides[0] > 0 && sortedSides[0] + sortedSides[1] > sortedSides[2];
}
