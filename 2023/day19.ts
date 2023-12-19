import { Solution } from "../solution.ts";
import { sum } from "../utils/iter.ts";

export default <Solution<System>> {
  parse: parseInput,
  part1: totalRatingOfAcceptedParts,
};

type System = {
  workflows: Map<string, Workflow>;
  parts: Rating[];
};

export type Workflow = {
  rules: Rule[];
  defaultOutcome: Outcome;
};

export type Rating = {
  x: number;
  m: number;
  a: number;
  s: number;
};

export type RatingCategory = keyof Rating;

export type Outcome = string | boolean;

export type Rule = {
  category: RatingCategory;
  relation: "<" | ">";
  threshold: number;
  outcome: Outcome;
};

export function parseInput(input: string): System {
  const [workflowPart, ratingsPart] = input.split("\n\n");

  const parseOutcome = (s: string): Outcome => {
    if (s === "A") {
      return true;
    } else if (s === "R") {
      return false;
    } else {
      return s;
    }
  };

  return {
    workflows: new Map([...workflowPart
      .matchAll(/([a-z]+)\{([^,\n]+(?:,[^,\n]+)*),([a-z]+|A|R)\}/g)]
      .map(
        ([_, name, rules, d]) => {
          return [name, {
            rules: rules
              .split(",")
              .map((rule) => {
                const [_, cat, relation, threshold, outcome] = rule.match(
                  /^([xmas])([<>])([0-9]+):([a-z]+|A|R)$/,
                )!;
                return {
                  category: cat as RatingCategory,
                  relation: relation as "<" | ">",
                  threshold: +threshold,
                  outcome: parseOutcome(outcome),
                };
              }),
            defaultOutcome: parseOutcome(d),
          }];
        },
      )),
    parts: ratingsPart
      .split("\n")
      .map((line) => {
        const [_, x, m, a, s] = line.match(
          /^\{x=(\d+),m=(\d+),a=(\d+),s=(\d+)\}$/,
        )!;
        return {
          x: +x,
          m: +m,
          a: +a,
          s: +s,
        };
      }),
  };
}

export function isPartAccepted(
  part: Rating,
  workflows: Map<string, Workflow>,
  workflowName = "in",
): boolean {
  const { rules, defaultOutcome } = workflows.get(workflowName)!;
  const outcome = rules
    .find((rule) => condition(rule, part))
    ?.outcome ??
    defaultOutcome;
  if (typeof outcome === "string") {
    return isPartAccepted(part, workflows, outcome);
  } else {
    return outcome;
  }
}

function condition(
  { category, relation, threshold }: Rule,
  part: Rating,
): boolean {
  const value = part[category];
  return relation === "<" ? value < threshold : value > threshold;
}

export function totalRatingOfAcceptedParts(
  { parts, workflows }: System,
): number {
  return sum(
    parts
      .filter((p) => isPartAccepted(p, workflows))
      .map(({ x, m, a, s }) => x + m + a + s),
  );
}
