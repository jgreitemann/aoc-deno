interface Solution<T> {
  parse(input: string): T;
  part1?(data: T): string;
  part2?(data: T): string;
}

function solve<T>(solution: Solution<T>, input: string) {
  const data = solution.parse(input);
  if (solution.part1) {
    console.log("Part 1: " + solution.part1(data));
  }
  if (solution.part2) {
    console.log("Part 2: " + solution.part2(data));
  }
}

async function run() {
  const solution = await import("./2016/day01.ts");
  const session = Deno.env.get("SESSION")!;

  const headers = {
    Cookie: `session=${session}`,
  };

  const inputResponse = await fetch(
    "https://adventofcode.com/2016/day/1/input",
    { headers },
  );

  const input = await inputResponse.text();

  solve(solution, input);
}

if (import.meta.main) {
  await run();
}
