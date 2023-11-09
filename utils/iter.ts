declare global {
  interface Object {
    iter<T>(this: Iterable<T>): Iter<T>;
  }
}

Object.prototype.iter = function <T>(this: Iterable<T>) {
  return new Iter(this[Symbol.iterator]());
};

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

  skip(n: number): Iter<T> {
    if (n < 0) {
      throw new RangeError("Argument to Iter.skip must not be negative");
    }
    while (--n >= 0 && !this.it.next().done);
    return this;
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
        const hit = state.occurrences.iter().find(({ firstOccurrence }) =>
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
          ...iters.iter().map((it) => it.next()).filterMap((res) =>
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
