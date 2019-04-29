import { Serialization } from '../classes';
import { Hashtag, Tweet, Uid, UidParamsType, User } from '../models';
/**
 * All - Deletes the node and all child nodes.
 * Node - Deletes node.
 * Edge - Deletes specified edge(s).
 * AllChildEdges - Removes all child edges from node.
 * AllChildNodes - Deletes all child nodes and edge references from node.
 * Raw - Bypasses Model-based logic and passes direct JSON object.
 */
export declare enum BaseModelDeletionMode {
  All = 0,
  Node = 1,
  Edge = 2,
  AllChildEdges = 3,
  AllChildNodes = 4,
  Raw = 5
}
export declare type BaseModelNodeableType = Hashtag | Tweet | User;
export interface BaseModelInterface {
  uid?: Uid;
}
export declare class BaseModel<T> implements BaseModelInterface {
  uid?: Uid;
  /**
   * Constructs an instance of inheriting class using an (optional) partial parameters object.
   * @param {Partial<BaseModel<T>>} params
   * @param uid
   */
  constructor(params?: Partial<BaseModel<T>>, uid?: UidParamsType);
  /**
   * Factory that creates BaseModel instances from Partial<BaseModel<T>> paramTypes.
   * @param {Partial<BaseModel<T>>} params
   * @returns {Promise<BaseModel<T>>}
   */
  static create<T extends typeof BaseModel>(
    params: Partial<BaseModel<T>>
  ): Promise<Serialization>;
  /**
   * Factory that creates multiple BaseModel instances from BaseModel array.
   * @param {Partial<BaseModel<T>>[]} params
   * @returns {Promise<BaseModel<T>[]>}
   */
  static createMany<T extends typeof BaseModel>(
    params?: Partial<BaseModel<T>>[]
  ): Promise<BaseModel<T>[]>;
  /**
   * Delete nodes, edges, or children of passed object.
   * @param {Uid | BaseModel<T> | object | string} item
   * @param {BaseModelDeletionMode} mode
   * @param {string} edge
   * @returns {Promise<Serialization>}
   */
  static delete<T extends typeof BaseModel>(
    this: T,
    item: Uid | BaseModel<T> | object | string,
    mode?: BaseModelDeletionMode,
    edge?: string
  ): Promise<Serialization>;
  /**
   * Deserialize Dgraph object.
   * @param {Partial<any | T>} params
   * @returns {Promise<Partial<T>>}
   */
  static deserialize<T>(params?: Partial<T | any>): Partial<T>;
  /**
   * Find a node in database based on passed Uid or BaseModel<T> instance type.
   * @param {BaseModel<T> | Uid | string | number} params
   * @returns {Promise<Serialization>}
   */
  static find<T extends typeof BaseModel>(
    this: T,
    params: BaseModel<T> | Uid | string | number
  ): Promise<Serialization>;
  /**
   * Find this node in database.
   * @returns {Promise<Serialization>}
   */
  find<T>(): Promise<Serialization>;
  /**
   * Converts passed JSON string or object to new inheriting class instance.
   * @param {object | string} json
   * @returns {InstanceType<T>}
   */
  static fromJSON<T extends typeof BaseModel>(
    this: T,
    json: object | string
  ): InstanceType<T>;
  /**
   * Converts passed object to new inheriting calss instance.
   * @param {object} obj
   * @returns {InstanceType<T>}
   */
  fromObject<T extends typeof BaseModel>(this: T, obj: object): InstanceType<T>;
  /**
   * Generates a deletion request object based on passed object and paramTypes.
   * @param {BaseModel<T> | any} params
   * @param {BaseModelDeletionMode} mode
   * @param {string} edge
   * @returns {object | undefined}
   */
  static getDeletionRequest<T extends typeof BaseModel>(
    params: BaseModel<T> | any,
    mode?: BaseModelDeletionMode,
    edge?: string
  ): object | undefined;
  /**
   * Generates temporary instance of T and returns object containing combined default properties with passes paramTypes.
   * @param {Partial<T>} params
   * @returns {InstanceType<T>}
   */
  static injectDefaults<T extends typeof BaseModel>(
    this: T,
    params?: Partial<T>
  ): InstanceType<T>;
  /**
   * Directly insert object into database.
   * @param {Partial<T>} params
   * @param {Partial<T> | object} params2
   * @returns {Promise<Serialization>}
   */
  static insert<T>(
    params?: Partial<T>,
    params2?: Partial<T> | object
  ): Promise<Serialization>;
  /**
   * Indicates if instance is a deletable type.
   * @returns {boolean}
   */
  isDeletableType(): boolean;
  /**
   * Indicates if passed in value is a deletable type.
   * @param obj
   * @returns {boolean}
   */
  static isDeletableType(obj: any): boolean;
  /**
   * Indicates if instance is a nodeable type (i.e. can have a Uid in database).
   * @returns {boolean}
   */
  isNodeableType(): boolean;
  /**
   * Indicates if passed in value is a nodeable type (i.e. can have a Uid in database).
   * @param obj
   * @returns {boolean}
   */
  static isNodeableType(obj: any): boolean;
  /**
   * Determines if passed payload object is valid.
   * @param {object} response
   * @returns {boolean}
   */
  static isResponseValid<T extends typeof BaseModel>(
    this: T,
    response: object
  ): boolean;
  /**
   * Invokes async BaseModel<T> creation process.
   * @param {Partial<BaseModel<T>>} params
   * @returns {Promise<Partial<BaseModel<T>>>}
   */
  static load<T>(
    params?: Partial<BaseModel<T>>
  ): Promise<Partial<BaseModel<T>>>;
  /**
   * Serialize object into Dgraph acceptable format for JSON transaction.
   * @param {Partial<any | T>} params
   * @returns {Promise<Partial<T>>}
   */
  static serialize<T>(params?: Partial<T | any>): Promise<Partial<T>>;
  /**
   * Converts class instance to JavaScript object.
   * @returns {T}
   */
  toObject<T>(this: T): T;
  /**
   * Create database node of instance if matching Uid doesn't exist.
   * If Uid exists, update node instead.
   * @param {Partial<T>} params
   * @param {Partial<T> | object} params2
   * @returns {Promise<Serialization>}
   */
  static upsert<T>(
    params?: Partial<T>,
    params2?: Partial<T> | object
  ): Promise<Serialization>;
}
