export interface Solution<T> {
  parse(input: string): T;
  part1?(data: T): string;
  part2?(data: T): string;
}
