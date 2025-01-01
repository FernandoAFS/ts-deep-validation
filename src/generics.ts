/**
 * Utility types for easily convert types
 */

/**
 * Object that has an uuid may be stiched back together for register type.
 */
export interface UuidIdentify {
  uuid: string;
}

/**
 * Type that excludes uuid from object. Useful for factory patterns.
 */
export type WithoutIdentity<T extends UuidIdentify> = Omit<T, "uuid">;

/**
 * Turn the nested object into a list of optional strings. Lists are turned
 * into an object with an optional "overall" error and a list of "values"
 * errors.
 */
export type ErrorType<T> = T extends string ? string
  : T extends number ? string
  : T extends boolean ? string
  : T extends symbol ? string
  : T extends Array<infer V>
    ? { [K in string]: ErrorType<V> } & { "overall": string }
  : T extends { [K in keyof T]: T[K] }
    ? { readonly [K in keyof T]?: ErrorType<T[K]> }
  : T extends { [K in string]: T[keyof T] }
    ? { readonly [K in keyof T]?: ErrorType<T[keyof T]> }
  : string;

/**
 * Flattening of a type into a array of tuples.
 */
export type ObjTuple<T> = T extends string ? [string]
  : T extends number ? [number]
  : T extends boolean ? [boolean]
  : T extends symbol ? [symbol]
  : T extends Array<infer V> ? [string, ...ObjTuple<V>]
  : T extends { [K in keyof T]: T[keyof T] }
    ? [keyof T, ...ObjTuple<T[keyof T]>]
  : T extends { [K in string]: T[keyof T] } ? [string, ...ObjTuple<T[keyof T]>]
  : never; // NOT EXCESSIVELY COMPLEX RECURSIVE TYPES... OTHER WAYS IT MAY GET OUT OF HAND

/**
 * Recursive partial type. Useful to convert a type to user input.
 */
export type DeepPartial<T> = T extends { [K in keyof T]: T[K] }
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

/**
 * Type strips details from identifiables and stops types nesting.
 * This is useful to enforce registry pattern.
 *
 * IdentifyType is meant  to be a type like {uuid: string} or {id: number} or simmilar.
 */
export type Normalized<IdentityType, T> = T extends string ? T
  : T extends IdentityType ? IdentityType // STOP RECURSION ON IDENTIFIABLE
  : T extends { [K in keyof T]: T[K] }
    ? { [K in keyof T]: Normalized<IdentityType, T[K]> }
  : T;

/**
 * DRY for uuid identifiable uuid. Used extensively in this examples.
 */
export type UuidNormalized<T> = Normalized<UuidIdentify, T>;

/**
 * Turns an object into a map of same properties.
 */
export type ObjMap<T> = T extends string ? string // DIRTY TRICK...
  : T extends { [K in keyof T]: T[keyof T] } ? Map<keyof T, ObjMap<T[keyof T]>>
  : T;

/**
 * Shortcut for tuples of error type of a given generic. Used extensively in this case.
 */
export type ErrorTuple<T> = ObjTuple<ErrorType<T>>;
