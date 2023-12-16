import { isTuple, Tuple } from "./tuple.ts";

export function iter<T>(it: Iterable<T>) {
  return new Iter(it[Symbol.iterator]());
}

export class Iter<T> implements Iterator<T>, Iterable<T> {
  constructor(private it: Iterator<T>) {}

  [Symbol.iterator](): Iterator<T> {
    return this;
  }

  next(): IteratorResult<T> {
    return this.it.next();
  }

  collect(): T[] {
    return [...this];
  }

  reduce(callback: (acc: T, elem: T) => T): T | undefined {
    let acc = undefined;
    for (const elem of this) {
      acc = acc === undefined ? elem : callback(acc, elem);
    }
    return acc;
  }

  fold<U>(callback: (acc: U, elem: T) => U, initial: U): U {
    let acc = initial;
    for (const elem of this) {
      acc = callback(acc, elem);
    }
    return acc;
  }

  any(predicate: (elem: T) => boolean): boolean {
    for (const elem of this) {
      if (predicate(elem)) {
        return true;
      }
    }
    return false;
  }

  all(predicate: (elem: T) => boolean): boolean {
    for (const elem of this) {
      if (!predicate(elem)) {
        return false;
      }
    }
    return true;
  }

  count(): number {
    let count = 0;
    for (const _ of this) {
      ++count;
    }
    return count;
  }

  scan<U>(callback: (state: U, elem: T) => U | undefined, initial: U): Iter<U> {
    return new Iter(function* (it: Iterable<T>): Generator<U> {
      let state = initial;
      for (const elem of it) {
        const next = callback(state, elem);
        if (next === undefined) {
          break;
        } else {
          state = next;
          yield state;
        }
      }
    }(this));
  }

  flatten<U>(this: Iter<Iterable<U>>): Iter<U> {
    return new Iter(
      function* (it: Iterable<Iterable<U>>): Generator<U, void, undefined> {
        for (const nestedIt of it) {
          yield* nestedIt;
        }
      }(this),
    );
  }

  map<U>(callback: (elem: T) => U): Iter<U> {
    return new Iter(function* (it: Iterable<T>): Generator<U> {
      for (const elem of it) {
        yield callback(elem);
      }
    }(this));
  }

  flatMap<U>(callback: (elem: T) => Iterable<U>): Iter<U> {
    return this.map(callback).flatten();
  }

  filter(predicate: (elem: T) => boolean): Iter<T> {
    return new Iter(function* (it: Iterable<T>): Generator<T> {
      for (const elem of it) {
        if (predicate(elem)) {
          yield elem;
        }
      }
    }(this));
  }

  filterMap<U>(callback: (elem: T) => U | undefined): Iter<U> {
    return new Iter(function* (it: Iterable<T>): Generator<U> {
      for (const elem of it) {
        const mapped = callback(elem);
        if (mapped !== undefined) {
          yield mapped;
        }
      }
    }(this));
  }

  first(): T | undefined {
    const result = this.next();
    return !(result.done) ? result.value : undefined;
  }

  last(): T | undefined {
    let last: T | undefined = undefined;
    for (const elem of this) {
      last = elem;
    }
    return last;
  }

  take(n: number): Iter<T> {
    if (n < 0) {
      throw new RangeError("Argument to Iter.take must not be negative");
    }
    const it = this.it;
    return new Iter({
      next(): IteratorResult<T> {
        if (--n >= 0) {
          return it.next();
        } else {
          return { done: true, value: undefined };
        }
      },
    });
  }

  takeWhile(predicate: (elem: T) => boolean): Iter<T> {
    const it = this.it;
    return new Iter({
      next(): IteratorResult<T> {
        const res = it.next();
        if (!res.done && predicate(res.value)) {
          return res;
        } else {
          return { done: true, value: undefined };
        }
      },
    });
  }

  takeWhileInclusive(predicate: (elem: T) => boolean): Iter<T> {
    return new Iter(function* (it: Iterable<T>): Generator<T> {
      for (const elem of it) {
        yield elem;
        if (!predicate(elem)) {
          break;
        }
      }
    }(this));
  }

  skip(n: number): Iter<T> {
    if (n < 0) {
      throw new RangeError("Argument to Iter.skip must not be negative");
    }
    while (--n >= 0 && !this.it.next().done);
    return this;
  }

