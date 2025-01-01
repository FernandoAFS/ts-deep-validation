
/**
 * Types required by faked API.
 */

export type VillageType = "transit" | "source" | "sink"

/**
 * Effectively, a point on the map
 */
export type Village = {
  uuid: string
  name: string
  villageType: VillageType
}

/**
 * A list of villages connected.
 */
export type Road = {
  uuid: string
  villages: Village[]
}

/**
 * A segment of a road. Does not Segments are not re-usable. Belong only to a
 * single route (this is important for point identification.)
 */
export type RoadSegment = {
  uuid: string
  road: Road
  ndx0: number
  ndxF: number
}

/**
 * Path to be taken from point A to point B. Effectively, list of road segments
 */
export type Route = {
  uuid: string
  segments: RoadSegment[]
}

/**
 * Point in a given route.
 * Segments are unique to a 
 */
export type RoutePoint = {
  route: Route
  segment: RoadSegment
  ndx: number
}

/**
 * Link used between a village in the main route and contingency route.
 */
export type RouteLink = {
  uuid: string
  route: string
  // MAYBE INCLUDE CASUALTY TYPE...
}

/**
 * Top level definition of a given trip.
 */
export type Trip = {
  mainRoute: Route
  alternativeRotues: Route[]
  alternativeRouteslinks: RouteLink[]
}

/// TESTS...
/*
export type TripErrorTuple = ErrorTuple<Trip>
export type UserInputTrip = DeepPartial<Trip>
export type NormalizedTrip = UuidNormalized<Trip>
export type NormalizedRoutePoint = UuidNormalized<RoutePoint>
*/
