import { BaseModel } from './BaseModel';
import { Serialization } from '../classes';
declare enum UidTypes {
  Base16 = 0,
  Base64 = 1
}
interface UidInterface {
  type: UidTypes;
  uid: string;
}
export declare type UidParamsType =
  | BaseModel<any>
  | Uid
  | UidTypes
  | Serialization
  | string
  | string[]
  | number;
/**
 * Uid type to handle custom UIDs necessary for Dgraph integration.
 */
export declare class Uid implements UidInterface {
  type: UidTypes.Base64;
  uid: string;
  constructor(value?: UidParamsType);
  toString(): string;
  /**
   * Generates a new random Uid string.
   * @param {UidTypes} type
   * @param {number} byteCount
   * @returns {string}
   */
  static generateString(type?: UidTypes, byteCount?: number): string;
  /**
   * Convert Uid value to hex representation.
   * @param {number | string | object} value
   * @returns {string}
   */
  private getUidAsHex;
}
export {};
