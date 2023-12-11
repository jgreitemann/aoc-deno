import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.201.0/assert/mod.ts";

import { iter, pairs, zip } from "./iter.ts";

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
  for (const elem of iter(primes)) {
    received.push(elem);
  }
  assertEquals(received, primes);
});

Deno.test("Iter is an iterable wrapper around a generator", () => {
  const primesGenerator = function* () {
    yield* primes;
  };
  const received: number[] = [];
  for (const elem of iter(primesGenerator())) {
    received.push(elem);
  }
  assertEquals(received, primes);
});

Deno.test("Array can be constructed from an Iter", () => {
  const received = Array.from(iter(primes));
  assertEquals(received, primes);
});

Deno.test("Iter.reduce aligns with Array.reduce", () => {
  assertEquals(iter(primes).reduce(sum), primes.reduce(sum));
  assertEquals(iter(primes).reduce(sumSq), primes.reduce(sumSq));
});

Deno.test("Iter.reduce over an empty sequence returns undefined", () => {
  assertEquals(iter([] as number[]).reduce(sum), undefined);
});

Deno.test("Iter.fold aligns with Array.reduce", () => {
  assertEquals(iter(primes).fold(sum, 0), primes.reduce(sum, 0));
  assertEquals(iter(primes).fold(sum, 42), primes.reduce(sum, 42));
  assertEquals(iter(primes).fold(sumSq, 42), primes.reduce(sumSq, 42));
});

Deno.test("Iter.fold over an empty sequence returns the initial value", () => {
  assertEquals(iter([] as number[]).fold(sum, 0), 0);
  assertEquals(iter([] as number[]).fold(sum, 42), 42);
});

Deno.test("Iter.fold can work with heterogeneous types", () => {
  assertEquals(
    iter(primes)
      .fold(
        (acc: string, elem: number) => `${acc}-${elem}`,
        "seq",
      ),
    "seq-2-3-5-7-11-13",
  );
});

Deno.test("Iter.any aligns with Array.some", () => {
  assertEquals(iter(primes).any(isNotPrime), primes.some(isNotPrime));
  assertEquals(iter([1, 2, 3]).any(isNotPrime), [1, 2, 3].some(isNotPrime));
  assertEquals(iter([2, 4, 8]).any(isNotPrime), [2, 4, 8].some(isNotPrime));
});

Deno.test("Iter.all aligns with Array.every", () => {
  assertEquals(iter(primes).all(isNotPrime), primes.every(isNotPrime));
  assertEquals(iter([1, 2, 3]).all(isNotPrime), [1, 2, 3].every(isNotPrime));
  assertEquals(iter([2, 4, 8]).all(isNotPrime), [2, 4, 8].every(isNotPrime));
});

Deno.test("Iter.count yields the number of elements", () => {
  assertEquals(iter([]).count(), 0);
  assertEquals(iter([42]).count(), 1);
  assertEquals(iter(primes).count(), primes.length);
});

