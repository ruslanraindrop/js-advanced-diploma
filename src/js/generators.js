/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  for (let i = 0; i < allowedTypes.length; i += 1) {
    const level = Math.floor(Math.random() * maxLevel + 1);
    yield new allowedTypes[i](level);
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const character = characterGenerator(allowedTypes, maxLevel);
  const team = [];
  for (let i = 0; i < characterCount; i += 1) {
    team.push(character.next().value);
  }
  return team;
}
