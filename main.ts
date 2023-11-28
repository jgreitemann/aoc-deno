import { format } from "https://deno.land/std@0.208.0/fmt/duration.ts";

import { cachingFetch } from "./cache.ts";
import { Solution } from "./solution.ts";

function timed<T>(f: () => T): { result: T; elapsedMs: number } {
  const start = performance.now();
  const result = f();
  const end = performance.now();
  return { result, elapsedMs: end - start };
}

enum Part {
  Part1 = "Part 1",
  Part2 = "Part 2",
}

function solvePart(part: Part, fn: () => string) {
  let { result, elapsedMs } = timed(fn);
  if (elapsedMs > 1) {
    elapsedMs = Math.round(elapsedMs);
  } else {
    elapsedMs = Math.round(elapsedMs * 1000) / 1000;
  }
  const elapsedFormat = elapsedMs > 0
    ? format(elapsedMs, { ignoreZero: true })
    : "0ms";
  console.log(
    `%c${part}: %c${result}%c [${elapsedFormat}]`,
    "color: gray",
    "color: white; font-weight: bold",
    "color: gray",
  );
}

function solve<T>(solution: Solution<T>, input: string) {
  const data = solution.parse(input);
  if (solution.part1) {
    solvePart(Part.Part1, () => solution.part1!(data));
  }
  if (solution.part2) {
    solvePart(Part.Part2, () => solution.part2!(data));
  }
}

async function run() {
  const session = Deno.env.get("SESSION");

  if (session === undefined) {
    console.error(
      "%cThe SESSION environment variable is not defined!",
      "color: red; text-weight: bold",
    );
    return;
  }

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
