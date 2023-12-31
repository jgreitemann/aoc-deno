import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  cloneGraph,
  contract,
  findCut,
  Graph,
  parseWiringDiagram,
} from "./day25.ts";

const EXAMPLE_INPUT = `jqt: rhn xhk nvd
rsh: frs pzl lsr
xhk: hfx
cmg: qnr nvd lhk bvb
rhn: xhk bvb hfx
bvb: xhk hfx
pzl: lsr hfx nvd
qnr: nvd
ntq: jqt hfx bvb xhk
nvd: lhk
lsr: lhk
rzs: qnr cmg lsr rsh
frs: qnr lhk lsr`;

const EXAMPLE_GRAPH: Graph = new Map([
  ["jqt", { weight: 1, edges: ["rhn", "xhk", "nvd", "ntq"] }],
  ["rsh", { weight: 1, edges: ["frs", "pzl", "lsr", "rzs"] }],
  ["xhk", { weight: 1, edges: ["hfx", "jqt", "rhn", "bvb", "ntq"] }],
  ["cmg", { weight: 1, edges: ["qnr", "nvd", "lhk", "bvb", "rzs"] }],
  ["rhn", { weight: 1, edges: ["xhk", "bvb", "hfx", "jqt"] }],
  ["bvb", { weight: 1, edges: ["xhk", "hfx", "cmg", "rhn", "ntq"] }],
  ["pzl", { weight: 1, edges: ["lsr", "hfx", "nvd", "rsh"] }],
  ["qnr", { weight: 1, edges: ["nvd", "cmg", "rzs", "frs"] }],
  ["ntq", { weight: 1, edges: ["jqt", "hfx", "bvb", "xhk"] }],
  ["nvd", { weight: 1, edges: ["lhk", "jqt", "cmg", "pzl", "qnr"] }],
  ["lsr", { weight: 1, edges: ["lhk", "rsh", "pzl", "rzs", "frs"] }],
  ["rzs", { weight: 1, edges: ["qnr", "cmg", "lsr", "rsh"] }],
  ["frs", { weight: 1, edges: ["qnr", "lhk", "lsr", "rsh"] }],
  ["hfx", { weight: 1, edges: ["xhk", "rhn", "bvb", "pzl", "ntq"] }],
  ["lhk", { weight: 1, edges: ["cmg", "nvd", "lsr", "frs"] }],
]);

Deno.test("Graph is parsed and edges are mirrored", () => {
  assertEquals(parseWiringDiagram(EXAMPLE_INPUT), EXAMPLE_GRAPH);
});

