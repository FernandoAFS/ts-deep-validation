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
