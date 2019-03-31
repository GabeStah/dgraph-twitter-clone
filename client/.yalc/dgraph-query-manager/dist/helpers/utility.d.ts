/**
 * Retrieves a random element from an Array.
 * @param elements
 */
export declare function getRandomElement(elements: any[]): any;
/**
 * Retrieves a random element from an enum.
 * @param enumeration
 */
export declare function getRandomEnumElement(enumeration: any): any;
/**
 * Obtains a random number between the min and max values.
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values
 * @param min
 * @param max
 */
export declare function getRandomInt(min: number, max: number): number;
/**
 * Returns a boolean value based on weighted chance.
 * @param chance
 */
export declare function weightedBoolean(chance?: number): boolean;
