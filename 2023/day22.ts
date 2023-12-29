import { Solution } from "../solution.ts";
import { Iter, iter, range, sum } from "../utils/iter.ts";
import { Point, Vector, vectorSub } from "../utils/vec.ts";

export default <Solution<SupportNode[]>> {
  parse(input: string): SupportNode[] {
    const { graph } = settleBricks(parseBricks(input));
    return graph;
  },
  part1(graph: SupportNode[]): number {
    return identifyIndividuallyExpendableBricks(graph).length;
  },
  part2(graph: SupportNode[]): number {
    return sum(numbersOfFallingBricks(graph));
  },
};

export type Brick = {
  origin: Readonly<Vector<3>>;
  axis: 0 | 1 | 2;
  extent: number;
};

export type SupportNode = {
  supports: number[];
  supportedBy: number[];
};

export type SettledState = {
  stack: Brick[];
  graph: SupportNode[];
};

export function parseBricks(input: string): Brick[] {
  return input
    .split("\n")
    .map((line) => {
      const [lhs, rhs] = line.split("~").map((p) =>
        p.split(",").map((x) => +x) as unknown as Readonly<Vector<3>>
      );
      const delta = vectorSub<3>(rhs, lhs);
      const axisIdx = delta.findIndex((d) => d > 0);
      const axis = Math.max(0, axisIdx) as 0 | 1 | 2;
      return {
        origin: delta[axis] < 0 ? rhs : lhs,
        axis,
        extent: Math.abs(delta[axis]) + 1,
      };
    })
    .sort((lhs, rhs) => lhs.origin[2] - rhs.origin[2]);
}

function heightAt(
  stack: Brick[],
  [x, y]: Point,
): { index: number; height: number } {
  const index = stack.findLastIndex((b) => (
    (b.axis === 0 && b.origin[1] === y && b.origin[0] <= x &&
      x < b.origin[0] + b.extent) ||
    (b.axis === 1 && b.origin[0] === x && b.origin[1] <= y &&
      y < b.origin[1] + b.extent) ||
    (b.axis === 2 && b.origin[0] === x && b.origin[1] === y)
  ));
  const hit = stack[index];
  const height = hit === undefined
    ? 0
    : hit.origin[2] + (hit.axis === 2 ? hit.extent - 1 : 0);
  return { index, height };
}

function brickShadow(brick: Brick): Iter<Point> {
  if (brick.axis === 2) {
    return iter([[brick.origin[0], brick.origin[1]] as const]);
  }

  return range(0, brick.extent)
    .map((c) => [
      brick.origin[0] + (brick.axis === 0 ? c : 0),
      brick.origin[1] + (brick.axis === 1 ? c : 0),
    ]);
}

function supportedHeight(
  brick: Brick,
  stack: Brick[],
): { height: number; indices: number[] } {
  const brickShadowHeights = brickShadow(brick)
    .map((p) => heightAt(stack, p))
    .collect();
  const maxHeight = Math.max(...brickShadowHeights.map(({ height }) => height));
  const indices = iter(brickShadowHeights)
    .filter(({ height }) => height === maxHeight)
    .map(({ index }) => index)
    .dedup()
    .collect();
  return { height: maxHeight, indices };
}

export function settleBricks(fallingBricks: Brick[]): SettledState {
  return fallingBricks.reduce((acc, brick, index) => {
    const { stack, graph } = acc;
    const { height, indices } = supportedHeight(brick, stack);
    stack.push({
      origin: [brick.origin[0], brick.origin[1], height + 1],
      axis: brick.axis,
      extent: brick.extent,
    });
    graph.push({
      supportedBy: indices.map((i) => i + 1),
      supports: [],
    });
    for (const supportingIndex of indices) {
      graph[supportingIndex + 1].supports.push(index + 1);
    }
    return acc;
  }, {
    stack: [] as Brick[],
    graph: [{ supportedBy: [], supports: [] }] as SupportNode[],
  });
}

export function identifyIndividuallyExpendableBricks(
  graph: SupportNode[],
): number[] {
  return iter(graph)
    .filterMap(({ supports }, index) => {
      if (
        supports.every((supportedIndex) =>
          graph[supportedIndex].supportedBy.length > 1
        )
      ) {
        return index;
      } else {
        return undefined;
      }
    })
    .collect();
}

export function numbersOfFallingBricks(graph: SupportNode[]): number[] {
  return graph
    .slice(1)
    .map(({ supports }, index) => {
      const falling = [index + 1];
      let supported = supports;

      while (supported.length > 0) {
        supported = supported
          .flatMap((supportedIndex) => {
            if (
              graph[supportedIndex].supportedBy
                .every((support) => falling.includes(support))
            ) {
              falling.push(supportedIndex);
              return graph[supportedIndex].supports;
            } else {
              return [];
            }
          });
      }

      falling.sort();

      return iter(falling).dedup().count() - 1;
    });
}
