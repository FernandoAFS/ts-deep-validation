/**
 * Validation logic. Mostly generators of error tuples.
 */

// import type {ErrorType, ErrorTuple, DeepPartial, Normalized} from './generics.ts'
import type { ErrorTuple, ErrorType } from "#/generics.ts";
import type { RoadSegment, Route, Trip } from "#/types.ts";
import { validationToErrorObj } from "#/util.ts";

// --------------
// SEGMENT ERRORS
// --------------

export const SEGMENT_NDX_BELOW_0_ERROR =
  "Segment point index cannot be below 0" as const;
export const SEGMENT_NDX_OUT_OF_BOUNDS_ERROR =
  "Segment point index out of bounds" as const;
export const SEGMENT_LINK_END_ERROR =
  "Segment must end where next begins" as const;
export const SEGMENT_LINK_BEGIN_ERROR =
  "Segment must begin where previous ends" as const;

// ------------
// ROUTE ERRORS
// ------------

export const MAIN_ROUTE_START_SOURCE_ERROR =
  "Main route must always start in a source village" as const;
export const MAIN_ROUTE_END_SINK_ERROR =
  "Main route must always end in a sink" as const;
export const ALTERNATIVE_ROUTE_END_SINK_ERROR =
  "Alternative route must always end in a sink" as const;

/**
 * Checks that segment is valid for it's given road.
 */
export function* validateSegment(
  segment: RoadSegment,
): Generator<ErrorTuple<RoadSegment>> {
  if (segment.ndx0 < 0) {
    yield ["ndx0", SEGMENT_NDX_BELOW_0_ERROR];
  }

  if (segment.ndxF < 0) {
    yield ["ndxF", SEGMENT_NDX_BELOW_0_ERROR];
  }

  if (segment.ndx0 >= segment.road.villages.length) {
    yield ["ndx0", SEGMENT_NDX_OUT_OF_BOUNDS_ERROR];
  }

  if (segment.ndxF >= segment.road.villages.length) {
    yield ["ndxF", SEGMENT_NDX_OUT_OF_BOUNDS_ERROR];
  }

  // NDX0 > NDXF IS ALLOWED SINCE ROADS CAN BE TRAVERSED BOTH WAYS.
}

/**
 * Validates basic validity of segment indexes and cohereency of each segment with the next one.
 */
export function* routeValidation(route: Route): Generator<ErrorTuple<Route>> {
  let ndxValid = true;

  for (const segment of route.segments) {
    for (const error of validateSegment(segment)) {
      yield ["segments", segment.uuid, ...error];
      ndxValid = false;
    }
  }

  // DON'T PROCEED. NEXT STEPS MAY BREAK IF SEGMENTS ARE INVALID.
  if (!ndxValid) {
    return;
  }

  const decorSeg = route.segments
    .map((s) => ({
      ...s,
      village0: s.road.villages[s.ndx0],
      villageF: s.road.villages[s.ndxF],
    }));

  // LIST OF ALL THE SEGMENTS EXCEPT FRIST ONE WITH LAST ONE INCLUDED
  const lastSegDecor = decorSeg
    .filter((_, ndx) => ndx > 0)
    .map((seg, ndx) => ({
      segment: seg,
      previousSegment: decorSeg[ndx],
    }));

  for (const { segment, previousSegment } of lastSegDecor) {
    if (previousSegment.villageF.uuid == segment.village0.uuid) {
      continue;
    }
    yield ["segments", previousSegment.uuid, "ndx0", SEGMENT_LINK_BEGIN_ERROR];
    yield ["segments", segment.uuid, "ndxF", SEGMENT_LINK_END_ERROR];
  }
}

/**
 * Validate that function is valid and it begins and ends where it should.
 */
export function* mainRouteValidation(
  route: Route,
): Generator<ErrorTuple<Route>> {
  const routeValidationErrors = routeValidation(route);

  let validRoute = true;
  for (const err of routeValidationErrors) {
    yield err;
    validRoute = false;
  }

  if (!validRoute) {
    return;
  }

  const s0 = route.segments[0];
  const sF = route.segments[route.segments.length - 1];
  const village0 = s0.road.villages[s0.ndx0];
  const villageF = sF.road.villages[sF.ndxF];

  if (village0.villageType !== "source") {
    yield ["segments", s0.uuid, "ndx0", MAIN_ROUTE_START_SOURCE_ERROR];
  }

  if (villageF.villageType !== "sink") {
    yield ["segments", sF.uuid, "ndxF", MAIN_ROUTE_END_SINK_ERROR];
  }
}

/**
 * Validate that function is valid and it ends in a sink
 */
export function* alternativeRouteValidation(
  route: Route,
): Generator<ErrorTuple<Route>> {
  const routeValidationErrors = routeValidation(route);

  let validRoute = true;
  for (const err of routeValidationErrors) {
    yield err;
    validRoute = false;
  }

  if (!validRoute) {
    return;
  }

  const sF = route.segments[route.segments.length - 1];
  const villageF = sF.road.villages[sF.ndxF];

  if (villageF.villageType !== "sink") {
    yield ["segments", sF.uuid, "ndxF", ALTERNATIVE_ROUTE_END_SINK_ERROR];
  }
}

/**
 * Top level trip validator generator
 */
export function* tripValidation(trip: Trip): Generator<ErrorTuple<Trip>> {
  for (const error of mainRouteValidation(trip.mainRoute)) {
    yield ["mainRoute", ...error];
  }

  for (const alternativeRoute of trip.alternativeRotues) {
    for (const error of alternativeRouteValidation(alternativeRoute)) {
      yield ["alternativeRotues", ...error];
    }
  }
}

/**
 * Generate new error types given a trip.
 */
export function tripErrors(trip: Trip): ErrorType<Trip> {
  const tripGen = tripValidation(trip);
  return validationToErrorObj<ErrorType<Trip>>(tripGen);
}
