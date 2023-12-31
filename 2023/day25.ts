import { Solution } from "../solution.ts";
import { iter, product, sum } from "../utils/iter.ts";

export default <Solution<Graph>> {
  parse: parseWiringDiagram,
  part1(graph: Graph): number {
    return product(findCut(graph));
  },
};

export type Graph = Map<string, Node>;
export type Node = {
  weight: number;
  edges: string[];
};

export function parseWiringDiagram(input: string): Graph {
  const inputEdges: [string, string[]][] = input.split("\n")
    .map((line) => {
      const [node, edges] = line.split(": ");
      return [node, edges.split(" ")] as const;
    });
  const graph = new Map(
    inputEdges.map(([node, edges]) => [node, { weight: 1, edges: [...edges] }]),
  );

  for (const [from, edges] of inputEdges) {
    for (const to of edges) {
      if (!graph.has(to)) {
        graph.set(to, { weight: 1, edges: [] });
      }
      graph.get(to)?.edges?.push(from);
    }
  }

  return graph;
}

export function cloneGraph(graph: Graph): Graph {
  return new Map(
    iter(graph.entries())
      .map((
        [node, { weight, edges }],
      ) => [node, { weight, edges: [...edges] }]),
  );
}

export function contract(graph: Graph, [node1, node2] = pickRandomEdge(graph)) {
  const contractedNode = graph.get(node1)!;
  const otherNode = graph.get(node2)!;
  contractedNode.edges = contractedNode.edges
    .filter((n) => n !== node2)
    .concat(otherNode.edges.filter((n) => n !== node1));
  contractedNode.weight += otherNode.weight;
  graph.delete(node2);

  for (const node of graph.values()) {
    node.edges = node.edges.map((edge) => edge === node2 ? node1 : edge);
  }
}

function pickRandomEdge(graph: Graph): [string, string] {
  const num = sum(iter(graph.values()).map(({ edges }) => edges.length));
  let edgeIndex = Math.floor(Math.random() * num);
  for (const [from, { edges }] of graph) {
    if (edges.length > edgeIndex) {
      return [from, edges[edgeIndex]];
    } else {
      edgeIndex -= edges.length;
    }
  }
  throw new Error("unreachable");
}

export function findCut(graph: Graph, target = 3): [number, number] {
  while (true) {
    const contractedGraph = cloneGraph(graph);
    while (contractedGraph.size > 2) {
      contract(contractedGraph);
    }
    const [one, other] = contractedGraph.values();
    if (one.edges.length === target) {
      return [one.weight, other.weight];
    }
  }
}
