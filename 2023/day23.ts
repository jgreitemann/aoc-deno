import { HashMap } from "https://deno.land/x/rimbu@1.0.2/hashed/mod.ts";
import { Point, vectorCompare } from "../utils/vec.ts";
import { neighbors } from "../utils/topology.ts";
import { iter } from "../utils/iter.ts";
import { Solution } from "../solution.ts";

export default <Solution<Graph>> {
  parse: parseMap,
  part1: longestPathDirected,
  part2(directedGraph: Graph): number {
    const goal = findGoal(directedGraph);
    const undirectedGraph = makeUndirected(directedGraph);
    return longestPathUndirected(undirectedGraph, goal);
  },
};

export type Graph = Node[];

export type Node = {
  outbound: Edge[];
};

export type Edge = {
  destination: number;
  weight: number;
};

const PATH_CHARS = [".", ">", "v"];

export function tracePath(
  origin: Point,
  start: Point,
  map: string[],
): { to: Point; distance: number } {
  let distance = 0;
  let prev = origin;
  let current = [start];
  do {
    const next = iter(neighbors(current[0]))
      .filter(([row, col]) => PATH_CHARS.includes(map.at(row)?.at(col) ?? "#"))
      .filter((c) => !vectorCompare(c, prev))
      .collect();
    prev = current[0];
    current = next;
    distance += 1;
  } while (current.length === 1);

  return { to: prev, distance };
}

function* outboundNeighbors(
  [row, col]: Point,
  map: string[],
): Generator<Point> {
  if (PATH_CHARS.includes(map.at(row)?.at(col + 1) ?? "#")) {
    yield [row, col + 1];
  }
  if (PATH_CHARS.includes(map.at(row + 1)?.at(col) ?? "#")) {
    yield [row + 1, col];
  }
}

export function parseMap(input: string): Graph {
  const map = input.split("\n");

  const vertices = HashMap.of([[0, 1] as Point, 0]).toBuilder();
  const nodes: Node[] = [{ outbound: [] }];
  let pendingNodes: Point[] = [[0, 1]];

  while (pendingNodes.length > 0) {
    pendingNodes = pendingNodes
      .flatMap((nodePos) => {
        const nodeIdx = vertices.get(nodePos);
        if (nodeIdx === undefined) {
          throw new Error("encountered unknown node");
        }
        return iter(outboundNeighbors(nodePos, map))
          .filterMap((n) => {
            const { to, distance } = tracePath(nodePos, n, map);
            const isNewNode = vertices.modifyAt(to, {
              ifNew: () => {
                nodes.push({ outbound: [] });
                return nodes.length - 1;
              },
            });
            const destination = vertices.get(to)!;
            nodes[nodeIdx].outbound.push({ destination, weight: distance });
            return isNewNode ? to : undefined;
          })
          .collect();
      });
  }

  return nodes;
}

export function makeUndirected(graph: Graph): Graph {
  const undirectedGraph = graph.map(({ outbound }) => ({
    outbound: [...outbound],
  }));
  graph.forEach((node, nodeIdx) => {
    for (const { destination, weight } of node.outbound) {
      undirectedGraph[destination].outbound.push({
        destination: nodeIdx,
        weight,
      });
    }
  });
  return undirectedGraph;
}

function findGoal(graph: Graph): number {
  return graph.findIndex(({ outbound }) => outbound.length === 0);
}

export function longestPathDirected(graph: Graph): number {
  const pathLengths = Array(graph.length).fill(0);
  let pendingNodes = [0];
  while (pendingNodes.length > 0) {
    pendingNodes = pendingNodes
      .flatMap((nodeIdx) =>
        iter(graph[nodeIdx].outbound)
          .filterMap(({ destination, weight }) => {
            const distance = pathLengths[nodeIdx] + weight;
            if (pathLengths[destination] < distance) {
              pathLengths[destination] = distance;
              return destination;
            } else {
              return undefined;
            }
          })
          .collect()
      );
  }

  return pathLengths[findGoal(graph)];
}

export function longestPathUndirected(graph: Graph, goalIndex: number): number {
  const longestPathToGoal = (...path: number[]): number => {
    return Math.max(
      ...graph[path[path.length - 1]].outbound
        .filter(({ destination }) => !path.includes(destination))
        .map(({ destination, weight }) =>
          destination === goalIndex
            ? weight
            : weight + longestPathToGoal(...path, destination)
        ),
    );
  };

  return longestPathToGoal(0);
}
