import { Solution } from "../solution.ts";
import { sum, zip } from "../utils/iter.ts";

export default <Solution<number[][]>> {
  parse: parseHistories,
  part1(histories: number[][]): string {
    return sum(histories.map(extrapolateForward)).toString();
  },
  part2(histories: number[][]): string {
    return sum(histories.map(extrapolateBackwards)).toString();
  },
};

export function parseHistories(input: string): number[][] {
  return input
    .split("\n")
    .map((line) => line.split(" ").map((val) => +val));
}

export function extrapolate(history: number[]): [number, number] {
  if (history.every((val) => val === 0)) {
    return [0, 0];
  } else {
    const derivative = zip(history, history.slice(1))
      .map(([left, right]) => right - left)
      .collect();
    const [frontDerivative, backDerivative] = extrapolate(derivative);
    return [
      history[0] - frontDerivative,
      history[history.length - 1] + backDerivative,
    ];
  }
}

export function extrapolateForward(history: number[]): number {
  return extrapolate(history)[1];
}

export function extrapolateBackwards(history: number[]): number {
  return extrapolate(history)[0];
}
