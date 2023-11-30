/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import { Solution } from "./solution.ts";
import { Part, SpawnTask, WorkerProgress } from "./messages.ts";

function timed<T>(f: () => T): { result: T; elapsedMs: number } {
  const start = performance.now();
  const result = f();
  const end = performance.now();
  return { result, elapsedMs: end - start };
}

function solvePart(part: Part, fn: () => string) {
  report({ part, answer: { kind: "computing" } });
  const { result: answer, elapsedMs } = timed(fn);
  report({ part, answer: { kind: "complete", answer, elapsedMs } });
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

function report(msg: WorkerProgress) {
  self.postMessage(msg);
}

self.onmessage = async (e: MessageEvent<SpawnTask>) => {
  const { default: solution } = await import(
    e.data.module
  );

  solve(solution, e.data.input.trim());

  self.close();
};
