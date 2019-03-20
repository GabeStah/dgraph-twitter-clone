// tslint:disable:no-null-keyword
import logger from './logger';
import { DgraphAdapter, MutationTypes } from 'dgraph-adapter-http';
import { DgraphQueryExecutor, Queries } from 'dgraph-query-executor';
import { Hashtag } from './hashtag';
import { Serialization } from 'serialization';
import { Tweet } from './tweet';
import { Uid, UidParamsType } from './uid';
import { User } from './user';

/**
 * All - Deletes the node and all child nodes.
 * Node - Deletes node.
 * Edge - Deletes specified edge(s).
 * AllChildEdges - Removes all child edges from node.
 * AllChildNodes - Deletes all child nodes and edge references from node.
 */
export enum BaseModelDeletionMode {
  All,
  Node,
  Edge,
  AllChildEdges,
  AllChildNodes
}

export type BaseModelNodeableTypes = Hashtag | Tweet | User;

export interface BaseModelInterface {
  uid?: Uid;
}

export class BaseModel<T> implements BaseModelInterface {
  uid?: Uid;

  /**
   * Constructs an instance of inheriting class using an (optional) partial parameters object.
   * @param {Partial<BaseModel<T>>} params
   * @param uid
   */
  constructor(params: Partial<BaseModel<T>> = {}, uid?: UidParamsType) {
    Object.assign(this, params);
    if (this.uid) {
      this.uid = new Uid(this.uid);
    }
  }

  /**
   * Factory that creates BaseModel instances from Partial<BaseModel<T>> paramTypes.
   * @param {Partial<BaseModel<T>>} params
   * @returns {Promise<BaseModel<T>>}
   */
  static async create<T extends typeof BaseModel>(
    params: Partial<BaseModel<T>>
  ): Promise<Serialization> {
    const className = this.name;
    const serialization = new Serialization({
      message: `${className} successfully created.`,
      data: params,
      request: params
    });
    return new Promise((resolve, reject) => {
      this.load(params)
        .then(processed => {
          logger.info(
            `${className}.create.load.then fulfilled, processed: %o`,
            processed
          );
          serialization.response = new this(processed);
          serialization.success = true;
          resolve(serialization);
        })
        .catch(error => {
          logger.info(
            `${className}.create.load.then failed, error: %o', error`
          );
          serialization.error = error;
          serialization.message = `${className} creation failed.`;
          serialization.success = false;
          resolve(serialization);
        });
    });
  }

  /**
   * Factory that creates multiple BaseModel instances from BaseModel array.
   * @param {Partial<BaseModel<T>>[]} params
   * @returns {Promise<BaseModel<T>[]>}
   */
  static async createMany<T extends typeof BaseModel>(
    params: Partial<BaseModel<T>>[] = []
  ): Promise<BaseModel<T>[]> {
    const elements: any[] = [];
    for await (const param of params) {
      elements.push((await this.create(param)).response);
    }
    return elements;
  }

  /**
   * Delete nodes, edges, or children of passed object.
   * @param {Uid | BaseModel<T> | object | string} item
   * @param {BaseModelDeletionMode} mode
   * @param {string} edge
   * @returns {Promise<Serialization>}
   */
  static async delete<T extends typeof BaseModel>(
    this: T,
    item: Uid | BaseModel<T> | object | string,
    mode: BaseModelDeletionMode = BaseModelDeletionMode.All,
    edge?: string
  ): Promise<Serialization> {
    const adapter = new DgraphAdapter();
    const className = this.name;
    let serialization = new Serialization({
      message: `${className} successfully deleted.`,
      data: item
    });
    if (
      item instanceof BaseModel ||
      (typeof item === 'object' && !(item instanceof Uid))
    ) {
      serialization.request = this.getDeletionRequest(item, mode, edge);
    }
    return new Promise((resolve, reject) => {
      adapter
        .mutate(serialization, MutationTypes.DeleteJson)
        .then(result => {
          serialization = result;
          serialization.success = true;
          resolve(serialization);
        })
        .catch(error => {
          serialization.error = error;
          serialization.statusCode = 500;
          serialization.success = false;
          serialization.message = `${className} deletion failed.`;
          reject(serialization);
        });
    });
  }

