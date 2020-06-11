import { equals, filter } from "./model/set";
import { Edge } from "./sort/topologicalKahn";
import { Either, left, right } from "./model/either";

/**
 * This is pretty expensive but it'll only run if the initial sort fails, so shouldn't be an issue as it'll never run
 * in production
 *
 * @param remainingEdges - The edges that were left at the end of the initial sort
 * @param maxDepth       - The maximum depth to check when resolving a circular dependency chain. It will return a Left
 *                         early if this value is met, without resolving other chains.
 *
 * @return A Left with an error message or a Right of the offending circular dependency chains in string format
 */
export const cycleAnalyser = (remainingEdges: Set<Edge<string>>, maxDepth: number): Either<string, string[]> => {
  const paths: [string, Set<string>][] = [];
  for (let edge of remainingEdges) { // O(n)
    const circularSet = {
      path: [edge.from, edge.to],
      uniqueServices: new Set<string>([edge.from, edge.to]),
    };
    let iterations = 0;

    let lastKey: string = edge.to;
    while ((lastKey !== edge.from)) {
      let foundSameEdge = false;

      // don't check edges with the same 'from' and a different 'to' so that we don't get caught in a
      // different circular loop if one exists
      for (let nextEdge of filter(remainingEdges, r => r.from !== edge.from && r.to !== edge.to)) { // O (n-1)
        if (nextEdge.from !== lastKey) {
          continue;
        }

        circularSet.path.push(nextEdge.to);
        circularSet.uniqueServices.add(nextEdge.to);
        lastKey = nextEdge.to;
        foundSameEdge = true;

        break;
      }

      // If we haven't found the same edge then this chain of services has finished without a circular reference
      if ( ! foundSameEdge) {
        break;
      }

      iterations++

      if (iterations > maxDepth) {
        return left(
          `Reached max depth (${maxDepth}) while trying to resolve dependencies for "${circularSet.path[0]}"`,
        );
      }
    }

    // if the first element and the last are not the same then it's just a left-over non-circular set of services
    if (circularSet.path[0] !== circularSet.path[circularSet.path.length - 1]) {
      continue;
    }

    // if we already have this unique combination of services then don't bother adding it again
    if (paths.some(pathPair => equals(pathPair[1], circularSet.uniqueServices))) {
      continue;
    }

    paths.push([circularSet.path.join(' -> '), circularSet.uniqueServices]);
  }

  return right(paths.map(pathPair => pathPair[0]));
};
