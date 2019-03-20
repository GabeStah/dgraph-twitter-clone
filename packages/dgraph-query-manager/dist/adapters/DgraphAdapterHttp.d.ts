import { DgraphClient, DgraphClientStub } from 'dgraph-js-http';
import { MutationTypes } from './MutationTypes';
import { Serialization } from '../classes';
export declare class DgraphAdapterHttp {
    /**
     * Endpoint address of Dgraph server.
     */
    address: any;
    /**
     * Dgraph client.
     */
    protected client: NonNullable<DgraphClient>;
    /**
     * Dgraph client stub.
     */
    protected clientStub: NonNullable<DgraphClientStub>;
    constructor(address?: string);
    /**
     * Alter the database schema.
     * @param {string} schema
     * @returns {Promise<boolean>}
     */
    alterSchema(schema: string): Promise<boolean>;
    /**
     * Drop all database data.
     * @returns {Promise<boolean>}
     */
    dropAll(): Promise<boolean>;
    /**
     * Recursively flattens arrays within passed object.
     * Sets object key value pointing to a single-element array to value of that only element.
     * @param {object} obj
     * @returns {any}
     */
    static flattenArrays(obj: any): any;
    static flattenArraysInObject(obj: any): any;
    /**
     * Execute a database mutation using passed payload object or BaseModel<T> instance.
     * @param {any | BaseModel<T>} serialization
     * @param {MutationTypes} mutationType
     * @param {boolean} commitNow
     * @param {boolean} ignoreIndexConflict
     * @returns {Promise<Partial<T>>}
     */
    mutate<T>(serialization: Serialization, mutationType?: MutationTypes, commitNow?: boolean): Promise<Serialization>;
    /**
     * Execute a database query.
     * @param {string} serialization
     * @returns {Promise<string>}
     */
    query<T>(serialization: Serialization): Promise<Serialization>;
    /**
     * Execute a database query with paramTypes.
     * @param {string} serialization
     * @param vars
     * @returns {Promise<any>}
     */
    queryWithVars(serialization: Serialization, vars?: any): Promise<Serialization>;
}
