import { Solution } from "../solution.ts";
import { sum } from "../utils/iter.ts";

export default <Solution<Game[]>> {
  parse: parseInput,
  part1(games: Game[]): string {
    return sumOfPossibleIds(games).toString();
  },
  part2(games: Game[]): string {
    return sum(games.map(powerOfGame)).toString();
  },
};

export type Cubes = {
  red: number;
  green: number;
  blue: number;
};

const NO_CUBES = { red: 0, green: 0, blue: 0 };

export type Game = {
  id: number;
  draws: Cubes[];
};

export function parseInput(input: string): Game[] {
  return input.split("\n")
    .map((line) => {
      const [gameTag, drawsText] = line.split(": ");
      const id = +gameTag.slice(5);
      const draws = drawsText.split("; ").map((draw) => {
        const cubes: Partial<Cubes> = Object.fromEntries(
          draw.split(", ").map((s) => {
            const [amount, kind] = s.split(" ");
            return [kind, +amount];
          }),
        );
        return { ...NO_CUBES, ...cubes };
      });
      return { id, draws };
    });
}

export function findCubeRequirements(cubes: Cubes[]): Cubes {
  return {
    red: Math.max(...cubes.map((c) => c.red)),
    green: Math.max(...cubes.map((c) => c.green)),
    blue: Math.max(...cubes.map((c) => c.blue)),
  };
}

export const POSSIBLE_CUBES: Cubes = {
  red: 12,
  green: 13,
  blue: 14,
};

export function satisfies(sample: Cubes, reference: Cubes): boolean {
  return Object.keys(sample).every((key) =>
    sample[key as keyof Cubes] <= reference[key as keyof Cubes]
  );
}

export function sumOfPossibleIds(games: Game[]): number {
  return sum(
    games
      .filter((game) =>
        satisfies(findCubeRequirements(game.draws), POSSIBLE_CUBES)
      )
      .map((game) => game.id),
  );
}

export function powerOfGame(game: Game): number {
  const req = findCubeRequirements(game.draws);
  return req.red * req.green * req.blue;
}
