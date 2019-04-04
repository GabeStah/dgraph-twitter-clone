'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// Lib
const dgraph_js_http_1 = require('dgraph-js-http');
// Local
const config_1 = require('../config');
const logger_1 = require('../logger');
const MutationTypes_1 = require('./MutationTypes');
class DgraphAdapterHttp {
  constructor(address) {
    /**
     * Endpoint address of Dgraph server.
     */
    this.address = config_1.default.dgraph.adapter.address;
    if (address) this.address = address;
    this.clientStub = new dgraph_js_http_1.DgraphClientStub(this.address);
    this.client = new dgraph_js_http_1.DgraphClient(this.clientStub);
  }
  /**
   * Alter the database schema.
   * @param {string} schema
   * @returns {Promise<boolean>}
   */
  async alterSchema(schema) {
    try {
      await this.client.alter({ schema });
      logger_1.default.info(`Dgraph schema altered: %s`, schema);
      return true;
    } catch (error) {
      logger_1.default.error(
        `Dgraph schema alteration failed, error: %s`,
        error
      );
      return false;
    }
  }
  /**
   * Drop all database data.
   * @returns {Promise<boolean>}
   */
  async dropAll() {
    try {
      await await this.client.alter({ dropAll: true });
      logger_1.default.info(`All Dgraph data dropped.`);
      return true;
    } catch (error) {
      logger_1.default.error(`Dgraph data drop failed, error: %s`, error);
      return false;
    }
  }
  /**
   * Recursively flattens arrays within passed object.
   * Sets object key value pointing to a single-element array to value of that only element.
   * @param {object} obj
   * @returns {any}
   */
  static flattenArrays(obj) {
    let copy = obj;
    if (Array.isArray(obj) && obj.length === 1) {
      copy = DgraphAdapterHttp.flattenArrays(copy[0]);
    } else if (Array.isArray(obj)) {
      obj.forEach((value, key) => {
        copy[key] = DgraphAdapterHttp.flattenArrays(value);
      });
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (Array.isArray(obj[key]) && obj[key].length === 1) {
            // Set keyvalue to first (and only) array value.
            copy[key] = DgraphAdapterHttp.flattenArrays(obj[key][0]);
          }
        }
      }
    }
    return copy;
  }
  static flattenArraysInObject(obj) {
    const copy = obj;
    Object.entries(obj).forEach(([key, value]) => {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(value)) {
          if (value.length === 1) {
            // Set key value to first (and only) array value.
            copy[key] = DgraphAdapterHttp.flattenArraysInObject(value[0]);
          } else {
            // Retain original array
            copy[key] = DgraphAdapterHttp.flattenArraysInObject(value);
          }
        } else {
          copy[key] = DgraphAdapterHttp.flattenArraysInObject(value);
        }
      }
    });
    return copy;
  }
  /**
   * Execute a database mutation using passed payload object or BaseModel<T> instance.
   * @param {Serialization} serialization
   * @param {MutationTypes} mutationType
   * @param {boolean} commitNow
   * @returns {Promise<Partial<T>>}
   */
  async mutate(
    serialization,
    mutationType = MutationTypes_1.MutationTypes.SetJson,
    commitNow = false
  ) {
    if (serialization.request === undefined) {
      throw Error(
        `DgraphAdapterHttp.mutate error, payload undefined for data: ${
          serialization.data
        }`
      );
    }
    const transaction = this.client.newTxn();
    const uids = [];
    logger_1.default.debug(
      'DgraphAdapterHttp.mutate, payload: %o',
      serialization
    );
    try {
      const payload = {};
      payload.commitNow = commitNow;
      switch (mutationType) {
        case MutationTypes_1.MutationTypes.SetJson:
          payload.setJson = serialization.request;
          break;
        case MutationTypes_1.MutationTypes.DeleteJson:
          payload.deleteJson = serialization.request;
          break;
      }
      const assigned = await transaction.mutate(payload);
      if (!commitNow) await transaction.commit();
      Object.entries(assigned.data.uids).forEach(([key, uid]) =>
        uids.push(uid)
      );
    } catch (e) {
      logger_1.default.error(
        'DgraphAdapterHttp.mutate, payload: %o, mutationType: %o, error: %o',
        serialization,
        mutationType,
        e
      );
    } finally {
      await transaction.discard();
    }
    // Assign generated uids
    if (uids.length > 0) serialization.uid = uids;
    return serialization;
  }
  /**
   * Execute a database query.
   * @param {string} serialization
   * @returns {Promise<string>}
   */
  async query(serialization) {
    const transaction = this.client.newTxn();
    try {
      const res = await transaction.query(serialization.request);
      serialization.response = DgraphAdapterHttp.flattenArrays(res.data);
    } catch (e) {
      logger_1.default.error('DgraphAdapterHttp.query, error: %o', e);
    } finally {
      await transaction.discard();
    }
    return serialization;
  }
  /**
   * Execute a database query with paramTypes.
   * @param {string} serialization
   * @param vars
   * @returns {Promise<any>}
   */
  async queryWithVars(serialization, vars) {
    const transaction = this.client.newTxn();
    try {
      const res = await transaction.queryWithVars(serialization.request, vars);
      serialization.response = DgraphAdapterHttp.flattenArrays(res.data);
    } catch (e) {
      logger_1.default.error(
        'DgraphAdapterHttp.queryWithVars, query: %s, paramTypes: %o, error: %o',
        serialization,
        vars,
        e
      );
    } finally {
      await transaction.discard();
    }
    return serialization;
  }
}
exports.DgraphAdapterHttp = DgraphAdapterHttp;

//# sourceMappingURL=DgraphAdapterHttp.js.map
