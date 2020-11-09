/* eslint-disable linebreak-style */
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

const userTeam = [Bowman, Swordsman, Magician];
const enemyTeam = [Daemon, Undead, Vampire];

class Team {
  constructor() {
    this.userChars = userTeam;
    this.enemyChars = enemyTeam;
  }
}

const newTeam = new Team();
export default newTeam;
