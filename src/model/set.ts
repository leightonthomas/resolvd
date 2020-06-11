export const filter = <T>(
  set: Set<T>,
  predicate: (item: T) => boolean,
): Set<T> => {
  const newSet = new Set<T>();

  for (let value of set) {
    if (predicate(value)) {
      newSet.add(value);
    }
  }

  return newSet;
}

export const every = <T>(
  set: Set<T>,
  predicate: (item: T) => boolean,
): boolean => {
  for (let value of set) {
    if ( ! predicate(value)) {
      return false;
    }
  }

  return true;
}

export const some = <T>(
  set: Set<T>,
  predicate: (item: T) => boolean,
): boolean => {
  for (let value of set) {
    if (predicate(value)) {
      return true;
    }
  }

  return false;
}

/**
 * Check whether `a` equals `b`
 */
export const equals = <T>(
  a: Set<T>,
  b: Set<T>,
): boolean => {
  if (a.size !== b.size) {
    return false;
  }

  for (let value of a) {
    if ( ! b.has(value)) {
      return false;
    }
  }

  return true;
};
