

type RecMap<T> = 
  T extends { [K in keyof T]: T[keyof T] }
    ? Map<keyof T, RecMap<T[keyof T]>>
  : T


function recMapToObj<T>(m: RecMap<T>): T {
  // SIMPLE IMPLEMENTATION WITH NO REAL TYPE SAFETY

  // EITHER MAP OR PRIMITIVE...
  if (!(m instanceof Map)) {
    return m as T;
  }

  const m_ = new Map();
  for (const [k, v] of m.entries()) {
    m_.set(k, recMapToObj(v));
  }

  return Object.fromEntries(m.entries());
}

/**
 * Convert list of tuples to error object.
 * Meant
 */
/*
export function validationToErrorObj<T>(
  tuples: ObjTuple<T>[],
): T {
  type V = T[keyof T];

  const mainM = new Map<keyof T, ObjMap<V>>();

  for (const tuple of tuples) {
    const [k, ...vs] = tuple;

    const node = recTupleMap(vs as ObjTuple<V>);
    console.log(k, node)

    // This should never happen
    if (node === null) {
      continue;
    }

    mainM.set(k as keyof T, node);
  }

  return recMapToObj(mainM as ObjMap<T>);
}
*/
