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
  const cacheName = `aoc-input-session-${session}`;

  // console.log("Disabled cache: ", await caches.delete(cacheName));

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
          cacheName,
        );

        if (inputResponse.status !== 200) {
          const message = await inputResponse.text();
          console.error(
            `%cFailed to download puzzle input for day ${day}, ${year}: ${inputResponse.statusText}\n%c${message}`,
            "color: red; text-weight: bold",
            "color: white",
          );
          return;
        }

        const input = await inputResponse.text();

        console.group(`%cDay ${day}, ${year}`, "color: yellow");
        solve(solution, input.trim());
        console.groupEnd();
      }
    }
  }
}

if (import.meta.main) {
  await run();
}
