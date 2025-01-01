import { assertEquals } from "@std/assert";
import type { Road, RoadSegment, Village } from "#/types.ts";
import type { WithoutIdentity } from "#/generics.ts";
import {
  SEGMENT_LINK_BEGIN_ERROR,
  SEGMENT_LINK_END_ERROR,
  SEGMENT_NDX_OUT_OF_BOUNDS_ERROR,
  tripErrors,
} from "#/validation.ts";

// --------
// VILLAGES
// --------

const genVillage = (input: WithoutIdentity<Village>): Village => ({
  uuid: self.crypto.randomUUID(),
  ...input,
});

const madrid = genVillage({
  name: "Madrid",
  villageType: "transit",
});

const burgos = genVillage({
  name: "Burgos",
  villageType: "transit",
});

const vitoria = genVillage({
  name: "Vitoria",
  villageType: "transit",
});

const eibar = genVillage({
  name: "Eibar",
  villageType: "source",
});

const cordoba = genVillage({
  name: "Cordoba",
  villageType: "transit",
});

const sevilla = genVillage({
  name: "Sevilla",
  villageType: "transit",
});

const cadiz = genVillage({
  name: "Cadiz",
  villageType: "sink",
});

// ----
// ROAD
// ----

const genRoad = (input: WithoutIdentity<Road>): Road => ({
  uuid: self.crypto.randomUUID(),
  ...input,
});

const A1 = genRoad({
  villages: [
    madrid,
    burgos,
    vitoria,
    eibar,
  ],
});

const A4 = genRoad({
  villages: [
    madrid,
    cordoba,
    sevilla,
    cadiz,
  ],
});

// ------------
// ROAD SEGMENT
// ------------

const genRoadSegment = (input: WithoutIdentity<RoadSegment>): RoadSegment => ({
  uuid: self.crypto.randomUUID(),
  ...input,
});

Deno.test(function routeOkTest() {
  const route = {
    uuid: self.crypto.randomUUID(),
    segments: [
      genRoadSegment({
        road: A1,
        ndx0: A1.villages.length - 1,
        ndxF: 0,
      }),
      genRoadSegment({
        road: A4,
        ndx0: 0,
        ndxF: A4.villages.length - 1,
      }),
    ],
  };

  const trip = {
    mainRoute: route,
    alternativeRotues: [],
    alternativeRouteslinks: [],
  };

  const errors = tripErrors(trip);

  if (Object.keys(errors).length > 0) {
    throw new Error("Found errors");
  }
});

Deno.test(function segmentOutOfBoundsTest() {
  const a1Segment = genRoadSegment({
    road: A1,
    ndx0: A1.villages.length, // OUT OF BOUNDS INDEX
    ndxF: 0,
  });

  const route = {
    uuid: self.crypto.randomUUID(),
    segments: [
      a1Segment,
      genRoadSegment({
        road: A4,
        ndx0: 0,
        ndxF: A4.villages.length - 1,
      }),
    ],
  };

  const trip = {
    mainRoute: route,
    alternativeRotues: [],
    alternativeRouteslinks: [],
  };

  const errors = tripErrors(trip);

  const a1SegErr = errors.mainRoute?.segments?.[a1Segment.uuid];
  if (!a1SegErr) {
    throw new Error("No errors for wrong segment");
  }
  const errNdx0 = a1SegErr.ndx0;

  assertEquals(SEGMENT_NDX_OUT_OF_BOUNDS_ERROR, errNdx0);
});

Deno.test(function unlinkedRouteError() {
  const a4Segment = genRoadSegment({
    road: A4,
    ndx0: 1, // FINE BUT NOT LINKED
    ndxF: A4.villages.length - 1,
  });

  const a1Segment = genRoadSegment({
    road: A1,
    ndx0: A1.villages.length - 1,
    ndxF: 0,
  });

  const route = {
    uuid: self.crypto.randomUUID(),
    segments: [
      a1Segment,
      a4Segment,
    ],
  };

  const trip = {
    mainRoute: route,
    alternativeRotues: [],
    alternativeRouteslinks: [],
  };

  const errors = tripErrors(trip);

  const a1SegErr = errors.mainRoute?.segments?.[a1Segment.uuid];
  if (!a1SegErr) {
    throw new Error("No errors for wrong segment");
  }

  const a4SegErr = errors.mainRoute?.segments?.[a4Segment.uuid];
  if (!a4SegErr) {
    throw new Error("No errors for wrong segment");
  }

  const errNdxF = a4SegErr.ndxF;
  const errNdx0 = a1SegErr.ndx0;

  assertEquals(SEGMENT_LINK_END_ERROR, errNdxF);
  assertEquals(SEGMENT_LINK_BEGIN_ERROR, errNdx0);
});
