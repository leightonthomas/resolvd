import { left, right } from "../either";

describe('either', () => {
  describe('left', () => {
    it('will create an object correctly', () => {
      expect(left('a')).toEqual({ type: 'left', value: 'a' });
    });
  });

  describe('right', () => {
    it('will create an object correctly', () => {
      expect(right('a')).toEqual({ type: 'right', value: 'a' });
    });
  });
});