  /**
   * Deserialize Dgraph object.
   * @param {Partial<any | T>} params
   * @returns {Promise<Partial<T>>}
   */
  static deserialize<T>(params: Partial<T | any> = {}): Partial<T> {
    // Update Uid
    if (params.uid) {
      if (Array.isArray(params.uid)) {
        // Assume first Uid is applicable
        params.uid = new Uid(params.uid[0]);
      } else {
        params.uid = new Uid(params.uid);
      }
    }
    return params;
  }

  /**
   * Find a node in database based on passed Uid or BaseModel<T> instance type.
   * @param {BaseModel<T> | Uid | string | number} params
   * @returns {Promise<Serialization>}
   */
  static async find<T extends typeof BaseModel>(
    this: T,
    params: BaseModel<T> | Uid | string | number
  ): Promise<Serialization> {
    // const adapter = new DgraphAdapter();
    const className = this.name;
    let uid = '';

    // Get uid string from Uid instance.
    if (params instanceof this && params.uid) {
      uid = params.uid.toString();
    } else if (params instanceof Uid) {
      uid = params.toString();
    }

    const executor = new DgraphQueryExecutor(Queries[className].find, {
      $id: uid
    });
    const serialization = await executor.execute();
    if (serialization && serialization.success && serialization.response) {
      // Create instance of T from deserialized result.
      serialization.response = new this(serialization.response) as InstanceType<
        T
      >;
    }
    return serialization;
  }

  /**
   * Find this node in database.
   * @returns {Promise<Serialization>}
   */
  async find<T>(): Promise<Serialization> {
    const adapter = new DgraphAdapter();
    const className = this.constructor.name;
    const serialization = new Serialization({
      message: `${className} found.`
    });

    return new Promise((resolve, reject) => {
      adapter
        .query(serialization)
        .then(payload => {
          serialization.data = payload;
          serialization.response = payload;
          serialization.success = true;
          resolve(serialization);
        })
        .catch(error => {
          serialization.data = this;
          serialization.statusCode = 500;
          serialization.success = false;
          serialization.message = `${className} find failed.`;
          reject(serialization);
        });
    });
  }

  /**
   * Converts passed JSON string or object to new inheriting class instance.
   * @param {object | string} json
   * @returns {InstanceType<T>}
   */
  static fromJSON<T extends typeof BaseModel>(
    this: T,
    json: object | string
  ): InstanceType<T> {
    switch (typeof json) {
      case 'object':
        return Object.assign(new this() as InstanceType<T>, json);
      case 'string':
        return Object.assign(new this() as InstanceType<T>, JSON.parse(json));
    }
  }

  /**
   * Converts passed object to new inheriting calss instance.
   * @param {object} obj
   * @returns {InstanceType<T>}
   */
  fromObject<T extends typeof BaseModel>(
    this: T,
    obj: object
  ): InstanceType<T> {
    return Object.assign(new this() as InstanceType<T>, obj);
  }