  skipWhile(predicate: (elem: T) => boolean): Iter<T> {
    return new Iter(function* (it: Iterable<T>): Generator<T> {
      for (const elem of it) {
        if (!predicate(elem)) {
          yield elem;
          break;
        }
      }
      for (const elem of it) {
        yield elem;
      }
    }(this));
  }

  chunks<N extends number>(n: N): Iter<Tuple<T, N>> {
    if (n < 1) {
      throw new RangeError("Argument to Iter.chunks must not be less than one");
    }
    const it = new Iter(this.it);
    return new Iter({
      next(): IteratorResult<Tuple<T, N>> {
        const value = it.take(n).collect();
        if (isTuple(value, n)) {
          return { done: false, value };
        } else {
          return { done: true, value: undefined };
        }
      },
    });
  }

  windows<N extends number>(n: N): Iter<Tuple<T, N>> {
    if (n < 1) {
      throw new RangeError("Argument to Iter.chunks must not be less than one");
    }
    const it = new Iter(this.it);
    const start = it.take(n - 1).collect();
    if (start.length < Math.floor(n - 1)) {
      return iter([] as Tuple<T, N>[]);
    }
    return new Iter(
      new class implements Iterator<Tuple<T, N>> {
        constructor(private prev: T[]) {}

        next(): IteratorResult<Tuple<T, N>> {
          const { done, value: current } = it.next();
          if (done) {
            return { done, value: undefined };
          }
          const ret = [...this.prev, current] as Tuple<T, N>;
          this.prev = ret.slice(1);
          return { done: false, value: ret };
        }
      }(start),
    );
  }

  find(predicate: (elem: T) => boolean): T | undefined {
    return this.filter(predicate).first();
  }

  duplicates(compare = strictEqualityCompare<T>): Iter<T> {
    type ScanState = {
      occurrences: { firstOccurrence: T; isFresh: boolean }[];
      duplicate?: T;
    };
    return this
      .scan((state: ScanState, elem: T) => {
        const hit = iter(state.occurrences).find(({ firstOccurrence }) =>
          compare(firstOccurrence, elem)
        );
        if (hit !== undefined) {
          if (hit.isFresh) {
            hit.isFresh = false;
            state.duplicate = hit.firstOccurrence;
          } else {
            state.duplicate = undefined;
          }
        } else {
          state.occurrences.push({ firstOccurrence: elem, isFresh: true });
          state.duplicate = undefined;
        }
        return state;
      }, { occurrences: [] })
      .filterMap(({ duplicate }) => duplicate);
  }

  dedup(compare = strictEqualityCompare<T>): Iter<T> {
    return new Iter(function* (it: Iterable<T>): Generator<T> {
      let prev: T | undefined = undefined;
      for (const elem of it) {
        if (!prev || !compare(prev, elem)) {
          yield elem;
        }
        prev = elem;
      }
    }(this));
  }
}

export function strictEqualityCompare<T>(lhs: T, rhs: T): boolean {
  return lhs === rhs;
}

type Zip<A extends ReadonlyArray<Iterable<unknown>>> = {
  [K in keyof A]: A[K] extends Iterable<infer T> ? T : never;
};

export function zip<Args extends ReadonlyArray<Iterable<unknown>>>(
  ...args: Args
): Iter<Zip<Args>> {
  return new Iter(
    function* (args: Args): Generator<Zip<Args>> {
      const iters = args.map((iterable) => iterable[Symbol.iterator]());
      while (true) {
        const values = [
          ...iter(iters).map((it) => it.next()).filterMap((res) =>
            !res.done ? res.value : undefined
          ),
        ];
        if (values.length === args.length) {
          yield values as Zip<Args>;
        } else break;
      }
    }(args),
  );
}

export function sum(seq: Iterable<number>): number {
  return iter(seq).fold((acc, x) => acc + x, 0);
}

export function product(seq: Iterable<number>): number {
  return iter(seq).fold((acc, x) => acc * x, 1);
}

export function pairs<T>(array: T[]): Iter<[T, T]> {
  return new Iter(function* (array: T[]): Generator<[T, T]> {
    for (let i = 0; i < array.length; ++i) {
      for (let j = i + 1; j < array.length; ++j) {
        yield [array[i], array[j]];
      }
    }
  }(array));
}
