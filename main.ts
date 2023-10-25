import { cachingFetch } from "./cache.ts";
import { Solution } from "./solution.ts";

function solve<T>(solution: Solution<T>, input: string) {
  const data = solution.parse(input);
  if (solution.part1) {
    console.log(
      "%cPart 1: %c" + solution.part1(data),
      "color: gray",
      "color: white; font-weight: bold",
    );
  }
  if (solution.part2) {
    console.log(
      "%cPart 2: %c" + solution.part2(data),
      "color: gray",
      "color: white; font-weight: bold",
    );
  }
}

async function run() {
  const session = Deno.env.get("SESSION")!;

  for await (const yearEntry of Deno.readDir(".")) {
    if (!yearEntry.isDirectory || !yearEntry.name.startsWith("20")) {
      continue;
    }
    const year = yearEntry.name;
    for await (const dayEntry of Deno.readDir("./" + year)) {
      const dayMatch = dayEntry.name.match(/day0*([1-9][0-9]*)\.ts/);
      if (dayEntry.isFile && dayMatch !== null) {
        const day = dayMatch[1];
        const { default: solution } = await import(
          `./${yearEntry.name}/${dayEntry.name}`
        );

        const request = new Request(
          `https://adventofcode.com/${year}/day/${day}/input`,
        );
        request.headers.append("Cookie", `session=${session}`);

        const inputResponse = await cachingFetch(
          request,
          `aoc-input-session-${session}`,
        );

        const input = await inputResponse.text();

        console.log(`%cDay ${day}, ${year}`, "color: yellow");
        console.group();
        solve(solution, input);
        console.groupEnd();
      }
    }
  }
}

if (import.meta.main) {
  await run();
}
