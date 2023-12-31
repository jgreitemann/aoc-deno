import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  count2dIntersectionsInBox,
  determineRockTrajectory,
  Hailstone,
  parseHailstones,
} from "./day24.ts";

const EXAMPLE_INPUT = `19, 13, 30 @ -2,  1, -2
18, 19, 22 @ -1, -1, -2
20, 25, 34 @ -2, -2, -4
12, 31, 28 @ -1, -2, -1
20, 19, 15 @  1, -5, -3`;

const EXAMPLE_HAIL: Hailstone[] = [
  { position: [19, 13, 30], velocity: [-2, 1, -2] },
  { position: [18, 19, 22], velocity: [-1, -1, -2] },
  { position: [20, 25, 34], velocity: [-2, -2, -4] },
  { position: [12, 31, 28], velocity: [-1, -2, -1] },
  { position: [20, 19, 15], velocity: [1, -5, -3] },
];

Deno.test("Example hailstones are parsed", () => {
  assertEquals(parseHailstones(EXAMPLE_INPUT), EXAMPLE_HAIL);
});

Deno.test("Find number of intersections of 2D projections within the test area", () => {
  assertEquals(count2dIntersectionsInBox(EXAMPLE_HAIL, 7, 27), 2);
});

Deno.test("Determine the trajectory of the rock to hit all hailstones", () => {
  assertEquals(
    determineRockTrajectory(EXAMPLE_HAIL),
    {
      position: [24, 13, 10],
      velocity: [-3, 1, 2],
    },
  );
});

Deno.test("Determine the rock trajectory for parts of the real input", () => {
  const input = [
    "296136747977213, 400026919462961, 245942583851044 @ 88, 359, -31",
    "135797317464983, 392120809901003, 313062084315250 @ 138, -222, 6",
    "176557441160429, 143347387408157, 61882073031568 @ 88, 58, 292",
    "314612790930797, 316306772531493, 276814005380472 @ -72, -20, 14",
    "246123428675951, 99127506336088, 302231597481979 @ 75, 480, -50",
    "339259022495805, 323741118631221, 235384439131918 @ -137, 45, 94",
    "273273638071379, 214049263817075, 329490225222235 @ -21, -19, -12",
    "204086928489137, 338446865415329, 225694620429604 @ 74, -143, 108",
    "312325443587444, 149428897016081, 299540772801400 @ -66, 99, 13",
    "196896369640991, 205342464949925, 197882891917078 @ 46, -55, 132",
    "309991770591665, 347806548892901, 289381112886298 @ -63, 73, -86",
    "280877573001912, 399522775844684, 245019135103390 @ 50, -64, 55",
    "339357006382997, 151551148363549, 350260527523424 @ -105, 141, -69",
  ];

  const hail = parseHailstones(input.join("\n"));
  assertEquals(
    determineRockTrajectory(hail),
    {
      position: [
        309991770591665,
        460585296453281,
        234197928919588,
      ],
      velocity: [-63, -301, 97],
    },
  );
});
