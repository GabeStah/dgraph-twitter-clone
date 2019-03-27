/**
 * Retrieves a random element from an Array.
 * @param elements
 */
export function getRandomElement(elements: any[]): any {
  return elements[Math.floor(Math.random() * elements.length)];
}

/**
 * Retrieves a random element from an enum.
 * @param enumeration
 */
export function getRandomEnumElement(enumeration: any): any {
  let values = Object.keys(enumeration);
  // Remove latter half, to retain only index values.
  values = values.slice(values.length / 2);
  return enumeration[values[Math.floor(Math.random() * values.length)]];
}

/**
 * Obtains a random number between the min and max values.
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values
 * @param min
 * @param max
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Returns a boolean value based on weighted chance.
 * @param chance
 */
export function weightedBoolean(chance = 0.5): boolean {
  return Math.random() >= 1 - chance;
}
