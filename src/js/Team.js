import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

const userTeam = [Bowman, Swordsman, Magician];
const userTeamShort = [Bowman, Swordsman];
const enemyTeam = [Daemon, Undead, Vampire];

class Team {
  constructor() {
    this.userTeam = userTeam;
    this.userTeamShort = userTeamShort;
    this.enemyTeam = enemyTeam;
  }
}

const newTeam = new Team();
export default newTeam;
