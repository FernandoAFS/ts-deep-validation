/**
 * Utility functions to assist validation.
 */
import type { ObjMap, ObjTuple } from "#/generics.ts";

/**
 * Typeguard that guarantees that the list has no elements
 */
function isEmptyList<T>(l: T[]): l is [] {
  return l.length <= 0;
}

/**
 * Typeguard to discriminate maps from leafs in recursive functions
 */
function notMap<K, V, T>(o: T | Map<K, V>): o is T {
  return !(o instanceof Map);
}

/**
 * Convert list of tuples to error object.
 * Meant
 */
export function validationToErrorObj<T>(
  tuples: Iterable<ObjTuple<T>>,
): T {
  type V = T[keyof T];

  const mainM = new Map<keyof T, ObjMap<V>>();
  for (const tuple of tuples) {
    recTupleMap(tuple, mainM as ObjMap<T>)
  }

  return recMapToObj(mainM as ObjMap<T>);
}

/**
 * Recursively transverse the error tuple.
 */
function recTupleMap<T>(
  tuple: ObjTuple<T>,
  map: ObjMap<T>,
): ObjMap<T> | null {
  // For readability.
  type V = T[keyof T];

  // The key value will always be keyof T when not in leaf condition. I don't
  // know how to coordinate both types in a more type-safe way without using
  // complex function overloading (too complex for typescript)
  type K = keyof T | string | number | boolean | symbol;

  // If it's not a leaf it's a node

  // If there is a leaf already then cancel insert of tuple. This shouldn't happen other than in leaf.
  if (notMap(map)) {
    return null;
  }

  const thisNode = map as Map<K, ObjMap<V>>

  const [k, ...vs] = tuple;

  // End of recursion condition. There is no more tuple to read so this is the
  // leaf.
  if (isEmptyList(vs)) {
    return k as ObjMap<T>;
  }

  const getNextNode = (): ObjMap<V> => {
    const existingNode = thisNode.get(k);
    // Create a new node if none have been there before.
    if (!existingNode) {
      return new Map() as ObjMap<V>;
    }
    return existingNode;
  };

  const populatedNextNode = recTupleMap(vs, getNextNode());

  // Abort on existing leaf, return as is.
  if (populatedNextNode == null) {
    return map;
  }

  thisNode.set(k, populatedNextNode);

  return thisNode as ObjMap<T>;
}

/**
 * Turn map type to object recursively
 */
function recMapToObj<T>(m: ObjMap<T>): T {
  // SIMPLE IMPLEMENTATION WITH NO REAL TYPE SAFETY

  // End of recursion condition.
  if (!(m instanceof Map)) {
    // Lazy casting. Assuming that if it's not a map it's a primitive
    return m as T;
  }


  function* entriesGen(){
    if (!(m instanceof Map)) {
      return
    }

    for (const [k, v] of m.entries()) {
      yield [k, recMapToObj(v)]
    }
  }
  return Object.fromEntries(entriesGen())
}
