import { Hasher, HashMap } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { Solution } from "../solution.ts";
import { Vector, vectorAdd } from "../utils/vec.ts";
import { range, sum } from "../utils/iter.ts";

enum Axis {
  Horizontal = -1,
  Vertical = 1,
}

export const NormalCrucibleRules = precalculateRules(1, 3);
export const UltraCrucibleRules = precalculateRules(4, 10);

export default <Solution<number[][]>> {
  parse(input: string): number[][] {
    return input.split("\n")
      .map((line) => line.split("").map((l) => +l));
  },

  part1: minHeatLoss(NormalCrucibleRules),
  part2: minHeatLoss(UltraCrucibleRules),
};

type State = {
  pos: Vector<2>;
  axis: Axis;
};

const FlatHashMap = HashMap.createContext({
  hasher: Hasher.anyFlatHasher(),
});

export function minHeatLoss(rules: MovementRules) {
  return (map: number[][]): number => {
    const height = map.length;
    const width = map[0].length;

    const minLoss = FlatHashMap.builder<State, number>();
    minLoss.set({ pos: [0, 0], axis: Axis.Horizontal }, 0);
    minLoss.set({ pos: [0, 0], axis: Axis.Vertical }, 0);

    type StateWithLoss = { state: State; loss: number };
    let looseEnds: StateWithLoss[] = [
      { state: { pos: [0, 0], axis: Axis.Horizontal }, loss: 0 },
      { state: { pos: [0, 0], axis: Axis.Vertical }, loss: 0 },
    ];

    while (looseEnds.length > 0) {
      looseEnds = looseEnds
        .flatMap(({ state, loss }) => {
          return neighbors(state, rules)
            .filter(([[row, col]]) =>
              row >= 0 && col >= 0 && row < height && col < width
            )
            .map((positions) => ({
              state: { pos: positions[0], axis: -state.axis },
              loss: loss + sum(positions.map(([row, col]) => map[row][col])),
            }));
        })
        .filter(({ state, loss }) =>
          minLoss.modifyAt(state, {
            ifNew: loss,
            ifExists: (oldLoss) => Math.min(oldLoss, loss),
          })
        );
    }

    const targetPos: Vector<2> = [height - 1, width - 1];
    return Math.min(
      minLoss.get({ pos: targetPos, axis: Axis.Horizontal })!,
      minLoss.get({ pos: targetPos, axis: Axis.Vertical })!,
    );
  };
}

type MovementRules = {
  [axis in Axis]: readonly (readonly Readonly<Vector<2>>[])[];
};

function precalculateRules(min: number, max: number): MovementRules {
  return {
    [Axis.Vertical]: range(min, max + 1)
      .flatMap((col) => [
        range(0, col).map((c) => [0, col - c] as const).collect(),
        range(0, col).map((c) => [0, -col + c] as const).collect(),
      ])
      .collect(),
    [Axis.Horizontal]: range(min, max + 1)
      .flatMap((row) => [
        range(0, row).map((r) => [row - r, 0] as const).collect(),
        range(0, row).map((r) => [-row + r, 0] as const).collect(),
      ])
      .collect(),
  };
}

function neighbors({ pos, axis }: State, rules: MovementRules): Vector<2>[][] {
  return rules[axis]
    .map((deltas) => deltas.map((delta) => vectorAdd<2>(pos, delta)));
}
