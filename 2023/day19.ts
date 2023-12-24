import { Solution } from "../solution.ts";
import { product, sum } from "../utils/iter.ts";

export default <Solution<System>> {
  parse: parseInput,
  part1: totalRatingOfAcceptedParts,
  part2({ workflows }: System): number {
    return numberOfAcceptableParts(workflows);
  },
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

export type Interval = {
  start: number;
  end: number;
};

export function splitInterval(
  interval: Interval,
  relation: "<" | ">",
  threshold: number,
): [Interval | undefined, Interval | undefined] {
  if (relation === "<") {
    if (threshold >= interval.end) {
      return [interval, undefined];
    } else if (threshold <= interval.start) {
      return [undefined, interval];
    } else {
      return [
        { start: interval.start, end: threshold },
        { start: threshold, end: interval.end },
      ];
    }
  } else {
    if (threshold >= interval.end - 1) {
      return [undefined, interval];
    } else if (threshold < interval.start) {
      return [interval, undefined];
    } else {
      return [
        { start: threshold + 1, end: interval.end },
        { start: interval.start, end: threshold + 1 },
      ];
    }
  }
}

type RatingRange = { [category in RatingCategory]: Interval };
const fullRange: Interval = { start: 1, end: 4001 };

export function numberOfAcceptableParts(
  workflows: Map<string, Workflow>,
  workflowName = "in",
  ratings = { x: fullRange, m: fullRange, a: fullRange, s: fullRange },
): number {
  const { rules, defaultOutcome } = workflows.get(workflowName)!;

  const numberOfPartsForOutcome = (ratings: RatingRange, outcome: Outcome) => {
    if (outcome === true) {
      return numberOfParts(ratings);
    } else if (outcome !== false) {
      return numberOfAcceptableParts(
        workflows,
        outcome,
        ratings,
      );
    } else {
      return 0;
    }
  };

  const [acceptedByRules, defaultedRatings] = rules.reduce(
    (
      [acceptedSoFar, remainingRatings]: [number, RatingRange | undefined],
      rule,
    ): [number, RatingRange | undefined] => {
      if (remainingRatings === undefined) {
        return [acceptedSoFar, undefined];
      }

      const [trueRange, falseRange] = splitInterval(
        remainingRatings[rule.category],
        rule.relation,
        rule.threshold,
      );

      if (trueRange !== undefined) {
        acceptedSoFar += numberOfPartsForOutcome(
          { ...remainingRatings, [rule.category]: trueRange },
          rule.outcome,
        );
      }

      return [
        acceptedSoFar,
        falseRange !== undefined
          ? { ...remainingRatings, [rule.category]: falseRange }
          : undefined,
      ];
    },
    [0, ratings],
  );

  if (defaultedRatings !== undefined) {
    return acceptedByRules +
      numberOfPartsForOutcome(defaultedRatings, defaultOutcome);
  } else {
    return acceptedByRules;
  }
}

function numberOfParts(ratings: RatingRange): number {
  return product(Object.values(ratings).map(({ start, end }) => end - start));
}
