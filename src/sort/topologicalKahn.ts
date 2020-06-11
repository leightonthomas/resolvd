import { Either, left, right } from "../model/either";
import { every, filter, some } from "../model/set";

export interface Edge<T> {
  from: T;
  to: T;
}

/**
 * @see {@link https://en.wikipedia.org/wiki/Topological_sorting}
 *
 * @param nodes - The graph's nodes
 * @param edges - The edges of the graph
 * @param eq    - A function to check for equality between 2 objects of type T
 */
export const topologicalKahn = <T>(
  nodes: Set<T>,
  edges: Set<Edge<T>>,
  eq: (a: T, b: T) => boolean,
): Either<Set<Edge<T>>, T[]> => {
  const sorted: T[] = [];
  // no nice way to pop from a Set so use an objects keys instead
  const nodesNoIncoming = new Set(
    filter(nodes, node => every(edges, edge => ! eq(edge.to, node))),
  );

  while (nodesNoIncoming.size > 0) {
    // pop from the set - this is safe as we've checked the size of the Set already
    let key: T;
    for(key of nodesNoIncoming);
    nodesNoIncoming.delete(key!);

    sorted.push(key!);

    filter(edges, edge => eq(edge.from, key!)).forEach(edge => {
      const edgeTo = edge.to;
      edges.delete(edge);

      // If there are any remaining edges that go from any node to this one (edgeTo), then it
      // has dependencies remaining
      if (some(edges, e => eq(e.to, edgeTo))) {
        return;
      }

      nodesNoIncoming.add(edgeTo)
    });
  }

  if (edges.size > 0) {
    return left(edges);
  }

  return right(sorted);
};

