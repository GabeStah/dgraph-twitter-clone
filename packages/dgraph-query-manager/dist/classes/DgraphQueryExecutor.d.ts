import { Serialization } from '../classes';
import { Query } from './Query';
export interface DgraphQueryExecutorInterface {
  isMutation: boolean;
  params?: object;
  query: Query;
  request?: Serialization;
}
export declare enum DgraphQueryExecutorModes {
  Query = 0,
  QueryWithVars = 1,
  Json = 2,
  DeleteJson = 3
}
export declare class DgraphQueryExecutor
  implements DgraphQueryExecutorInterface {
  isMutation: boolean;
  params?: object;
  query: Query;
  request?: Serialization;
  constructor(
    query: Query,
    params?: object,
    isMutation?: boolean,
    request?: Serialization
  );
  /**
   * Execute Dgraph query based on instance properties and configuration.
   */
  execute(): Promise<Serialization>;
  /**
   * Makes an API query request.
   * @param request
   */
  executeApiRequest(): Promise<Serialization>;
  /**
   * Makes a direct request.
   * @param request
   */
  executeDirectRequest(request?: Serialization): Promise<Serialization>;
}
