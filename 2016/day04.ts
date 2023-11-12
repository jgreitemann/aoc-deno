import { groupBy } from "https://deno.land/std@0.206.0/collections/group_by.ts";

import "../utils/iter.ts";

import { Solution } from "../solution.ts";

export type Room = {
  encryptedNames: string[];
  sectorId: number;
  checksum: string;
};

export default <Solution<Room[]>> {
  parse(input: string): Room[] {
    return input.split("\n").map(parseRoom);
  },

  part1(data: Room[]): string {
    return sectorIdSum(data).toString();
  },

  part2(data: Room[]): string {
    const roomPlan = new Map(
      data.filter(isRealRoom).map((r) => [
        r.encryptedNames.map((n) => decrypt(n, r.sectorId)).join(" "),
        r.sectorId,
      ]),
    );
    return roomPlan.get("northpole object storage")?.toString() ?? "not found";
  },
};

export function parseRoom(room: string): Room {
  const match = room.match(/^([a-z]+(-[a-z]+)*)-([0-9]+)\[([a-z]{5})\]$/);
  if (match === null) {
    throw new Error(`Failed to parse room string: ${room}`);
  }
  const [_all, names, _subgroup, sectorIdStr, checksum] = match;
  return {
    encryptedNames: names.split("-"),
    sectorId: parseInt(sectorIdStr),
    checksum,
  };
}

export function histogram(string: string): Map<string, number> {
  const groups = groupBy(string.split("").sort(), (c: string) => c);
  const frequencies = Object.entries(groups)
    .map(([k, arr]) => [k, arr?.length ?? 0] as const)
    .sort(([_k1, count1], [_k2, count2]) => count2 - count1);
  return new Map(frequencies);
}

export function isRealRoom(room: Room): boolean {
  return histogram(room.encryptedNames.join("")).keys().iter().take(5).collect()
    .join("") == room.checksum;
}

export function sectorIdSum(rooms: Room[]): number {
  return rooms.iter().filter(isRealRoom).fold(
    (sum, room) => sum + room.sectorId,
    0,
  );
}

export function decrypt(word: string, amount: number): string {
  return String.fromCharCode(
    ...word.split("").map((c) => (c.charCodeAt(0) - 97 + amount) % 26 + 97),
  );
}
