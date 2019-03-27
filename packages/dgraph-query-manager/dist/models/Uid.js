'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const crypto = require('crypto');
const BaseModel_1 = require('./BaseModel');
const classes_1 = require('../classes');
var UidTypes;
(function(UidTypes) {
  UidTypes[(UidTypes['Base16'] = 0)] = 'Base16';
  UidTypes[(UidTypes['Base64'] = 1)] = 'Base64';
})(UidTypes || (UidTypes = {}));
/**
 * Uid type to handle custom UIDs necessary for Dgraph integration.
 */
class Uid {
  constructor(value) {
    if (typeof value === undefined) {
      this.uid = Uid.generateString(this.type);
    } else if (value instanceof Uid) {
      Object.assign(this, value);
    } else if (value instanceof classes_1.Serialization) {
      if (value.uid) {
        this.uid = this.getUidAsHex(value.uid);
      }
    } else if (value instanceof BaseModel_1.BaseModel) {
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
  toString() {
    return this.uid;
  }
  /**
   * Generates a new random Uid string.
   * @param {UidTypes} type
   * @param {number} byteCount
   * @returns {string}
   */
  static generateString(type = UidTypes.Base64, byteCount = 12) {
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
  getUidAsHex(value) {
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
}
exports.Uid = Uid;

//# sourceMappingURL=Uid.js.map
