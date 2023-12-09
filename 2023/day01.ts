import { Solution } from "../solution.ts";
import { sum } from "../utils/iter.ts";

export default <Solution<string[]>> {
  parse(input: string): string[] {
    return input.split("\n");
  },

  part1(data: string[]): number {
    return sum(data.map(demangle));
  },

  part2(data: string[]): number {
    return sum(data.map(demangleWithWords));
  },
};

export function demangle(value: string): number {
  const digits = value.match(/[0-9]/g)!;
  return +(digits[0] + digits[digits.length - 1]);
}

const numberWords = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

export function demangleWithWords(value: string): number {
  const matches = value.matchAll(
    /(?=([0-9]|one|two|three|four|five|six|seven|eight|nine))/g,
  )!;

  const digits = [];
  for (const digitCaptures of matches) {
    const digit = digitCaptures[1];
    if (digit in numberWords) {
      digits.push(numberWords[digit as keyof typeof numberWords]);
    } else {
      digits.push(+digit);
    }
  }

  return digits[0] * 10 + digits[digits.length - 1];
}
