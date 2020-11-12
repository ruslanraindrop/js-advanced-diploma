/* eslint-disable no-new */
import Character from '../Character';
import Daemon from '../characters/Daemon';

test('Должен выдавать ошибку', () => {
  expect(() => {
    new Character();
  }).toThrow('Ошибка! Нельзя создавать персонажей через new Character()');
});

test('Создаст персонажа Daemon первого уровня', () => {
  const expected = {
    level: 1,
    health: 50,
    type: 'daemon',
    attack: 10,
    defence: 40,
    distanceTravel: 1,
    distanceAttack: 4,
  };
  const received = new Daemon(1);
  expect(received).toEqual(expected);
});
