import { Solution } from "../solution.ts";
import { iter, range } from "../utils/iter.ts";
import { Vector, vectorSub } from "../utils/vec.ts";

export default <Solution<Brick[]>> {
  parse: parseBricks,
  part1(bricks: Brick[]): number {
    const stack = settleBricks(bricks);
    return identifyIndividuallyExpendableBricks(stack).length;
  },
};

export type Brick = {
  origin: Readonly<Vector<3>>;
  axis: 0 | 1 | 2;
  extent: number;
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

function heightAt(stack: Brick[], x: number, y: number): number {
  const hit = stack.findLast((b) => (
    (b.axis === 0 && b.origin[1] === y && b.origin[0] <= x &&
      x < b.origin[0] + b.extent) ||
    (b.axis === 1 && b.origin[0] === x && b.origin[1] <= y &&
      y < b.origin[1] + b.extent) ||
    (b.axis === 2 && b.origin[0] === x && b.origin[1] === y)
  ));
  return hit === undefined
    ? 0
    : hit.origin[2] + (hit.axis === 2 ? hit.extent - 1 : 0);
}

function supportedHeight(brick: Brick, stack: Brick[]): number {
  return brick.axis === 0
    ? Math.max(
      ...range(brick.origin[0], brick.origin[0] + brick.extent)
        .map((x) => heightAt(stack, x, brick.origin[1])),
    )
    : (brick.axis === 1
      ? Math.max(
        ...range(brick.origin[1], brick.origin[1] + brick.extent)
          .map((y) => heightAt(stack, brick.origin[0], y)),
      )
      : heightAt(stack, brick.origin[0], brick.origin[1]));
}

export function settleBricks(fallingBricks: Brick[]): Brick[] {
  return fallingBricks.reduce((stack, brick) => {
    const height = supportedHeight(brick, stack) + 1;
    stack.push({
      origin: [brick.origin[0], brick.origin[1], height],
      axis: brick.axis,
      extent: brick.extent,
    });
    return stack;
  }, [] as Brick[]);
}

export function identifyIndividuallyExpendableBricks(stack: Brick[]): number[] {
  return iter(stack)
    .filterMap((_, index) => {
      const stackWithoutBrick = stack.slice(0, index);
      for (let j = index + 1; j < stack.length; ++j) {
        if (
          stack[j].origin[2] > supportedHeight(stack[j], stackWithoutBrick) + 1
        ) {
          return undefined;
        }
        stackWithoutBrick.push(stack[j]);
      }
      return index;
    })
    .collect();
}
