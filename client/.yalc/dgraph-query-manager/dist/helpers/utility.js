'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
/**
 * Retrieves a random element from an Array.
 * @param elements
 */
function getRandomElement(elements) {
  return elements[Math.floor(Math.random() * elements.length)];
}
exports.getRandomElement = getRandomElement;
/**
 * Retrieves a random element from an enum.
 * @param enumeration
 */
function getRandomEnumElement(enumeration) {
  let values = Object.keys(enumeration);
  // Remove latter half, to retain only index values.
  values = values.slice(values.length / 2);
  return enumeration[values[Math.floor(Math.random() * values.length)]];
}
exports.getRandomEnumElement = getRandomEnumElement;
/**
 * Obtains a random number between the min and max values.
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values
 * @param min
 * @param max
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
exports.getRandomInt = getRandomInt;
/**
 * Returns a boolean value based on weighted chance.
 * @param chance
 */
function weightedBoolean(chance = 0.5) {
  return Math.random() >= 1 - chance;
}
exports.weightedBoolean = weightedBoolean;

//# sourceMappingURL=utility.js.map
