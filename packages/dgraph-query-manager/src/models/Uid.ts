import * as crypto from 'crypto';
import { BaseModel } from './BaseModel';
import { Serialization } from '../classes';

enum UidTypes {
  Base16,
  Base64
}

interface UidInterface {
  type: UidTypes;
  uid: string;
}

export type UidParamsType =
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
export class Uid implements UidInterface {
  type: UidTypes.Base64;
  uid: string;

  constructor(value?: UidParamsType) {
    if (typeof value === undefined) {
      this.uid = Uid.generateString(this.type);
    } else if (value instanceof Uid) {
      Object.assign(this, value);
    } else if (value instanceof Serialization) {
      if (value.uid) {
        this.uid = this.getUidAsHex(value.uid);
      }
    } else if (value instanceof BaseModel) {
      if (value.uid) {
        this.uid = this.getUidAsHex(value.uid);
      }
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'object'
    ) {
      // (typeof value === 'object' && Array.isArray(value))) {
      this.uid = this.getUidAsHex(value);
    } else {
      this.uid = Uid.generateString(value);
    }
  }

  toString(): string {
    return this.uid;
  }

  /**
   * Generates a new random Uid string.
   * @param {UidTypes} type
   * @param {number} byteCount
   * @returns {string}
   */
  static generateString(
    type: UidTypes = UidTypes.Base64,
    byteCount = 12
  ): string {
    const base64 = crypto
      .randomBytes(byteCount)
      .toString('base64')
      .toLowerCase();
    switch (type) {
      case UidTypes.Base64:
        return base64;
      case UidTypes.Base16:
        return crypto
          .randomBytes(byteCount)
          .toString('hex')
          .toLowerCase();
      default:
        return base64;
    }
  }

  /**
   * Convert Uid value to hex representation.
   * @param {number | string | object} value
   * @returns {string}
   */
  private getUidAsHex(value: number | string | object | any): string {
    if (typeof value === 'string') {
      if (value.slice(0, 2) === '0x') {
        return value;
      } else {
        return `0x${parseInt(value).toString(16)}`;
      }
    } else if (typeof value === 'number') {
      return `0x${parseInt(value.toString()).toString(16)}`;
    } else if (typeof value === 'object' && Array.isArray(value)) {
      // Assume first value is Uid.
      return this.getUidAsHex(value[0]);
    } else if (typeof value === 'object' && value.hasOwnProperty('uid')) {
      return this.getUidAsHex(value.uid);
    }
    return Uid.generateString(this.type);
  }

  /**
   * See: https://discuss.dgraph.io/t/high-number-of-transaction-abortions-seeking-write-strategy/3287
   * @param {number} id
   * @param {string} type
   * @param {Object} txn
   * @returns {Promise<any>}
   */
  // async getUidByType(id: number, type: string, txn?: Object) {
  //     // NOTE: No need for discard(), query only doesn't need discard(), and if we pass in txn, parent function handles discard
  //     const transaction = txn || dgraphClient.leaseClient().newTxn();
  //     const query = `{exists(func: eq(id, ${id})) @filter(has(_${type})) { uid }}`;
  //     let res;
  //     try {
  //         res = await transaction.query(query);
  //         const result = res.getJson();
  //         if (result && result.exists && result.exists.length > 0) {
  //             return Promise.resolve(result.exists[0].uid);
  //         }
  //         return Promise.resolve(undefined);
  //     } catch (err) {
  //         // Logger.error(`getUidByType(${id}, "${type}") FAILED, ${err.message}`);
  //         return Promise.reject(err);
  //     }
  // }
}
