export enum Part {
  Part1 = "Part 1",
  Part2 = "Part 2",
}

export type Subtask = {
  part: Part;
  day: number;
  year: number;
};

export type SpawnTask = {
  module: string;
  input: string;
};

export type WorkerProgress = {
  part: Part;
  answer: Answer;
};

export type Answer =
  | {
    kind: "computing";
  }
  | {
    kind: "complete";
    answer: string;
    elapsedMs: number;
  };
