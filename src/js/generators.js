/* eslint-disable linebreak-style */
/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const characterIndex = Math.floor(Math.random() * allowedTypes.length);
    const characterLevel = Math.floor((Math.random() * maxLevel) + 1);
    yield new allowedTypes[characterIndex](characterLevel);
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
