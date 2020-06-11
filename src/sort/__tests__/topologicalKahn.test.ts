import { Edge, topologicalKahn } from "../topologicalKahn";
import { left, right } from "../../model/either";

describe('topological sorting using Kahn\'s algorithm', () => {
  const eqPrimitive = <T extends string|number>(a: T , b: T) => a === b;

  it('will allow an empty list of nodes to be passed and will return left if so', () => {
    const result = topologicalKahn<string>(new Set(), new Set([{ to: 'a', from: 'b' }]), eqPrimitive);

    expect(result).toEqual(left(new Set([{ to: 'a', from: 'b' }])));
  });

  it('will allow an empty list of edges', () => {
    const result = topologicalKahn<string>(
      new Set(['a', 'b', 'c']),
      new Set(),
      eqPrimitive,
    );

    expect(result).toEqual(right(['c', 'b' , 'a']));
  });

  const acyclicalProvider: [number[], Edge<number>[], number[]][] = [
    [
      [2, 3, 1, 4],
      [
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 1, to: 2 },
      ],
      [1, 2, 3, 4],
    ],

    [
      [7, 3, 5, 8, 11, 10, 9, 2],
      [
        { from: 5, to: 11 },
        { from: 11, to: 2 },
        { from: 11, to: 9 },
        { from: 7, to: 11 },
        { from: 7, to: 8 },
        { from: 8, to: 9 },
        { from: 11, to: 10 },
        { from: 3, to: 8 },
        { from: 3, to: 10 },
      ],
      [5, 3, 7, 8, 11, 10, 9, 2],
    ],

    [
      [6, 5, 2, 4, 3, 1],
      [
        { from: 1, to: 4 },
        { from: 1, to: 3 },
        { from: 1, to: 2 },
        { from: 3, to: 4 },
        { from: 4, to: 6 },
        { from: 5, to: 6 },
      ],
      [1, 2, 3, 4, 5, 6],
    ],
  ];

  it.each(acyclicalProvider)(
    'will return the correct order if there are no cycles in the graph (%#)',
    (nodes, edges, expected) => {
      const result = topologicalKahn<number>(new Set(nodes), new Set(edges), eqPrimitive);

      expect(result).toEqual(right(expected));
    },
  );

  const cyclicalProvider: [number[], Edge<number>[], Edge<number>[]][] = [
    [
      [2, 3, 1, 4],
      [
        { from: 2, to: 3 },
        { from: 3, to: 1 },
        { from: 1, to: 2 },
        { from: 1, to: 4 },
      ],
      [
        { from: 2, to: 3 },
        { from: 3, to: 1 },
        { from: 1, to: 2 },
        { from: 1, to: 4 },
      ],
    ],

    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 4, to: 5 },
        { from: 5, to: 6 },
        { from: 6, to: 7 },
        { from: 7, to: 8 },
        { from: 8, to: 9 },
        { from: 9, to: 10 },
        { from: 10, to: 11 },
        { from: 11, to: 1 },
      ],
      [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 4, to: 5 },
        { from: 5, to: 6 },
        { from: 6, to: 7 },
        { from: 7, to: 8 },
        { from: 8, to: 9 },
        { from: 9, to: 10 },
        { from: 10, to: 11 },
        { from: 11, to: 1 },
      ],
    ],

    [
      [2, 3, 1, 4],
      [
        { from: 1, to: 4 },
        { from: 2, to: 4 },
        { from: 4, to: 3 },
        { from: 3, to: 1 },
      ],
      [
        { from: 1, to: 4 },
        { from: 4, to: 3 },
        { from: 3, to: 1 },
      ],
    ],
  ];

  it.each(cyclicalProvider)(
    'will return a left containing problematic edges if the graph has a cycle (%#)',
    (nodes, edges, expected) => {
      const result = topologicalKahn<number>(new Set(nodes), new Set(edges), eqPrimitive);

      expect(result).toEqual(left(new Set(expected)));
    },
  );
});
