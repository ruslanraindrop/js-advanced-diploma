import showInformation from '../showInformation';

test('Проверка вывод краткого состояния Bowman', () => {
  const character = {
    type: 'Daemon',
    health: 100,
    level: 3,
    attack: 10,
    defence: 40,
  };
  const received = showInformation(character);
  const expected = '\u{1F396}3 \u{2694}10 \u{1F6E1}40 \u{2764}100';

  expect(received).toBe(expected);
});