Deno.test("Iter.scan produces sequence of partial reductions", () => {
  const partialReductions = <U>(
    f: (acc: U, elem: number) => U,
    initial: U,
  ): U[] =>
    [...primes.keys()].map((n) => primes.slice(0, n + 1).reduce(f, initial));

  assertEquals(
    iter(primes).scan(sum, 0).collect(),
    partialReductions(sum, 0),
  );
  assertEquals(
    iter(primes).scan(sum, 42).collect(),
    partialReductions(sum, 42),
  );
  assertEquals(
    iter(primes).scan(sumSq, 42).collect(),
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

  assertEquals(iter(counting()).scan(sumUntil100, 0).collect(), [
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
  assertEquals(iter(nestedArrays).flatten().collect(), nestedArrays.flat());
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
  assertEquals(iter(nestedArrays).flatten().collect(), nestedArrays.flat(1));
  assertEquals(
    iter(nestedArrays).flatten().flatten().collect(),
    nestedArrays.flat(2),
  );
});

Deno.test("Iter.flatten works across different iterable types", () => {
  assertEquals(
    iter(["Hello, ", "world!"]).flatten().collect(),
    Array.from("Hello, world!"),
  );
});

Deno.test("Iter.map aligns with Array.map", () => {
  const double = (x: number) => 2 * x;
  assertEquals(iter(primes).map(double).collect(), primes.map(double));
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
    iter(primes).flatMap(repeatArray).collect(),
    primes.flatMap(repeatArray),
  );
  assertEquals(
    iter(primes).flatMap(repeat).collect(),
    primes.flatMap(repeatArray),
  );
});

Deno.test("Iter.filter aligns with Array.filter", () => {
  const allNumbers = [...Array(primes[primes.length - 1]).keys()];
  assertEquals(
    iter(allNumbers).filter(isNotPrime).collect(),
    allNumbers.filter(isNotPrime),
  );
  assertEquals(iter(primes).filter(isNotPrime).collect(), []);
  assertEquals(iter(primes).filter((x) => x % 2 == 0).collect(), [2]);
});

Deno.test("Iter.filterMap aligns with Array.map().filter().map() chain", () => {
  const numbers = [...Array(42).keys()];
  const negateEvenOnly = (x: number) => (x % 2 == 0) ? -x : undefined;
  assertEquals(
    iter(numbers).filterMap(negateEvenOnly).collect(),
    numbers.map(negateEvenOnly).filter((x) => x !== undefined).map((x) => x!),
  );
});

Deno.test("Iter.first returns the first element of non-empty iterables", () => {
  assertEquals(iter(primes).first(), primes[0]);
  assertEquals(iter([42]).first(), 42);
});

Deno.test("Iter.first only consumes the first iterator element", () => {
  let count = 0;
  function* counter(): Generator<number> {
    ++count;
    yield count;
  }
  assertEquals(iter(counter()).first(), 1);
  assertEquals(count, 1);
});

Deno.test("Iter.first returns undefined for empty iterables", () => {
  assertEquals(iter([]).first(), undefined);
  assertEquals(iter(primes).filter(isNotPrime).first(), undefined);
});

Deno.test("Iter.last returns the last element of non-empty iterables", () => {
  assertEquals(iter(primes).last(), primes[primes.length - 1]);
  assertEquals(iter(primes).filter((x) => x % 2 == 0).last(), 2);
});

Deno.test("Iter.last returns undefined for empty iterables", () => {
  assertEquals(iter([]).last(), undefined);
  assertEquals(iter(primes).filter(isNotPrime).last(), undefined);
});

Deno.test("Iter.take returns an iterator over the first N elements", () => {
  assertEquals(iter(primes).take(4).collect(), primes.slice(0, 4));
});

Deno.test("Iter.take returns the whole sequence for excessive N", () => {
  assertEquals(iter(primes).take(42).collect(), primes);
});

Deno.test("Iter.take can be called multiple times, progressively consuming more elements", () => {
  const iterator = iter(primes);
  assertEquals(iterator.take(2).collect(), primes.slice(0, 2));
  assertEquals(iterator.take(3).collect(), primes.slice(2, 5));
  assertEquals(iterator.take(2).collect(), primes.slice(5));
});

Deno.test("Iter.take throws for negative N", () => {
  assertThrows(() => iter(primes).take(-3));
});

Deno.test("Iter.take rounds down for non-integer N", () => {
  assertEquals(iter(primes).take(Math.PI).collect(), primes.slice(0, 3));
});

Deno.test("Iter.takeWhile returns the elements up to and not including the first element that violates the predicate", () => {
  assertEquals(
    iter(Array(10).keys()).takeWhile((elem) => elem !== 5).collect(),
    [0, 1, 2, 3, 4],
  );
});

Deno.test("Iter.takeWhile returns an empty iterator if the first element violates the predicate", () => {
  assertEquals(iter(primes).takeWhile(isNotPrime).collect(), []);
});

Deno.test("Iter.takeWhileInclusive returns the elements up to and including the first element that violates the predicate", () => {
  assertEquals(
    iter(Array(10).keys()).takeWhileInclusive((elem) => elem !== 5).collect(),
    [0, 1, 2, 3, 4, 5],
  );
});

Deno.test("Iter.takeWhileInclusive returns an iterator over only the first element if it violates the predicate", () => {
  assertEquals(iter(primes).takeWhileInclusive(isNotPrime).collect(), [
    primes[0],
  ]);
});

Deno.test("Iter.takeWhileInclusive returns an empty iterator if called on an empty iterable", () => {
  assertEquals(iter([]).takeWhileInclusive(() => true).collect(), []);
});

Deno.test("Iter.skip returns the remaining elements of the sequence", () => {
  assertEquals(iter(primes).skip(3).collect(), primes.slice(3));
  assertEquals(iter(primes).skip(0).collect(), primes);
});

Deno.test("Iter.skip returns an empty iterator for excessive N", () => {
  assertEquals(iter(primes).skip(42).collect(), []);
});

Deno.test("Iter.skip throws for negative N", () => {
  assertThrows(() => iter(primes).skip(-3));
});

Deno.test("Iter.skip rounds down for non-integer N", () => {
  assertEquals(iter(primes).skip(Math.PI).collect(), primes.slice(3));
});

Deno.test("Iter.skipWhile returns the elements starting at and including the first element that violates the predicate", () => {
  assertEquals(
    iter(Array(10).keys()).skipWhile((elem) => elem !== 5).collect(),
    [5, 6, 7, 8, 9],
  );
});

Deno.test("Iter.skipWhile returns an iterator over all elements if the first element violates the predicate", () => {
  assertEquals(iter(primes).skipWhile(isNotPrime).collect(), primes);
});

Deno.test("Iter.find returns the first element satisfying the predicate", () => {
  assertEquals(iter([2, 3, 4, 5, 6, 7]).find(isNotPrime), 4);
});

Deno.test("Iter.chunks returns an iterator over non-overlapping subarrays", () => {
  assertEquals(
    iter(primes).chunks(1).collect(),
    primes.map((x) => [x] as [number]),
  );
  assertEquals(iter(primes).chunks(2).collect(), [[2, 3], [5, 7], [11, 13]]);
  assertEquals(iter(primes).chunks(3).collect(), [[2, 3, 5], [7, 11, 13]]);
  assertEquals(iter(primes).chunks(4).collect(), [[2, 3, 5, 7]]);
});

Deno.test("Iter.chunks throws for non-positive N", () => {
  assertThrows(() => iter(primes).chunks(0));
  assertThrows(() => iter(primes).chunks(-3));
});

Deno.test("Iter.chunks rounds down for non-integer N", () => {
  assertEquals(
    iter(primes).chunks(Math.PI).collect(),
    iter(primes).chunks(3).collect(),
  );
});

Deno.test("Iter.find returns undefined if none of the elements satisfy the predicate", () => {
  assertEquals(iter(primes).find(isNotPrime), undefined);
  assertEquals(iter([]).find((_) => true), undefined);
});

Deno.test("Iter.duplicates filters for first-time duplicates", () => {
  assertEquals(iter([1, 2, 3, 2, 1, 4, 4, 2, 5]).duplicates().collect(), [
    2,
    1,
    4,
  ]);
});

Deno.test("Iter.duplicates uses strict equality comparison by default", () => {
  const a = { value: 42 };
  const b = { value: 17 };
  const c = { value: 17 };
  assertEquals(iter([a, b, a, c]).duplicates().collect(), [a]);
});

Deno.test("Iter.duplicates can be used with a custom comparator", () => {
  const a = { value: 42 };
  const b = { value: 17 };
  const c = { value: 17 };
  assertEquals([
    ...iter([a, b, a, c]).duplicates((lhs, rhs) => lhs.value === rhs.value),
  ], [a, b]);
});

Deno.test("Iter.dedup removes consecutive duplicates", () => {
  assertEquals(iter([1, 2, 2, 2, 3, 3, 4, 5, 2, 2, 3]).dedup().collect(), [
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
  assertEquals(iter([a, a, b, c]).dedup().collect(), [a, b, c]);
});

Deno.test("Iter.dedup can be used with a custom comparator", () => {
  const a = { value: 42 };
  const b = { value: 17 };
  const c = { value: 17 };
  assertEquals(
    iter([a, a, b, c]).dedup((lhs, rhs) => lhs.value === rhs.value).collect(),
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

Deno.test("Iterate over all pairs of different elements in an array", () => {
  assertEquals(
    pairs(primes).collect(),
    primes
      .flatMap((p) => primes.map((q) => [p, q]))
      .filter(([l, r]) => l < r),
  );
  assertEquals(
    [...pairs(["red", "green", "blue"])],
    [
      ["red", "green"],
      ["red", "blue"],
      ["green", "blue"],
    ],
  );
});
