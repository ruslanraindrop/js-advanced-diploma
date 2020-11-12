/* eslint-disable quotes */
import MockGameStateService from './MockGameStateService';
import funcForMock from './funcForMock';

jest.mock('./funcForMock');
beforeEach(() => {
  jest.resetAllMocks();
});

test('Загрузка должна пройти успешно', () => {
  const expected = `{"point":20,"maxPoint":30,"level":2,"currentTheme":"randomTheme","userPositions":[1,2,3]}`;
  funcForMock.mockReturnValue(expected);
  const received = MockGameStateService.load();
  expect(JSON.stringify(received)).toBe(expected);
});

test('Должна быть выброшена ошибка', () => {
  const expected = '';
  funcForMock.mockReturnValue(expected);

  expect(() => {
    MockGameStateService.load();
  }).toThrow();
});
