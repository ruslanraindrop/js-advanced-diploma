import { allowedValuesMove, allowedValuesAttack } from '../allowedCells';

test('Должны совпасть доступные клетки для перемещения', () => {
  const expected = allowedValuesMove(0, 2, 8);
  const received = [1, 8, 9, 2, 16, 18];
  expect(received).toEqual(expected);
});

test('Должны совпасть доступные клетки для атаки', () => {
  const expected = allowedValuesAttack(0, 2, 8);
  const received = [1, 8, 9, 2, 16, 18];
  expect(received).toEqual(expected);
});
