import { left, right } from "../model/either";
import { cycleAnalyser } from "../cycleAnalyser";
import { Edge } from "../sort/topologicalKahn";

describe('cycle analyser', () => {
  it('will return a left of an error message if max depth is reached', () => {
    const result = cycleAnalyser(
      new Set([
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
        { from: 'c', to: 'd' },
        { from: 'd', to: 'e' },
      ]),
      2,
    );

    expect(result).toEqual(left('Reached max depth (2) while trying to resolve dependencies for "a"'));
  });

  const uniquePaths: [string, Edge<string>[], string[]][] = [
    [
      'one long chain',
      [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
        { from: 'c', to: 'd' },
        { from: 'd', to: 'a' },
      ],
      ['a -> b -> c -> d -> a'],
    ],

    [
      'two items',
      [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'a' },
      ],
      ['a -> b -> a'],
    ],

    [
      'multiple different circular references, separate',
      [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
        { from: 'c', to: 'a' },

        { from: 'd', to: 'e' },
        { from: 'e', to: 'f' },
        { from: 'f', to: 'd' },
      ],
      ['a -> b -> c -> a', 'd -> e -> f -> d'],
    ],

    [
      'multiple different circular references, with some overlapping edges',
      [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
        { from: 'c', to: 'a' },
        { from: 'a', to: 'f' },

        { from: 'd', to: 'e' },
        { from: 'e', to: 'f' },
        { from: 'f', to: 'd' },
        { from: 'd', to: 'c' },

        { from: 'x', to: 'y' },
        { from: 'y', to: 'x' },
      ],
      ['a -> b -> c -> a', 'd -> e -> f -> d', 'x -> y -> x'],
    ],
  ];

  it.each(uniquePaths)('will return a right of the unique paths on success (%s)', (_, input, expected) => {
    const result = cycleAnalyser(new Set(input), 1000);

    expect(result).toEqual(right(expected));
  });
});
