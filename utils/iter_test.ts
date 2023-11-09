import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.201.0/assert/mod.ts";
import "./iter.ts";
import { zip } from "./iter.ts";

const primes = [2, 3, 5, 7, 11, 13];
const sum = (acc: number, elem: number) => acc + elem;
const sumSq = (acc: number, elem: number) => acc + elem * elem;
const isNotPrime = (n: number): boolean => {
  for (let m = 2; m <= n / 2; ++m) {
    if (n % m == 0) {
      return true;
    }
  }
  return false;
};

Deno.test("Iter is an iterable wrapper around Array", () => {
  const received: number[] = [];
  for (const elem of primes.iter()) {
    received.push(elem);
  }
  assertEquals(received, primes);
});

Deno.test("Iter is an iterable wrapper around a generator", () => {
  const primesGenerator = function* () {
    yield* primes;
  };
  const received: number[] = [];
  for (const elem of primesGenerator().iter()) {
    received.push(elem);
  }
  assertEquals(received, primes);
});

Deno.test("Array can be constructed from an Iter", () => {
  const received = Array.from(primes.iter());
  assertEquals(received, primes);
});

Deno.test("Iter.reduce aligns with Array.reduce", () => {
  assertEquals(primes.iter().reduce(sum), primes.reduce(sum));
  assertEquals(primes.iter().reduce(sumSq), primes.reduce(sumSq));
});

Deno.test("Iter.reduce over an empty sequence returns undefined", () => {
  assertEquals(([] as number[]).iter().reduce(sum), undefined);
});

Deno.test("Iter.fold aligns with Array.reduce", () => {
  assertEquals(primes.iter().fold(sum, 0), primes.reduce(sum, 0));
  assertEquals(primes.iter().fold(sum, 42), primes.reduce(sum, 42));
  assertEquals(primes.iter().fold(sumSq, 42), primes.reduce(sumSq, 42));
});

Deno.test("Iter.fold over an empty sequence returns the initial value", () => {
  assertEquals(([] as number[]).iter().fold(sum, 0), 0);
  assertEquals(([] as number[]).iter().fold(sum, 42), 42);
});

Deno.test("Iter.fold can work with heterogeneous types", () => {
  assertEquals(
    primes
      .iter()
      .fold(
        (acc: string, elem: number) => `${acc}-${elem}`,
        "seq",
      ),
    "seq-2-3-5-7-11-13",
  );
});

Deno.test("Iter.scan produces sequence of partial reductions", () => {
  const partialReductions = <U>(
    f: (acc: U, elem: number) => U,
    initial: U,
  ): U[] =>
    [...primes.keys()].map((n) => primes.slice(0, n + 1).reduce(f, initial));

  assertEquals(
    primes.iter().scan(sum, 0).collect(),
    partialReductions(sum, 0),
  );
  assertEquals(
    primes.iter().scan(sum, 42).collect(),
    partialReductions(sum, 42),
  );
  assertEquals(
    primes.iter().scan(sumSq, 42).collect(),
    partialReductions(sumSq, 42),
  );
});

Deno.test("Iter.scan terminates early when callback returns undefined", () => {
  function* counting() {
    let i = 0;
    while (true) {
      yield ++i;
    }
  }

  const sumUntil100 = (lhs: number, rhs: number) =>
    (lhs + rhs < 100) ? lhs + rhs : undefined;

  assertEquals(counting().iter().scan(sumUntil100, 0).collect(), [
    1,
    3,
    6,
    10,
    15,
    21,
    28,
    36,
    45,
    55,
    66,
    78,
    91,
  ]);
});

Deno.test("Iter.flatten can work with nested arrays", () => {
  const nestedArrays = [
    [11, 12],
    [21],
    [31, 32, 33],
    [],
    [51],
  ];
  assertEquals(nestedArrays.iter().flatten().collect(), nestedArrays.flat());
});

Deno.test("Iter.flatten only removes one level of nesting", () => {
  const nestedArrays = [
    [[11, 12]],
    [[21]],
    [[31, 32], [33]],
    [],
    [[]],
    [[51]],
  ];
  assertEquals(nestedArrays.iter().flatten().collect(), nestedArrays.flat(1));
  assertEquals(
    nestedArrays.iter().flatten().flatten().collect(),
    nestedArrays.flat(2),
  );
});

