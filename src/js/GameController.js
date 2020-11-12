/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import GamePlay from './GamePlay';
import cursors from './cursors';
import Team from './Team';
import GameState from './GameState';
import showInformation from './showInformation';
import { allowedValuesMove, allowedValuesAttack } from './allowedCells';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.player = 'user';
    this.level = 1;
    this.currentTheme = themes.prairie;
    this.blockedBoard = false;
    this.userPositions = [];
    this.enemyPositions = [];
    this.userTeams = [];
    this.enemyTeams = [];
    this.selected = false;
    this.selectedIndex = 0;
    this.selectedCharacter = {};
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
    this.gamePlay.addNewGameListener(this.newGame.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
  }

  drawTeams() {
    // Определяем игрока
    this.player = 'user';

    // Генерируем команды и отрисовываем персонажей для каждого уровня
    if (this.level === 1) {
      this.userTeams = generateTeam(Team.userTeamShort, 1, 2);
      this.enemyTeams = generateTeam(Team.enemyTeam, 1, 2);
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
    } else if (this.level === 2) {
      this.currentTheme = themes.desert;
      this.userTeams = generateTeam(Team.userTeam, 1, 1);
      this.enemyTeams = generateTeam(Team.enemyTeam, 2, this.userTeams.length + this.userPositions.length);
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
      GamePlay.showMessage('Второй уровень!');
    } else if (this.level === 3) {
      this.currentTheme = themes.arctic;
      this.userTeams = generateTeam(Team.userTeam, 2, 2);
      this.enemyTeams = generateTeam(Team.enemyTeam, 3, this.userTeams.length + this.userPositions.length);
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
      GamePlay.showMessage('Третий уровень');
    } else if (this.level === 4) {
      this.currentTheme = themes.mountain;
      this.userTeams = generateTeam(Team.userTeam, 3, 2);
      this.enemyTeams = generateTeam(Team.enemyTeam, 4, this.userTeams.length + this.userPositions.length);
      this.addPositionCharacter(this.userTeams, this.enemyTeams);
      GamePlay.showMessage('Четвертый уровень');
    } else {
      this.blockedBoard = true;
      GamePlay.showMessage(`Игра окончена. Ваши очки: ${this.point}. Прошлый рекорд: ${this.maxPoints()}`);
      return;
    }

    const characterPositions = this.getPositions(this.userPositions.length);
    for (let i = 0; i < this.userPositions.length; i += 1) {
      this.userPositions[i].position = characterPositions.user[i];
      this.enemyPositions[i].position = characterPositions.enemy[i];
    }
    this.gamePlay.drawUi(this.currentTheme);
    this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
  }

  // Определяем рандомные позиции
  getPositions(length) {
    const position = {
      user: [],
      enemy: [],
    };
    let random;
    for (let i = 0; i < length; i += 1) {
      do {
        random = this.randomPosition();
      } while (position.user.includes(random));
      position.user.push(random);
      do {
        random = this.randomPosition(6);
      } while (position.enemy.includes(random));
      position.enemy.push(random);
    }
    return position;
  }

  randomPosition(columnEnemy = 0) {
    return (Math.floor(Math.random() * 8) * 8) + ((Math.floor(Math.random() * 2) + columnEnemy));
  }

  addPositionCharacter(userTeams, enemyTeams) {
    for (let i = 0; i < userTeams.length; i += 1) {
      this.userPositions.push(new PositionedCharacter(userTeams[i], 0));
    }
    for (let i = 0; i < enemyTeams.length; i += 1) {
      this.enemyPositions.push(new PositionedCharacter(enemyTeams[i], 0));
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
      // Переход хода
      this.player = 'enemy';
      this.enemyStrategy();
      // Если выделен персонаж и курсор в состоянии атаки, то атакуем
    } else if (this.selected && this.gamePlay.boardEl.style.cursor === 'crosshair') {
      const attackEnemy = [...this.enemyPositions].find((item) => item.position === index);
      this.gamePlay.deselectCell(this.selectedIndex);
      this.gamePlay.deselectCell(index);
      this.gamePlay.setCursor(cursors.auto);
      this.selected = false;
      await this.characterAttack(this.selectedCharacter.character, attackEnemy);
      if (this.enemyPositions.length > 0) {
        this.enemyStrategy();
      }
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    // Перебираем позиции игроков и отображаем состояние
    this.index = index;
    for (const item of [...this.userPositions, ...this.enemyPositions]) {
      if (item.position === index) {
        this.gamePlay.showCellTooltip(showInformation(item.character), index);
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

  // Определяем индекс
  funcFindIndex(positions) {
    return positions.findIndex((item) => item.position === this.index);
  }

  definingCursor() {
    // Если игрок выделен, то определяем допустимые значения для передвижения...
    if (this.selected) {
      const allowedMove = allowedValuesMove(this.selectedCharacter.position, this.selectedCharacter.character.distanceTravel, this.gamePlay.boardSize);
      const allowedAttack = allowedValuesAttack(this.selectedCharacter.position, this.selectedCharacter.character.distanceAttack, this.gamePlay.boardSize);

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

  async enemyAttacks(character, target) {
    await this.characterAttack(character, target);
    this.player = 'user';
  }

  // Атакуем противника attacked персонажем attacker
  async characterAttack(attacker, attacked) {
    const attackedCharacter = attacked.character;
    const damage = Math.floor(Math.max(attacker.attack - attackedCharacter.defence, attacker.attack * 0.1));
    await this.gamePlay.showDamage(attacked.position, damage);
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

  enemyStrategy() {
    if (this.player === 'enemy') {
      // Атакуем игроков user в рамках допустимых значений
      for (const itemEnemy of [...this.enemyPositions]) {
        const allowAttack = allowedValuesAttack(itemEnemy.position, this.selectedCharacter.character.distanceAttack, this.gamePlay.boardSize);
        const target = this.enemyAttack(allowAttack);
        if (target !== null) {
          this.enemyAttacks(itemEnemy.character, target);
          return;
        }
      }

      // Двигаемся случайным игроком
      const randomIndex = Math.floor(Math.random() * [...this.enemyPositions].length);
      const randomEnemy = [...this.enemyPositions][randomIndex];
      this.enemyMove(randomEnemy);
      this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
      this.player = 'user';
    }
  }

  enemyMove(itemEnemy) {
    const tempEnemy = itemEnemy;
    const itemEnemyDistance = itemEnemy.character.distanceTravel;
    let tempRow;
    let tempColumn;
    let stepRow;
    let stepColumn;
    let Steps;
    const itemEnemyRow = this.positionRow(tempEnemy.position);
    const itemEnemyColumn = this.positionColumn(tempEnemy.position);
    let nearUser = {};

    for (const itemUser of [...this.userPositions]) {
      const itemUserRow = this.positionRow(itemUser.position);
      const itemUserColumn = this.positionColumn(itemUser.position);
      stepRow = itemEnemyRow - itemUserRow;
      stepColumn = itemEnemyColumn - itemUserColumn;
      Steps = Math.abs(stepRow) + Math.abs(stepColumn);

      if (nearUser.steps === undefined || Steps < nearUser.steps) {
        nearUser = {
          steprow: stepRow,
          stepcolumn: stepColumn,
          steps: Steps,
          positionRow: itemUserRow,
          positionColumn: itemUserColumn,
        };
      }
    }

    // Движение по диагонали
    if (Math.abs(nearUser.steprow) === Math.abs(nearUser.stepcolumn)) {
      if (Math.abs(nearUser.steprow) > itemEnemyDistance) {
        tempRow = (itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow)));
        tempColumn = (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn)));

        tempEnemy.position = this.rowColumnToIndex(tempRow, tempColumn);
      } else {
        tempRow = (itemEnemyRow - (nearUser.steprow - (1 * Math.sign(nearUser.steprow))));
        tempColumn = (itemEnemyColumn - (nearUser.stepcolumn - (1 * Math.sign(nearUser.steprow))));

        tempEnemy.position = this.rowColumnToIndex(tempRow, tempColumn);
      }
    } else if (nearUser.stepcolumn === 0) {
      // Движение по вертикали
      if (Math.abs(nearUser.steprow) > itemEnemyDistance) {
        tempRow = (itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow)));

        tempEnemy.position = this.rowColumnToIndex(tempRow, (itemEnemyColumn));
      } else {
        tempRow = (itemEnemyRow - (nearUser.steprow - (1 * Math.sign(nearUser.steprow))));

        tempEnemy.position = this.rowColumnToIndex(tempRow, (itemEnemyColumn));
      }
    } else if (nearUser.steprow === 0) {
      // horizontal travel
      if (Math.abs(nearUser.stepcolumn) > itemEnemyDistance) {
        tempColumn = (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn)));

        tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), tempColumn);
      } else {
        const tempFormul = (nearUser.stepcolumn - (1 * Math.sign(nearUser.stepcolumn)));
        tempColumn = (itemEnemyColumn - tempFormul);

        tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), tempColumn);
      }
    } else if (Math.abs(nearUser.steprow) > Math.abs(nearUser.stepcolumn)) {
      if (Math.abs(nearUser.steprow) > itemEnemyDistance) {
        tempRow = (itemEnemyRow - (itemEnemyDistance * Math.sign(nearUser.steprow)));

        tempEnemy.position = this.rowColumnToIndex(tempRow, (itemEnemyColumn));
      } else {
        tempRow = (itemEnemyRow - (nearUser.steprow));

        tempEnemy.position = this.rowColumnToIndex(tempRow, (itemEnemyColumn));
      }
    } else if (Math.abs(nearUser.stepcolumn) > itemEnemyDistance) {
      tempColumn = (itemEnemyColumn - (itemEnemyDistance * Math.sign(nearUser.stepcolumn)));

      tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), tempColumn);
    } else {
      tempEnemy.position = this.rowColumnToIndex((itemEnemyRow), (itemEnemyColumn));
    }
  }

  positionRow(index) {
    return Math.floor(index / this.gamePlay.boardSize);
  }

  positionColumn(index) {
    return index % this.gamePlay.boardSize;
  }

  rowColumnToIndex(row, column) {
    return (row * 8) + column;
  }

  enemyAttack(allowAttack) {
    for (const itemUser of [...this.userPositions]) {
      if (allowAttack.includes(itemUser.position)) {
        return itemUser;
      }
    }
    return null;
  }

  // Новая игра
  newGame() {
    this.blockedBoard = false;
    const maxPoint = this.maxPoints();
    const currentGameState = this.stateService.load();
    if (currentGameState) {
      currentGameState.maxPoint = maxPoint;
      this.stateService.save(GameState.from(currentGameState));
    }
    this.userPositions = [];
    this.enemyPositions = [];
    this.level = 1;
    this.point = 0;
    this.currentTheme = themes.prairie;
    this.drawTeams();
    GamePlay.showMessage('Новая игра');
  }

  // Сохранить игру
  saveGame() {
    const maxPoint = this.maxPoints();
    const currentGameState = {
      point: this.point,
      maxPoint,
      level: this.level,
      currentTheme: this.currentTheme,
      userPositions: this.userPositions,
      enemyPositions: this.enemyPositions,
    };
    this.stateService.save(GameState.from(currentGameState));
    GamePlay.showMessage('Игра сохранена!');
  }

  // Загрузить игру
  loadGame() {
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState) {
        this.point = loadGameState.point;
        this.level = loadGameState.level;
        this.currentTheme = loadGameState.currentTheme;
        this.userPositions = loadGameState.userPositions;
        this.enemyPositions = loadGameState.enemyPositions;
        this.gamePlay.drawUi(this.currentTheme);
        this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
      }
      GamePlay.showMessage('Игра загружена');
    } catch (e) {
      GamePlay.showMessage(`Ошибка: ${e}`);
      this.newGame();
    }
  }

  // Статистика
  maxPoints() {
    let maxPoint = 0;
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState) {
        maxPoint = Math.max(loadGameState.maxPoint, this.point);
      }
    } catch (e) {
      maxPoint = this.point;
    }
    return maxPoint;
  }
}
