import { equals, every, filter, some } from "../set";

describe('set utility functions', () => {
  describe('filter', () => {
    it('will return only the items of the set that match the given predicate', () => {
      const input = new Set([0, 1, 2, 3, 4, 5]);
      const result = filter(input, i => i % 2 === 0);

      expect(result).toEqual(new Set([0, 2, 4]));
    });

    it('will work on a set with no items', () => {
      const input = new Set([]);
      const result = filter(input, i => i % 2 === 0);

      expect(result).toEqual(new Set([]));
    });

    it('will work on a set when nothing matches', () => {
      const input = new Set([1, 3, 5, 7]);
      const result = filter(input, i => i % 2 === 0);

      expect(result).toEqual(new Set([]));
    });

    it('will work on a set when everything matches', () => {
      const input = new Set([0, 2, 4, 6]);
      const result = filter(input, i => i % 2 === 0);

      expect(result).toEqual(new Set([0, 2, 4, 6]));
    });
  });

  describe('every', () => {
    it('will return true if every element matches the predicate', () => {
      const input = new Set<unknown>([0, 1, 2, 3, 4, 5]);
      const result = every(input, i => typeof i === 'number');

      expect(result).toStrictEqual(true);
    });

    it('will return false if an element does not match the predicate', () => {
      const input = new Set<unknown>(['a', 1, 'c']);
      const result = every(input, i => typeof i === 'string');

      expect(result).toStrictEqual(false);
    });
  });

  describe('some', () => {
    it('will return true if an element matches the predicate', () => {
      const input = new Set<unknown>(['a', 1, 'c']);
      const result = some(input, i => typeof i === 'number');

      expect(result).toStrictEqual(true);
    });

    it('will return false if no element matches the predicate', () => {
      const input = new Set<unknown>(['a', 'b', 'c']);
      const result = some(input, i => typeof i === 'number');

      expect(result).toStrictEqual(false);
    });
  });

  describe('equals', () => {
    const equalsProvider: [string, Set<unknown>, Set<unknown>][] = [
      [
        'same order, same types',
        new Set(['a', 'b', 'c']),
        new Set(['a', 'b', 'c']),
      ],

      [
        'same order, diff types',
        new Set(['a', 1, 'c']),
        new Set(['a', 1, 'c']),
      ],

      [
        'diff order, diff types',
        new Set(['a', 1, 'c']),
        new Set(['c', 'a', 1]),
      ],

      [
        'both empty',
        new Set([]),
        new Set([]),
      ],
    ];

    it.each(equalsProvider)('will return true if a set is equal to another set (%s)', (_, a, b) => {
      expect(equals(a, b)).toStrictEqual(true);
    });

    it('will return false if the two sets are not equal', () => {
      const a = new Set(['a', 1, 'c']);
      const b = new Set([]);

      expect(equals(a, b)).toStrictEqual(false);
    });
  });
});