  /**
   * Generates a deletion request object based on passed object and paramTypes.
   * @param {BaseModel<T> | any} params
   * @param {BaseModelDeletionMode} mode
   * @param {string} edge
   * @returns {object | undefined}
   */
  static getDeletionRequest<T extends typeof BaseModel>(
    params: BaseModel<T> | any,
    mode: BaseModelDeletionMode = BaseModelDeletionMode.All,
    edge?: string
  ): object | undefined {
    let result: any = [];
    // Add primary Uid
    if (params.hasOwnProperty('uid') && params.uid) {
      result.push({
        uid: params.uid.toString()
      });
    }

    if (mode === BaseModelDeletionMode.All) {
      // Add parent node Uid to uids list.
      Object.entries(params).forEach(([key, value]) => {
        // Check if deletable
        if (value instanceof BaseModel && value.isDeletableType()) {
          // Add Uid to list to delete actual child node
          result.push(new Uid(value));
        } else if (
          Array.isArray(value) &&
          value.some(
            element => element instanceof BaseModel && element.isDeletableType()
          )
        ) {
          // Add array of node Uids to uids list
          result = result.concat(
            value
              .filter(parent => parent.isDeletableType())
              .map(child => new Uid(child))
          );
        }
      });
    } else if (mode === BaseModelDeletionMode.AllChildNodes) {
      Object.entries(params).forEach(([key, value]) => {
        // Check if deletable
        if (value instanceof BaseModel && value.isDeletableType()) {
          // Null key of child type to remove edge reference
          result[0][key] = null;
          // Add Uid to list to delete actual child node
          result.push(new Uid(value));
        } else if (
          Array.isArray(value) &&
          value.some(
            element => element instanceof BaseModel && element.isDeletableType()
          )
        ) {
          // Null key of child type to remove edge reference
          result[0][key] = null;
          // Add array of node Uids to uids list
          result = result.concat(
            value
              .filter(parent => parent.isDeletableType())
              .map(child => new Uid(child))
          );
        }
      });
    } else if (mode === BaseModelDeletionMode.AllChildEdges) {
      Object.entries(params).forEach(([key, value]) => {
        // Check if deletable
        if (value instanceof BaseModel && value.isDeletableType()) {
          // Null key of child type to remove edge reference
          result[0][key] = null;
        } else if (
          Array.isArray(value) &&
          value.some(
            element => element instanceof BaseModel && element.isDeletableType()
          )
        ) {
          result[0][key] = null;
        }
      });
    } else if (mode === BaseModelDeletionMode.Edge) {
      let count = 0;
      if (edge) {
        Object.entries(params).forEach(([key, value]) => {
          if (key === edge) {
            // Check if deletable
            if (value instanceof BaseModel && value.isDeletableType()) {
              // Null key of child type to remove edge reference
              result[0][key] = null;
              count++;
            } else if (
              Array.isArray(value) &&
              value.some(
                element =>
                  element instanceof BaseModel && element.isDeletableType()
              )
            ) {
              result[0][key] = null;
              count++;
            }
          }
        });
      }
      // No matching edges found.
      if (count === 0) {
        throw new Error(
          `Cannot delete edge (${edge}) of object: ${JSON.stringify(params)}`
        );
      }
    }

    // GRPC won't accept a single-element Array, so return first element object if singular.
    return result.length === 1 ? result[0] : result;
  }

  /**
   * Generates temporary instance of T and returns object containing combined default properties with passes paramTypes.
   * @param {Partial<T>} params
   * @returns {InstanceType<T>}
   */
  static injectDefaults<T extends typeof BaseModel>(
    this: T,
    params: Partial<T> = {}
  ): InstanceType<T> {
    const temp = new this() as InstanceType<T>;
    return { ...temp, ...params };
  }

  /**
   * Directly insert object into database.
   * @param {Partial<T>} params
   * @param {Partial<T> | object} params2
   * @returns {Promise<Serialization>}
   */
  static async insert<T>(
    params: Partial<T> = {},
    params2?: Partial<T> | object
  ): Promise<Serialization> {
    Object.assign(params, params2);
    const adapter = new DgraphAdapter();
    const className = this.name;
    const serialization = new Serialization({
      message: `${className} created.`,
      request: params,
      data: params
    });

    return new Promise((resolve, reject) => {
      adapter
        .mutate(serialization)
        .then(serialization => {
          // serialization.response = payload;
          serialization.success = true;
          resolve(serialization);
        })
        .catch(error => {
          // serialization.data = paramTypes;
          serialization.statusCode = 500;
          serialization.success = false;
          serialization.error = error;
          serialization.message = `${className} creation failed.`;
          reject(serialization);
        });
    });
  }

  /**
   * Indicates if instance is a deletable type.
   * @returns {boolean}
   */
  isDeletableType(): boolean {
    const className = this.constructor.name;
    return className === 'Hashtag' || className === 'Tweet';
  }

  /**
   * Indicates if passed in value is a deletable type.
   * @param obj
   * @returns {boolean}
   */
  static isDeletableType(obj: any): boolean {
    const className = obj.constructor.name;
    return className === 'Hashtag' || className === 'Tweet';
  }

