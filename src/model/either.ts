export type Either<L, R> =
  | { type: 'left', value: L }
  | { type: 'right', value: R }
;

export const left = <L = never, R = never>(value: L): Either<L, R> => ({ type: 'left', value });
export const right = <L = never, R = never>(value: R): Either<L, R> => ({ type: 'right', value });
