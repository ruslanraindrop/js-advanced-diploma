/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import themes from './themes';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import GamePlay from './GamePlay';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.player = 'user';
    this.level = 1;
    this.userPositions = [];
    this.enemyPositions = [];
    this.selected = false;
    this.selectedIndex = 0;
    this.selectedCharacter = {};
    this.icons = {
      level: '\u{1F396}',
      attack: '\u{2694}',
      defence: '\u{1F6E1}',
      health: '\u{2764}',
    };
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.mouseEvents();
    this.drawTeams();
  }

  mouseEvents() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  drawTeams() {
    // Выбираем тему. Пока в ручном режиме
    this.gamePlay.drawUi(themes.prairie);

    // Создаем массивы игроков, столбцы для расположения и вызываем teamPosition для определения позиций в столбцах
    const userChars = [Bowman, Swordsman, Magician];
    const enemyChars = [Daemon, Undead, Vampire];
    const positionsUserOne = [];
    const positionsUserTwo = [];
    const positionsEnemyOne = [];
    const positionsEnemyTwo = [];

    function teamPosition(teamName, index) {
      for (let i = 0; i < index; i += 1) {
        if ((teamName === 'user') && (i % 8 === 0)) {
          positionsUserOne.push(i);
          positionsUserTwo.push(i + 1);
        } else if ((teamName === 'enemy') && (i % 8 === 0)) {
          positionsEnemyOne.push(i + 6);
          positionsEnemyTwo.push(i + 7);
        }
      }
    }

    teamPosition('user', 63);
    teamPosition('enemy', 63);

    // Генерируем команды и отрисовываем персонажей
    const userTeam = generateTeam(userChars, 1, 2);
    const enemyTeam = generateTeam(enemyChars, 1, 2);
    const userPlayerOne = positionsUserOne[Math.floor(Math.random() * 8)];
    const userPlayerTwo = positionsUserTwo[Math.floor(Math.random() * 8)];
    const enemyPlayerOne = positionsEnemyOne[Math.floor(Math.random() * 8)];
    const enemyPlayerTwo = positionsEnemyTwo[Math.floor(Math.random() * 8)];
    this.userPositions = [new PositionedCharacter(userTeam[0], userPlayerOne), new PositionedCharacter(userTeam[1], userPlayerTwo)];
    this.enemyPositions = [new PositionedCharacter(enemyTeam[Math.floor(Math.random() * 2)], enemyPlayerOne), new PositionedCharacter(enemyTeam[Math.floor(Math.random() * 2)], enemyPlayerTwo)];
    this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
  }

  async onCellClick(index) {
    // TODO: react to click

    // Выделяем одного из своих персонажей
    this.index = index;
    if (this.funcFindIndex([...this.userPositions]) !== -1) {
      this.gamePlay.deselectCell(this.selectedIndex);
      this.gamePlay.selectCell(index);
      this.selectedIndex = index;
      this.selectedCharacter = [...this.userPositions].find((item) => item.position === index);
      this.selected = true;

      // Если выбран противник, выдаем ошибку
    } else if ((!this.selected) && (this.funcFindIndex([...this.enemyPositions]) !== -1)) {
      GamePlay.showError('Это не игрок вашей команды!');

      // Если выделен персонаж и курсор в допустимом состоянии — меняем позицию и выделение, после чего перерисовываем команду
    } else if (this.selected && this.gamePlay.boardEl.style.cursor === 'pointer') {
      this.selectedCharacter.position = index;
      this.gamePlay.deselectCell(this.selectedIndex);
      this.gamePlay.deselectCell(index);
      this.selected = false;
      this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
      // Здесь будет переход хода
      this.player = 'enemy';

      // Если выделен персонаж и курсор в состоянии атаки, то атакуем
    } else if (this.selected && this.gamePlay.boardEl.style.cursor === 'crosshair') {
      const attackEnemy = [...this.enemyPositions].find((item) => item.position === index);
      this.gamePlay.deselectCell(this.selectedIndex);
      this.gamePlay.deselectCell(index);
      this.gamePlay.setCursor(cursors.auto);
      this.selected = false;

      await this.characterAttack(this.selectedCharacter.character, attackEnemy);
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    // Перебираем позиции игроков и отображаем состояние
    this.index = index;
    for (const item of [...this.userPositions, ...this.enemyPositions]) {
      if (item.position === index) {
        this.gamePlay.showCellTooltip(this.showInformation(item.character), index);
      }
    }
    // Если игрок выделен, то меняем курсор в зависимости от допустимых действий
    this.definingCursor();
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (this.selectedCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  // Формируем информацию о персонаже для отображения статуса
  showInformation(character) {
    return `${this.icons.level}${character.level} ${this.icons.attack}${character.attack} ${this.icons.defence}${character.defence} ${this.icons.health}${character.health}`;
  }

  // Определяем индекс
  funcFindIndex(positions) {
    return positions.findIndex((item) => item.position === this.index);
  }

  definingCursor() {
    // Если игрок выделен, то определяем допустимые значения для передвижения...
    if (this.selected) {
      const allowedMove = this.allowedValuesMove(this.selectedCharacter.position, this.selectedCharacter.character.distanceTravel, this.gamePlay.boardSize);
      const allowedAttack = this.allowedValuesAttack(this.selectedCharacter.position, this.selectedCharacter.character.distanceAttack, this.gamePlay.boardSize);

      // ...и меняем курсор
      if (this.funcFindIndex(this.userPositions) !== -1) {
        this.gamePlay.setCursor(cursors.pointer);
      } else if ((allowedMove.includes(this.index)) && (this.funcFindIndex([...this.userPositions, ...this.enemyPositions]) === -1)) {
        this.gamePlay.selectCell(this.index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
      } else if ((allowedAttack.includes(this.index)) && (this.funcFindIndex(this.enemyPositions) !== -1)) {
        this.gamePlay.selectCell(this.index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  // Определяем допустимые значения для движения
  allowedValuesMove(position, distance, boardSize) {
    const result = [];
    const itemRow = Math.floor(position / boardSize);
    const itemColumn = position % boardSize;

    for (let i = 1; i <= distance; i += 1) {
      if (itemColumn + i < 8) {
        result.push(itemRow * 8 + (itemColumn + i));
      }
      if (itemColumn - i >= 0) {
        result.push(itemRow * 8 + (itemColumn - i));
      }
      if (itemRow + i < 8) {
        result.push((itemRow + i) * 8 + itemColumn);
      }
      if (itemRow - i >= 0) {
        result.push((itemRow - i) * 8 + itemColumn);
      }
      if (itemRow + i < 8 && itemColumn + i < 8) {
        result.push((itemRow + i) * 8 + (itemColumn + i));
      }
      if (itemRow - i >= 0 && itemColumn - i >= 0) {
        result.push((itemRow - i) * 8 + (itemColumn - i));
      }
      if (itemRow + i < 8 && itemColumn - i >= 0) {
        result.push((itemRow + i) * 8 + (itemColumn - i));
      }
      if (itemRow - i >= 0 && itemColumn + i < 8) {
        result.push((itemRow - i) * 8 + (itemColumn + i));
      }
    }
    return result;
  }

  // Определяем допустимые значения для атаки
  allowedValuesAttack(position, distance, boardSize) {
    const result = [];
    const itemRow = Math.floor(position / boardSize);
    const itemColumn = position % boardSize;

    for (let i = 1; i <= distance; i += 1) {
      if (itemColumn + i < 8) {
        result.push(itemRow * 8 + (itemColumn + i));
      }
      if (itemColumn - i >= 0) {
        result.push(itemRow * 8 + (itemColumn - i));
      }
      if (itemRow + i < 8) {
        result.push((itemRow + i) * 8 + itemColumn);
      }
      if (itemRow - i >= 0) {
        result.push((itemRow - i) * 8 + itemColumn);
      }
      if (itemRow + i < 8 && itemColumn + i < 8) {
        result.push((itemRow + i) * 8 + (itemColumn + i));
      }
      if (itemRow - i >= 0 && itemColumn - i >= 0) {
        result.push((itemRow - i) * 8 + (itemColumn - i));
      }
      if (itemRow + i < 8 && itemColumn - i >= 0) {
        result.push((itemRow + i) * 8 + (itemColumn - i));
      }
      if (itemRow - i >= 0 && itemColumn + i < 8) {
        result.push((itemRow - i) * 8 + (itemColumn + i));
      }
    }
    return result;
  }

  // Атакуем противника attacked персонажем attacker
  // Возникла проблема с одинаковыми персонажами. При обращении через target здоровье снимается у всех одинаковых игроков
  async characterAttack(attacker, attacked) {
    const attackedCharacter = attacked.character;
    const damage = Math.floor(Math.max(attacker.attack - attackedCharacter.defence, attacker.attack * 0.1));
    await this.gamePlay.showDamage(attacked.position, damage);

    // Тут пытался добраться до персонажа с конкретной позицией, но здоровье все равно снимается у всех персонажей
    // for (let i = 0; i < [...this.enemyPositions].length; i += 1) {
    //   if (Object.entries([...this.enemyPositions][i])[1].includes(attacked.position)) {
    //     console.log([...this.enemyPositions]);
    //     [...this.enemyPositions][i].character.health -= damage;
    //   }
    // }

    attackedCharacter.health -= damage;
    if (this.player === 'user') {
      this.player = 'enemy';
    } else if (this.player === 'enemy') {
      this.player = 'user';
    }

    // Если персонаж погиб, убираем игрока
    if (attacked.character.health <= 0) {
      this.userPositions = this.userPositions.filter((item) => item.position !== attacked.position);
      this.enemyPositions = this.enemyPositions.filter((item) => item.position !== attacked.position);

      // Если погибли все персонажи юзера, то выдаем ошибку
      if (this.userPositions.length === 0) {
        GamePlay.showMessage('Вы проиграли!');
      }
      // ...здесь будет переход на следующий уровень, если погибли все персонажи противника
    }
    this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
  }
}