  /**
   * Indicates if instance is a nodeable type (i.e. can have a Uid in database).
   * @returns {boolean}
   */
  isNodeableType(): boolean {
    const className = this.constructor.name;
    return (
      className === 'Hashtag' || className === 'Tweet' || className === 'User'
    );
  }

  /**
   * Indicates if passed in value is a nodeable type (i.e. can have a Uid in database).
   * @param obj
   * @returns {boolean}
   */
  static isNodeableType(obj: any): boolean {
    const className = obj.constructor.name;
    return (
      className === 'Hashtag' || className === 'Tweet' || className === 'User'
    );
  }

  /**
   * Determines if passed payload object is valid.
   * @param {object} response
   * @returns {boolean}
   */
  static isResponseValid<T extends typeof BaseModel>(
    this: T,
    response: object
  ): boolean {
    const className = this.name;
    return !!(typeof response === 'object' && response[className]);
  }

  /**
   * Invokes async BaseModel<T> creation process.
   * @param {Partial<BaseModel<T>>} params
   * @returns {Promise<Partial<BaseModel<T>>>}
   */
  static async load<T>(
    params: Partial<BaseModel<T>> = {}
  ): Promise<Partial<BaseModel<T>>> {
    // Combine paramTypes with default properties.
    params = this.injectDefaults(params);
    return params;
  }

  /**
   * Serialize object into Dgraph acceptable format for JSON transaction.
   * @param {Partial<any | T>} params
   * @returns {Promise<Partial<T>>}
   */
  static async serialize<T>(
    params: Partial<T | any> = {}
  ): Promise<Partial<T>> {
    const serialization: any = {};
    // Update Uid
    if (params.uid) {
      if (Array.isArray(params.uid)) {
        // Assume first Uid is applicable
        params.uid = new Uid(params.uid[0]);
      } else {
        params.uid = new Uid(params.uid);
      }
    }
    for await (const key of Object.keys(params)) {
      // Check if Uid
      if (params[key] instanceof Uid && key === 'uid') {
        // Convert Uid to string values
        serialization[key] = params[key].toString();
      } else if (params[key] instanceof BaseModel) {
        // For BaseModel instances recursively serialize
        serialization[key] = await this.serialize(params[key]);
      } else if (
        Array.isArray(params[key]) &&
        params[key].filter(instance => instance instanceof BaseModel).length > 0
      ) {
        const instances: any[] = [];
        for await (const instance of params[key]) {
          instances.push(await this.serialize(instance));
        }
        serialization[key] = instances;
      } else {
        serialization[key] = params[key];
      }
    }
    return serialization;
  }

  /**
   * Converts class instance to JSON string.
   * REMOVED: Removed due to incompatibility with GRPC (GRPC unintentionally calls this method).
   * @returns {string}
   */
  // toJSON<T>(this: T): string {
  //     const temp = JSON.stringify(Object.assign({}, this));
  //     return temp;
  // }

  /**
   * Converts class instance to JavaScript object.
   * @returns {T}
   */
  toObject<T>(this: T): T {
    return Object.assign({}, this);
  }

  /**
   * TODO: Convert instance to query.
   * @returns {string}
   */
  toQuery(): string {
    return '';
  }

  /**
   * Create database node of instance if matching Uid doesn't exist.
   * If Uid exists, update node instead.
   * @param {Partial<T>} params
   * @param {Partial<T> | object} params2
   * @returns {Promise<Serialization>}
   */
  static async upsert<T>(
    params: Partial<T> = {},
    params2?: Partial<T> | object
  ): Promise<Serialization> {
    Object.assign(params, params2);
    const className = this.name;
    const serialization = new Serialization({
      message: `${className} upserted.`,
      data: params,
      request: params
    });

    return new Promise((resolve, reject) => {
      this.load(params)
        .then(payload => {
          serialization.response = new this(payload);
          serialization.success = true;
          resolve(serialization);
        })
        .catch(error => {
          // serialization.data = this;
          serialization.error = error;
          serialization.statusCode = 500;
          serialization.success = false;
          serialization.message = `${className} upsert failed.`;
          reject(serialization);
        });
    });
  }
}
