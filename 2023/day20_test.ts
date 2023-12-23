import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  Broadcaster,
  Conjunction,
  extendedEuclidean,
  findSubgraphs,
  FlipFlop,
  Module,
  parseConfiguration,
  pushButton,
  pushButtonManyTimes,
  pushesUntilReceiverTriggered,
  pushesUntilSubgraphsLineUp,
} from "./day20.ts";
import { iter } from "../utils/iter.ts";

const SIMPLE_EXAMPLE_INPUT = `broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`;

const SIMPLE_EXAMPLE_CONFIG = () =>
  new Map<string, Module>([
    ["broadcaster", new Broadcaster(["a", "b", "c"])],
    ["a", new FlipFlop(["b"])],
    ["b", new FlipFlop(["c"])],
    ["c", new FlipFlop(["inv"])],
    ["inv", new Conjunction(["a"]).connect("c")],
  ]);

const INTERESTING_EXAMPLE_INPUT = `broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output`;

const INTERESTING_EXAMPLE_CONFIG = () =>
  new Map<string, Module>([
    ["broadcaster", new Broadcaster(["a"])],
    ["a", new FlipFlop(["inv", "con"])],
    ["inv", new Conjunction(["b"]).connect("a")],
    ["b", new FlipFlop(["con"])],
    ["con", new Conjunction(["output"]).connect("a").connect("b")],
  ]);

Deno.test("Input is parsed into initial configuration", () => {
  assertEquals(
    parseConfiguration(SIMPLE_EXAMPLE_INPUT),
    SIMPLE_EXAMPLE_CONFIG(),
  );
  assertEquals(
    parseConfiguration(INTERESTING_EXAMPLE_INPUT),
    INTERESTING_EXAMPLE_CONFIG(),
  );
});

Deno.test("In the simple example, the configuration returns to the initial state after button press", () => {
  const config = SIMPLE_EXAMPLE_CONFIG();
  assertEquals(pushButton(config), { low: 8, high: 4 });
  assertEquals(config, SIMPLE_EXAMPLE_CONFIG());
});

Deno.test("In the more interesting example, the configuration returns to the initial state only after four button presses", () => {
  const config = INTERESTING_EXAMPLE_CONFIG();
  assertEquals(pushButton(config), { low: 4, high: 4 });
  assertNotEquals(config, INTERESTING_EXAMPLE_CONFIG());

  assertEquals(pushButton(config), { low: 4, high: 2 });
  assertNotEquals(config, INTERESTING_EXAMPLE_CONFIG());

  assertEquals(pushButton(config), { low: 5, high: 3 });
  assertNotEquals(config, INTERESTING_EXAMPLE_CONFIG());

  assertEquals(pushButton(config), { low: 4, high: 2 });
  assertEquals(config, INTERESTING_EXAMPLE_CONFIG());
});

Deno.test("Pulse statistics after 1000 button presses are correct", () => {
  assertEquals(pushButtonManyTimes(1000, SIMPLE_EXAMPLE_CONFIG()), {
    low: 8000,
    high: 4000,
  });
  assertEquals(pushButtonManyTimes(1000, INTERESTING_EXAMPLE_CONFIG()), {
    low: 4250,
    high: 2750,
  });
});

const TEST_EXAMPLE_INPUT = `broadcaster -> a, f
%a -> b
%b -> c, e
%c -> d
%d -> e
&e -> c, l
%f -> g, k
%g -> h
%h -> i
%i -> j, k
%j -> k
&k -> g, i, m
&l -> n
&m -> n
&n -> rx`;

const TEST_EXAMPLE_SUBGRAPH_1 = `broadcaster -> a
%a -> b
%b -> c, e
%c -> d
%d -> e
&e -> c, rx`;

const TEST_EXAMPLE_SUBGRAPH_2 = `broadcaster -> f
%f -> g, k
%g -> h
%h -> i
%i -> j, k
%j -> k
&k -> g, i, rx`;

Deno.test("Naive approach finds number of button presses until rx is signaled for the test example", () => {
  assertEquals(
    iter(pushesUntilReceiverTriggered(parseConfiguration(TEST_EXAMPLE_INPUT)))
      .first(),
    47,
  );
});

Deno.test("Find independent subgraphs feeding into the penultimate conjunction", () => {
  assertEquals(findSubgraphs(parseConfiguration(TEST_EXAMPLE_INPUT)), [
    parseConfiguration(TEST_EXAMPLE_SUBGRAPH_1),
    parseConfiguration(TEST_EXAMPLE_SUBGRAPH_2),
  ]);
});

Deno.test("Subgraphs have independent periods", () => {
  assertEquals(
    iter(
      pushesUntilReceiverTriggered(parseConfiguration(TEST_EXAMPLE_SUBGRAPH_1)),
    ).take(5).collect(),
    [10, 12, 12, 12, 12],
  );
  assertEquals(
    iter(
      pushesUntilReceiverTriggered(parseConfiguration(TEST_EXAMPLE_SUBGRAPH_2)),
    ).take(5).collect(),
    [25, 22, 22, 22, 22],
  );
});

Deno.test("Number of button pushes until subgraphs line up it correctly determined", () => {
  assertEquals(pushesUntilSubgraphsLineUp([10, 12], [25, 22]), 47);
  assertEquals(pushesUntilSubgraphsLineUp([15, 15], [20, 20]), 60);
  assertEquals(
    pushesUntilSubgraphsLineUp(
      [4019, 4019],
      [3943, 3943],
      [3947, 3947],
      [4007, 4007],
    ),
    250628960065793,
  );
});

Deno.test("Extended Euclidean algorithm is correct", () => {
  assertEquals(extendedEuclidean(12, 22), [2, -1]);
  assertEquals(extendedEuclidean(240, 46), [-9, 47]);
});
