export interface ToString {
  toString(): string;
}

export interface Solution<T> {
  parse(input: string): T;
  part1?(data: T): ToString;
  part2?(data: T): ToString;
}
