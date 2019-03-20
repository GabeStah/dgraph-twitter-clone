import { DgraphClient, DgraphClientStub, Operation, Mutation } from 'dgraph-js';
import { ChannelCredentials, credentials as GrpcCredentials } from 'grpc';
import { Serialization } from 'serialization';

import config from './config';
import logger from './logger';

export enum MutationTypes {
  DeleteJson,
  SetJson
}

export class DgraphAdapter {
  /**
   * Endpoint address of Dgraph Zero app.
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

  /**
   * Credentials to connect to Dgraph Zero app.
   */
  credentials: ChannelCredentials;

  constructor(
    address?: string,
    credentials: ChannelCredentials = GrpcCredentials.createInsecure()
  ) {
    if (address) this.address = address;
    this.credentials = credentials;
    this.clientStub = new DgraphClientStub(this.address, this.credentials);
    this.client = new DgraphClient(this.clientStub);
  }

  /**
   * Alter the database schema.
   * @param {string} schema
   * @returns {Promise<boolean>}
   */
  async alterSchema(schema: string): Promise<boolean> {
    const operation = new Operation();
    operation.setSchema(schema);
    return this.client
      .alter(operation)
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
    const operation = new Operation();
    operation.setDropAll(true);
    const result = await this.client
      .alter(operation)
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
        if (Array.isArray(value) && value.length === 1) {
          // Set keyvalue to first (and only) array value.
          copy[key] = DgraphAdapter.flattenArrays(value[0]);
        }
      });
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (Array.isArray(obj[key]) && obj[key].length === 1) {
            // Set keyvalue to first (and only) array value.
            copy[key] = DgraphAdapter.flattenArrays(obj[key][0]);
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
            copy[key] = DgraphAdapter.flattenArraysInObject(value[0]);
          } else {
            // Retain original array
            copy[key] = DgraphAdapter.flattenArraysInObject(value);
          }
        } else {
          copy[key] = DgraphAdapter.flattenArraysInObject(value);
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
        `dgraph-adapater.mutate error, payload undefined for data: ${
          serialization.data
        }`
      );
    }
    const transaction = this.client.newTxn();
    const uids: string[] = [];
    logger.debug('----------');
    logger.debug('dgraph-adapter.mutate, payload: %o', serialization);
    logger.debug('----------');
    try {
      const mutation = new Mutation();
      mutation.setCommitNow(commitNow);
      // Deprecated
      // See: https://docs.dgraph.io/query-language/#upsert-directive
      // mutation.setIgnoreIndexConflict(ignoreIndexConflict);
      switch (mutationType) {
        case MutationTypes.SetJson:
          mutation.setSetJson(serialization.request);
          break;
        case MutationTypes.DeleteJson:
          mutation.setDeleteJson(serialization.request);
          break;
      }
      const assigned = await transaction.mutate(mutation);
      if (!commitNow) await transaction.commit();
      assigned.getUidsMap().forEach((uid, key) => uids.push(uid));
    } catch (e) {
      logger.error(
        'DgraphAdapter.mutate, payload: %o, mutationType: %o, error: %o',
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
      // serialization.response = res.getJson();
      serialization.response = DgraphAdapter.flattenArrays(res.getJson());
    } catch (e) {
      logger.error('DgraphAdapter.query, error: %o', e);
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
      // serialization.response = res.getJson();
      serialization.response = DgraphAdapter.flattenArrays(res.getJson());
      logger.info(
        `DgraphAdapter.queryWithVars, query: %o, vars: %o`,
        serialization,
        vars
      );
    } catch (e) {
      logger.error(
        'DgraphAdapter.queryWithVars, query: %s, paramTypes: %o, error: %o',
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
