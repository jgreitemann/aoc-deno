import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";

import {
  findCubeRequirements,
  Game,
  parseInput,
  POSSIBLE_CUBES,
  powerOfGame,
  satisfies,
  sumOfPossibleIds,
} from "./day02.ts";

const EXAMPLE_INPUT = `Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`;

const EXAMPLE_GAMES: Game[] = [
  {
    id: 1,
    draws: [
      { blue: 3, red: 4, green: 0 },
      { red: 1, green: 2, blue: 6 },
      { green: 2, red: 0, blue: 0 },
    ],
  },
  {
    id: 2,
    draws: [
      { blue: 1, green: 2, red: 0 },
      { green: 3, blue: 4, red: 1 },
      { green: 1, blue: 1, red: 0 },
    ],
  },
  {
    id: 3,
    draws: [
      { green: 8, blue: 6, red: 20 },
      { blue: 5, red: 4, green: 13 },
      { green: 5, red: 1, blue: 0 },
    ],
  },
  {
    id: 4,
    draws: [
      { green: 1, red: 3, blue: 6 },
      { green: 3, red: 6, blue: 0 },
      { green: 3, blue: 15, red: 14 },
    ],
  },
  {
    id: 5,
    draws: [
      { red: 6, blue: 1, green: 3 },
      { blue: 2, red: 1, green: 2 },
    ],
  },
];

Deno.test("Example input can be parsed", () => {
  assertEquals(parseInput(EXAMPLE_INPUT), EXAMPLE_GAMES);
});

Deno.test("Required cubes can be found for each game", () => {
  assertEquals(findCubeRequirements(EXAMPLE_GAMES[0].draws), {
    red: 4,
    green: 2,
    blue: 6,
  });
  assertEquals(findCubeRequirements(EXAMPLE_GAMES[1].draws), {
    red: 1,
    green: 3,
    blue: 4,
  });
  assertEquals(findCubeRequirements(EXAMPLE_GAMES[2].draws), {
    red: 20,
    green: 13,
    blue: 6,
  });
  assertEquals(findCubeRequirements(EXAMPLE_GAMES[3].draws), {
    red: 14,
    green: 3,
    blue: 15,
  });
  assertEquals(findCubeRequirements(EXAMPLE_GAMES[4].draws), {
    red: 6,
    green: 3,
    blue: 2,
  });
});

Deno.test("Game requires are fulfilled for some games", () => {
  assertEquals(
    EXAMPLE_GAMES.map((game) =>
      satisfies(findCubeRequirements(game.draws), POSSIBLE_CUBES)
    ),
    [true, true, false, false, true],
  );
});

Deno.test("Sum of possible game IDs is found", () => {
  assertEquals(sumOfPossibleIds(EXAMPLE_GAMES), 8);
});

Deno.test("Power of games is determined", () => {
  assertEquals(powerOfGame(EXAMPLE_GAMES[0]), 48);
  assertEquals(powerOfGame(EXAMPLE_GAMES[1]), 12);
  assertEquals(powerOfGame(EXAMPLE_GAMES[2]), 1560);
  assertEquals(powerOfGame(EXAMPLE_GAMES[3]), 630);
  assertEquals(powerOfGame(EXAMPLE_GAMES[4]), 36);
});
