import { Serialization } from '../classes';
import { Query } from './Query';
export interface DgraphQueryExecutorInterface {
    isMutation: boolean;
    query: Query;
    params?: object;
}
export declare enum DgraphQueryExecutorModes {
    Query = 0,
    QueryWithVars = 1,
    Json = 2,
    DeleteJson = 3
}
export declare class DgraphQueryExecutor implements DgraphQueryExecutorInterface {
    isMutation: boolean;
    query: Query;
    params?: object;
    constructor(query: Query, params?: object);
    execute(): Promise<Serialization>;
}
