/* eslint-disable linebreak-style */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import GamePlay from './GamePlay';
import cursors from './cursors';
import Team from './Team';

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
    this.point = 0;
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
    // Определяем игрока
    this.player = 'user';

    // Генерируем команды и отрисовываем персонажей для каждого уровня
    let userTeam = [];
    let enemyTeam = [];

    if (this.level === 1) {
      this.currentTheme = themes.prairie;
      userTeam = generateTeam(Team.userChars, 1, 2);
      enemyTeam = generateTeam(Team.enemyChars, 1, 2);
      this.pushingCharacters(userTeam, enemyTeam, this.level);
    } else if (this.level === 2) {
      this.currentTheme = themes.desert;
      userTeam = generateTeam(Team.userChars, 1, 1);
      enemyTeam = generateTeam(Team.enemyChars, 2, userTeam.length + this.userPositions.length);
      this.pushingCharacters(userTeam, enemyTeam, this.level);
    } else if (this.level === 3) {
      this.currentTheme = themes.arctic;
      userTeam = generateTeam(Team.userChars, 2, 2);
      enemyTeam = generateTeam(Team.enemyChars, 3, userTeam.length + this.userPositions.length);
      this.pushingCharacters(userTeam, enemyTeam, this.level);
    } else if (this.level === 4) {
      this.currentTheme = themes.mountain;
      userTeam = generateTeam(Team.userChars, 3, 2);
      enemyTeam = generateTeam(Team.enemyChars, 4, userTeam.length + this.userPositions.length);
      this.pushingCharacters(userTeam, enemyTeam, this.level);
    } else {
      this.blockedBoard = true;
      GamePlay.showMessage(`Ваши очки: ${this.point}`);
    }

    this.gamePlay.drawUi(this.currentTheme);
    this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
  }

  pushingCharacters(userTeam, enemyTeam, level) {
    // Задаем допустимые значения в столбцах
    const columnUserOne = [];
    const columnUserTwo = [];
    const columnEnemyOne = [];
    const columnEnemyTwo = [];
    function teamPosition(teamName, index) {
      for (let i = 0; i < index; i += 1) {
        if ((teamName === 'user') && (i % 8 === 0)) {
          columnUserOne.push(i);
          columnUserTwo.push(i + 1);
        } else if ((teamName === 'enemy') && (i % 8 === 0)) {
          columnEnemyOne.push(i + 6);
          columnEnemyTwo.push(i + 7);
        }
      }
    }
    teamPosition('user', 63);
    teamPosition('enemy', 63);

    // Выбираем случайные значения из массива столбца
    const userPlayerOne = columnUserOne[Math.floor(Math.random() * 8)];
    const userPlayerTwo = columnUserTwo[Math.floor(Math.random() * 8)];
    const enemyPlayerOne = columnEnemyOne[Math.floor(Math.random() * 8)];
    const enemyPlayerTwo = columnEnemyTwo[Math.floor(Math.random() * 8)];

    function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }

    // Добавляем игроков в зависимости от уровня
    // !!!Возникла проблема с попаданием на одинаковые клетки + пока не реализовал рандом для персонажей
    if (level === 1) {
      this.userPositions.push(new PositionedCharacter(userTeam[0], userPlayerOne));
      this.userPositions.push(new PositionedCharacter(userTeam[1], userPlayerTwo));
      this.enemyPositions.push(new PositionedCharacter(enemyTeam[getRandomInt(enemyTeam.length)], enemyPlayerOne));
      this.enemyPositions.push(new PositionedCharacter(enemyTeam[getRandomInt(enemyTeam.length)], enemyPlayerTwo));
    } else if (level === 2) {
      if (userTeam.length <= Team.userChars.length) {
        this.userPositions.push(new PositionedCharacter(userTeam[getRandomInt(userTeam.length)], userPlayerOne));
      } else {
        this.userPositions.push(new PositionedCharacter(userTeam[1], userPlayerOne));
      }
    } else if (level === 3) {
      if (userTeam.length <= Team.userChars.length) {
        this.userPositions.push(new PositionedCharacter(userTeam[getRandomInt(userTeam.length)], userPlayerOne));
        this.userPositions.push(new PositionedCharacter(userTeam[getRandomInt(userTeam.length)], userPlayerTwo));
      } else {
        this.userPositions.push(new PositionedCharacter(userTeam[2], userPlayerOne));
        this.userPositions.push(new PositionedCharacter(userTeam[2], userPlayerTwo));
      }
    } else if (level === 4) {
      if (userTeam.length <= Team.userChars.length) {
        this.userPositions.push(new PositionedCharacter(userTeam[getRandomInt(userTeam.length)], userPlayerOne));
        this.userPositions.push(new PositionedCharacter(userTeam[getRandomInt(userTeam.length)], userPlayerTwo));
      } else {
        this.userPositions.push(new PositionedCharacter(userTeam[2], userPlayerOne));
        this.userPositions.push(new PositionedCharacter(userTeam[2], userPlayerTwo));
      }
    }
    // Добавляем противников в том же количестве, что и игроков
    if (level !== 1) {
      console.log(enemyTeam.length);
      for (let i = 0; i < this.userPositions.length; i += 1) {
        this.enemyPositions.push(new PositionedCharacter(enemyTeam[getRandomInt(Team.enemyChars.length)], columnEnemyOne[Math.floor(Math.random() * 8)]));
      }
    }
  }

  // Повышаем уровень
  levelUp() {
    for (const item of this.userPositions) {
      item.character.level += 1;
      item.character.attack = this.characteristicsLevelUp(item.character.attack, item.character.health);
      item.character.defence = this.characteristicsLevelUp(item.character.defence, item.character.health);
      if ((item.character.health + 80) < 100) {
        item.character.health += 80;
      } else {
        item.character.health = 100;
      }
    }
  }

  // Повышаем характеристики
  characteristicsLevelUp(attackBefore, life) {
    return Math.floor(Math.max(attackBefore, attackBefore * (1.8 - life / 100)));
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
  // !!!Возникла проблема с одинаковыми персонажами. Здоровье снимается у всех одинаковых игроков
  async characterAttack(attacker, attacked) {
    const attackedCharacter = attacked.character;
    const damage = Math.floor(Math.max(attacker.attack - attackedCharacter.defence, attacker.attack * 0.1));
    await this.gamePlay.showDamage(attacked.position, damage);

    // for (let i = 0; i < [...this.enemyPositions].length; i += 1) {
    //   if (attacked.position === [...this.enemyPositions][i].position) {
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
      // Если погибли все персонажи противника, повышаем левел и переходим на новый
      if (this.enemyPositions.length === 0) {
        for (const item of this.userPositions) {
          this.point += item.character.health;
        }
        this.levelUp();
        this.level += 1;
        this.drawTeams();
      }
    }
    this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
  }
}