Deno.test("Iter.flatten works across different iterable types", () => {
  assertEquals(
    ["Hello, ", "world!"].iter().flatten().collect(),
    Array.from("Hello, world!"),
  );
});

Deno.test("Iter.map aligns with Array.map", () => {
  const double = (x: number) => 2 * x;
  assertEquals(primes.iter().map(double).collect(), primes.map(double));
});

Deno.test("Iter.flatMap aligns with Array.flatMap", () => {
  function* repeat(x: number): Generator<number> {
    for (let i = 0; i < x; ++i) {
      yield x;
    }
  }
  function repeatArray(x: number): number[] {
    return [...repeat(x)];
  }

  assertEquals(
    primes.iter().flatMap(repeatArray).collect(),
    primes.flatMap(repeatArray),
  );
  assertEquals(
    primes.iter().flatMap(repeat).collect(),
    primes.flatMap(repeatArray),
  );
});

Deno.test("Iter.filter aligns with Array.filter", () => {
  const allNumbers = [...Array(primes[primes.length - 1]).keys()];
  assertEquals(
    allNumbers.iter().filter(isNotPrime).collect(),
    allNumbers.filter(isNotPrime),
  );
  assertEquals(primes.iter().filter(isNotPrime).collect(), []);
  assertEquals(primes.iter().filter((x) => x % 2 == 0).collect(), [2]);
});

Deno.test("Iter.filterMap aligns with Array.map().filter().map() chain", () => {
  const numbers = [...Array(42).keys()];
  const negateEvenOnly = (x: number) => (x % 2 == 0) ? -x : undefined;
  assertEquals(
    numbers.iter().filterMap(negateEvenOnly).collect(),
    numbers.map(negateEvenOnly).filter((x) => x !== undefined).map((x) => x!),
  );
});

Deno.test("Iter.first returns the first element of non-empty iterables", () => {
  assertEquals(primes.iter().first(), primes[0]);
  assertEquals([42].iter().first(), 42);
});

Deno.test("Iter.first only consumes the first iterator element", () => {
  let count = 0;
  function* counter(): Generator<number> {
    ++count;
    yield count;
  }
  assertEquals(counter().iter().first(), 1);
  assertEquals(count, 1);
});

Deno.test("Iter.first returns undefined for empty iterables", () => {
  assertEquals([].iter().first(), undefined);
  assertEquals(primes.iter().filter(isNotPrime).first(), undefined);
});

Deno.test("Iter.last returns the last element of non-empty iterables", () => {
  assertEquals(primes.iter().last(), primes[primes.length - 1]);
  assertEquals(primes.iter().filter((x) => x % 2 == 0).last(), 2);
});

Deno.test("Iter.last returns undefined for empty iterables", () => {
  assertEquals([].iter().last(), undefined);
  assertEquals(primes.iter().filter(isNotPrime).last(), undefined);
});

Deno.test("Iter.take returns an iterator over the first N elements", () => {
  assertEquals(primes.iter().take(4).collect(), primes.slice(0, 4));
});

Deno.test("Iter.take returns the whole sequence for excessive N", () => {
  assertEquals(primes.iter().take(42).collect(), primes);
});

Deno.test("Iter.take can be called multiple times, progressively consuming more elements", () => {
  const iter = primes.iter();
  assertEquals(iter.take(2).collect(), primes.slice(0, 2));
  assertEquals(iter.take(3).collect(), primes.slice(2, 5));
  assertEquals(iter.take(2).collect(), primes.slice(5));
});

Deno.test("Iter.take throws for negative N", () => {
  assertThrows(() => primes.iter().take(-3));
});

Deno.test("Iter.take rounds down for non-integer N", () => {
  assertEquals(primes.iter().take(Math.PI).collect(), primes.slice(0, 3));
});

Deno.test("Iter.skip returns the remaining elements of the sequence", () => {
  assertEquals(primes.iter().skip(3).collect(), primes.slice(3));
  assertEquals(primes.iter().skip(0).collect(), primes);
});

Deno.test("Iter.skip returns an empty iterator for excessive N", () => {
  assertEquals(primes.iter().skip(42).collect(), []);
});

Deno.test("Iter.skip throws for negative N", () => {
  assertThrows(() => primes.iter().skip(-3));
});

Deno.test("Iter.skip rounds down for non-integer N", () => {
  assertEquals(primes.iter().skip(Math.PI).collect(), primes.slice(3));
});

