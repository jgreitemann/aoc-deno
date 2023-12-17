import { Solution } from "../solution.ts";
import { range, sum } from "../utils/iter.ts";

export default <Solution<string[]>> {
  parse(input: string): string[] {
    return input.split(",");
  },

  part1(instructions: string[]): number {
    return sum(instructions.map(calculateHASH));
  },

  part2(instructions: string[]): number {
    return totalFocusingPower(carryOutHASHMAP(instructions));
  },
};

export function calculateHASH(word: string): number {
  return range(0, word.length)
    .map((i) => word.charCodeAt(i))
    .fold((hash, ascii) => (hash + ascii) * 17 % 256, 0);
}

export type Box = Map<string, number>;

function applyHASHMAPInstruction(
  boxes: Box[],
  instruction: string,
): Box[] {
  const match = instruction.match(
    /^([a-z]+)([-=])([0-9]*)$/,
  );
  if (match === null) {
    throw new Error(`instruction did not match: ${instruction}`);
  }

  const [_, label, operator, lens] = match;
  const hash = calculateHASH(label);

  switch (operator) {
    case "-":
      if (boxes[hash] !== undefined) {
        boxes[hash].delete(label);
        if (boxes[hash].size === 0) {
          delete boxes[hash];
        }
      }
      break;
    case "=":
      (boxes[hash] ?? (boxes[hash] = new Map())).set(label, +lens);
      break;
    default:
      throw new Error(`invalid operator: ${operator}`);
  }

  return boxes;
}

export function carryOutHASHMAP(instructions: string[]): Box[] {
  return instructions.reduce(applyHASHMAPInstruction, []);
}

export function totalFocusingPower(boxes: Box[]): number {
  return sum(boxes
    .flatMap((box, boxIdx) =>
      [...box.values()]
        .map((focalLength, slotIdx) =>
          (boxIdx + 1) * (slotIdx + 1) * focalLength
        )
    ));
}
