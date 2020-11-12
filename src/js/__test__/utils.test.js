import { calcTileType } from '../utils';

test('Должен отрисовывать границы', () => {
  expect(calcTileType(0, 8)).toBe('top-left');
  expect(calcTileType(7, 8)).toBe('top-right');
  expect(calcTileType(3, 8)).toBe('top');
  expect(calcTileType(63, 8)).toBe('bottom-right');
  expect(calcTileType(56, 8)).toBe('bottom-left');
  expect(calcTileType(8, 8)).toBe('left');
  expect(calcTileType(60, 8)).toBe('bottom');
  expect(calcTileType(15, 8)).toBe('right');
  expect(calcTileType(10, 8)).toBe('center');
});