Deno.test("Iter.find returns the first element satisfying the predicate", () => {
  assertEquals([2, 3, 4, 5, 6, 7].iter().find(isNotPrime), 4);
});

Deno.test("Iter.chunks returns an iterator over non-overlapping subarrays", () => {
  assertEquals(
    primes.iter().chunks(1).collect(),
    primes.map((x) => [x] as [number]),
  );
  assertEquals(primes.iter().chunks(2).collect(), [[2, 3], [5, 7], [11, 13]]);
  assertEquals(primes.iter().chunks(3).collect(), [[2, 3, 5], [7, 11, 13]]);
  assertEquals(primes.iter().chunks(4).collect(), [[2, 3, 5, 7]]);
});

Deno.test("Iter.chunks throws for non-positive N", () => {
  assertThrows(() => primes.iter().chunks(0));
  assertThrows(() => primes.iter().chunks(-3));
});

Deno.test("Iter.chunks rounds down for non-integer N", () => {
  assertEquals(
    primes.iter().chunks(Math.PI).collect(),
    primes.iter().chunks(3).collect(),
  );
});

Deno.test("Iter.find returns undefined if none of the elements satisfy the predicate", () => {
  assertEquals(primes.iter().find(isNotPrime), undefined);
  assertEquals([].iter().find((_) => true), undefined);
});

Deno.test("Iter.duplicates filters for first-time duplicates", () => {
  assertEquals([1, 2, 3, 2, 1, 4, 4, 2, 5].iter().duplicates().collect(), [
    2,
    1,
    4,
  ]);
});

Deno.test("Iter.duplicates uses strict equality comparison by default", () => {
  const a = { value: 42 };
  const b = { value: 17 };
  const c = { value: 17 };
  assertEquals([a, b, a, c].iter().duplicates().collect(), [a]);
});

Deno.test("Iter.duplicates can be used with a custom comparator", () => {
  const a = { value: 42 };
  const b = { value: 17 };
  const c = { value: 17 };
  assertEquals([
    ...[a, b, a, c].iter().duplicates((lhs, rhs) => lhs.value === rhs.value),
  ], [a, b]);
});

Deno.test("Iter.dedup removes consecutive duplicates", () => {
  assertEquals([1, 2, 2, 2, 3, 3, 4, 5, 2, 2, 3].iter().dedup().collect(), [
    1,
    2,
    3,
    4,
    5,
    2,
    3,
  ]);
});

Deno.test("Iter.dedup uses strict equality comparison by default", () => {
  const a = { value: 42 };
  const b = { value: 17 };
  const c = { value: 17 };
  assertEquals([a, a, b, c].iter().dedup().collect(), [a, b, c]);
});

Deno.test("Iter.dedup can be used with a custom comparator", () => {
  const a = { value: 42 };
  const b = { value: 17 };
  const c = { value: 17 };
  assertEquals(
    [a, a, b, c].iter().dedup((lhs, rhs) => lhs.value === rhs.value).collect(),
    [a, b],
  );
});

Deno.test("Zipping two arrays of the same length", () => {
  assertEquals(
    zip(
      [1, 2, 3],
      [4, 5, 6],
    ).collect(),
    [[1, 4], [2, 5], [3, 6]],
  );
});

Deno.test("Zipping two arrays of different lengths", () => {
  assertEquals(
    zip(
      [1, 2],
      [4, 5, 6],
    ).collect(),
    [[1, 4], [2, 5]],
  );
  assertEquals(
    zip(
      [1, 2, 3],
      [4, 5],
    ).collect(),
    [[1, 4], [2, 5]],
  );
});

Deno.test("Zipping multiple iterators over different types", () => {
  const names_tuple = ["Fred", "Josh", "Ben"] as const;
  const ages = [42, 19, 23];
  const height = function* () {
    yield 1.82;
    yield 1.79;
    yield 1.84;
  }();
  assertEquals(
    zip(names_tuple, ages, height).collect(),
    [
      ["Fred" as const, 42 as const, 1.82 as const],
      ["Josh" as const, 19 as const, 1.79 as const],
      ["Ben" as const, 23 as const, 1.84 as const],
    ],
  );
});

Deno.test("Zipping a dynamic array of iterators", () => {
  const args = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  assertEquals(
    zip(...args).collect(),
    [[1, 4, 7], [2, 5, 8], [3, 6, 9]],
  );
});