Deno.test("Graph edges can be contracted", () => {
  const contractedGraph = cloneGraph(EXAMPLE_GRAPH);
  contract(contractedGraph, ["nvd", "lhk"]);
  assertEquals(
    contractedGraph,
    new Map([
      ["jqt", { weight: 1, edges: ["rhn", "xhk", "nvd", "ntq"] }],
      ["rsh", { weight: 1, edges: ["frs", "pzl", "lsr", "rzs"] }],
      ["xhk", { weight: 1, edges: ["hfx", "jqt", "rhn", "bvb", "ntq"] }],
      ["cmg", { weight: 1, edges: ["qnr", "nvd", "nvd", "bvb", "rzs"] }],
      ["rhn", { weight: 1, edges: ["xhk", "bvb", "hfx", "jqt"] }],
      ["bvb", { weight: 1, edges: ["xhk", "hfx", "cmg", "rhn", "ntq"] }],
      ["pzl", { weight: 1, edges: ["lsr", "hfx", "nvd", "rsh"] }],
      ["qnr", { weight: 1, edges: ["nvd", "cmg", "rzs", "frs"] }],
      ["ntq", { weight: 1, edges: ["jqt", "hfx", "bvb", "xhk"] }],
      ["nvd", {
        weight: 2,
        edges: ["jqt", "cmg", "pzl", "qnr", "cmg", "lsr", "frs"],
      }],
      ["lsr", { weight: 1, edges: ["nvd", "rsh", "pzl", "rzs", "frs"] }],
      ["rzs", { weight: 1, edges: ["qnr", "cmg", "lsr", "rsh"] }],
      ["frs", { weight: 1, edges: ["qnr", "nvd", "lsr", "rsh"] }],
      ["hfx", { weight: 1, edges: ["xhk", "rhn", "bvb", "pzl", "ntq"] }],
    ]),
  );
  contract(contractedGraph, ["xhk", "hfx"]);
  assertEquals(
    contractedGraph,
    new Map([
      ["jqt", { weight: 1, edges: ["rhn", "xhk", "nvd", "ntq"] }],
      ["rsh", { weight: 1, edges: ["frs", "pzl", "lsr", "rzs"] }],
      ["xhk", {
        weight: 2,
        edges: ["jqt", "rhn", "bvb", "ntq", "rhn", "bvb", "pzl", "ntq"],
      }],
      ["cmg", { weight: 1, edges: ["qnr", "nvd", "nvd", "bvb", "rzs"] }],
      ["rhn", { weight: 1, edges: ["xhk", "bvb", "xhk", "jqt"] }],
      ["bvb", { weight: 1, edges: ["xhk", "xhk", "cmg", "rhn", "ntq"] }],
      ["pzl", { weight: 1, edges: ["lsr", "xhk", "nvd", "rsh"] }],
      ["qnr", { weight: 1, edges: ["nvd", "cmg", "rzs", "frs"] }],
      ["ntq", { weight: 1, edges: ["jqt", "xhk", "bvb", "xhk"] }],
      ["nvd", {
        weight: 2,
        edges: ["jqt", "cmg", "pzl", "qnr", "cmg", "lsr", "frs"],
      }],
      ["lsr", { weight: 1, edges: ["nvd", "rsh", "pzl", "rzs", "frs"] }],
      ["rzs", { weight: 1, edges: ["qnr", "cmg", "lsr", "rsh"] }],
      ["frs", { weight: 1, edges: ["qnr", "nvd", "lsr", "rsh"] }],
    ]),
  );
  contract(contractedGraph, ["cmg", "nvd"]);
  assertEquals(
    contractedGraph,
    new Map([
      ["jqt", { weight: 1, edges: ["rhn", "xhk", "cmg", "ntq"] }],
      ["rsh", { weight: 1, edges: ["frs", "pzl", "lsr", "rzs"] }],
      ["xhk", {
        weight: 2,
        edges: ["jqt", "rhn", "bvb", "ntq", "rhn", "bvb", "pzl", "ntq"],
      }],
      ["cmg", {
        weight: 3,
        edges: ["qnr", "bvb", "rzs", "jqt", "pzl", "qnr", "lsr", "frs"],
      }],
      ["rhn", { weight: 1, edges: ["xhk", "bvb", "xhk", "jqt"] }],
      ["bvb", { weight: 1, edges: ["xhk", "xhk", "cmg", "rhn", "ntq"] }],
      ["pzl", { weight: 1, edges: ["lsr", "xhk", "cmg", "rsh"] }],
      ["qnr", { weight: 1, edges: ["cmg", "cmg", "rzs", "frs"] }],
      ["ntq", { weight: 1, edges: ["jqt", "xhk", "bvb", "xhk"] }],
      ["lsr", { weight: 1, edges: ["cmg", "rsh", "pzl", "rzs", "frs"] }],
      ["rzs", { weight: 1, edges: ["qnr", "cmg", "lsr", "rsh"] }],
      ["frs", { weight: 1, edges: ["qnr", "cmg", "lsr", "rsh"] }],
    ]),
  );
});

Deno.test("The cut involving three wires is found (eventually)", () => {
  assertEquals(findCut(EXAMPLE_GRAPH).sort(), [6, 9]);
});
