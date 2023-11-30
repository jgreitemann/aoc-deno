import { format } from "https://deno.land/std@0.208.0/fmt/duration.ts";
import * as tty from "https://deno.land/x/tty@0.1.4/mod.ts";

import { cachingFetch } from "./cache.ts";
import { Answer, Part, SpawnTask, WorkerProgress } from "./messages.ts";

type Answers = Partial<{ [part in `${Part}`]: Answer }>[][];

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

  const answers: Answers = [];

  for await (const yearEntry of Deno.readDir(".")) {
    if (!yearEntry.isDirectory || !yearEntry.name.startsWith("20")) {
      continue;
    }
    const year = +yearEntry.name;
    answers[year] = [];
    for await (const dayEntry of Deno.readDir("./" + year)) {
      const dayMatch = dayEntry.name.match(/day0*([1-9][0-9]*)\.ts/);
      if (!dayEntry.isFile || dayMatch === null) {
        continue;
      }
      const day = +dayMatch[1];
      answers[year][day] = {};

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

      const worker = new Worker(
        new URL("./worker.ts", import.meta.url).href,
        { type: "module" },
      );
      worker.onmessage = (msg: MessageEvent<WorkerProgress>) => {
        answers[year][day][msg.data.part] = msg.data.answer;
        report(answers);
      };

      const task: SpawnTask = {
        module: `./${yearEntry.name}/${dayEntry.name}`,
        input,
      };
      worker.postMessage(task);
    }
  }
}

function report(answers: Answers) {
  tty.clearScreenSync();
  tty.goHomeSync();
  for (const year in answers) {
    const days = answers[year];
    for (const day in days) {
      const parts = days[day];
      console.group(`%cDay ${day}, ${year}`, "color: yellow");

      for (const part of [Part.Part1, Part.Part2]) {
        const answer = parts[part];
        if (answer === undefined) {
          continue;
        }
        if (answer.kind === "computing") {
          console.log(
            `%c${part}: computing...`,
            "color: gray",
          );
        } else {
          const elapsedFormat = formatDuration(answer.elapsedMs);
          console.log(
            `%c${part}: %c${answer.answer}%c [${elapsedFormat}]`,
            "color: gray",
            "color: white; font-weight: bold",
            "color: gray",
          );
        }
      }
      console.groupEnd();
    }
  }
}

function formatDuration(elapsedMs: number): string {
  if (elapsedMs > 1) {
    elapsedMs = Math.round(elapsedMs);
  } else {
    elapsedMs = Math.round(elapsedMs * 1000) / 1000;
  }

  return elapsedMs > 0 ? format(elapsedMs, { ignoreZero: true }) : "0ms";
}

if (import.meta.main) {
  await run();
}
