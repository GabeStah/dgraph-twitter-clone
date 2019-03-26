// Lib
import { DgraphClient, DgraphClientStub } from 'dgraph-js-http';
// Local
import config from '../config';
import logger from '../logger';
import { MutationTypes } from './MutationTypes';
import { Serialization } from '../classes';

export class DgraphAdapterHttp {
  /**
   * Endpoint address of Dgraph server.
   */
  address = config.dgraph.adapter.address;

  /**
   * Dgraph client.
   */
  protected client: NonNullable<DgraphClient>;

  /**
   * Dgraph client stub.
   */
  protected clientStub: NonNullable<DgraphClientStub>;

  constructor(address?: string) {
    if (address) this.address = address;
    this.clientStub = new DgraphClientStub(this.address);
    this.client = new DgraphClient(this.clientStub);
  }

  /**
   * Alter the database schema.
   * @param {string} schema
   * @returns {Promise<boolean>}
   */
  async alterSchema(schema: string): Promise<boolean> {
    return this.client
      .alter({ schema })
      .then(() => {
        logger.info(`Dgraph schema altered: %s`, schema);
        return true;
      })
      .catch(error => {
        logger.error(`Dgraph schema alteration failed, error: %s`, error);
        return false;
      });
  }

  /**
   * Drop all database data.
   * @returns {Promise<boolean>}
   */
  async dropAll(): Promise<boolean> {
    const result = await this.client
      .alter({ dropAll: true })
      .then(() => {
        logger.info(`All Dgraph data dropped.`);
        return true;
      })
      .catch(error => {
        logger.error(`Dgraph data drop failed, error: %s`, error);
        return false;
      });
    return true;
  }

  /**
   * Recursively flattens arrays within passed object.
   * Sets object key value pointing to a single-element array to value of that only element.
   * @param {object} obj
   * @returns {any}
   */
  static flattenArrays(obj: any) {
    const copy: any = obj;
    if (Array.isArray(obj)) {
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
    const copy: any = obj;
    Object.entries(obj).forEach(([key, value]) => {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(value)) {
          if (value.length === 1) {
            // Set keyvalue to first (and only) array value.
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
   * @param {any | BaseModel<T>} serialization
   * @param {MutationTypes} mutationType
   * @param {boolean} commitNow
   * @param {boolean} ignoreIndexConflict
   * @returns {Promise<Partial<T>>}
   */
  async mutate<T>(
    serialization: Serialization,
    mutationType: MutationTypes = MutationTypes.SetJson,
    commitNow = false
  ): Promise<Serialization> {
    if (serialization.request === undefined) {
      throw Error(
        `DgraphAdapterHttp.mutate error, payload undefined for data: ${
          serialization.data
        }`
      );
    }
    const transaction = this.client.newTxn();
    const uids: string[] = [];
    logger.debug('DgraphAdapterHttp.mutate, payload: %o', serialization);
    try {
      const payload: any = {};
      payload.commitNow = commitNow;
      switch (mutationType) {
        case MutationTypes.SetJson:
          payload.setJson = serialization.request;
          break;
        case MutationTypes.DeleteJson:
          payload.deleteJson = serialization.request;
          break;
      }
      const assigned = await transaction.mutate(payload);
      if (!commitNow) await transaction.commit();
      Object.entries(assigned.data.uids).forEach(([key, uid]) =>
        uids.push(uid)
      );
    } catch (e) {
      logger.error(
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
  async query<T>(serialization: Serialization): Promise<Serialization> {
    const transaction = this.client.newTxn();
    try {
      const res = await transaction.query(serialization.request);
      serialization.response = DgraphAdapterHttp.flattenArrays(res.data);
    } catch (e) {
      logger.error('DgraphAdapterHttp.query, error: %o', e);
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
  async queryWithVars(
    serialization: Serialization,
    vars?: any
  ): Promise<Serialization> {
    const transaction = this.client.newTxn();
    try {
      const res = await transaction.queryWithVars(serialization.request, vars);
      serialization.response = DgraphAdapterHttp.flattenArrays(res.data);
    } catch (e) {
      logger.error(
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
