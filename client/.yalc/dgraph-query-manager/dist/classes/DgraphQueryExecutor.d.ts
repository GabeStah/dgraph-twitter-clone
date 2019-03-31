import { Serialization } from '../classes';
import { Query } from './Query';
export declare enum DgraphConnectionType {
  API = 0,
  REST_API = 1,
  DIRECT = 2
}
export interface DgraphQueryExecutorInterface {
  isMutation: boolean;
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
  query: Query;
  request?: Serialization;
  constructor(
    query: Query,
    params?: object,
    isMutation?: boolean,
    request?: Serialization
  );
  /**
   * Builds a DgraphQueryExecutor instance from partial params.
   * @param params
   */
  static factory(
    params: Partial<DgraphQueryExecutor> | any
  ): DgraphQueryExecutor;
  /**
   * Execute Dgraph query based on instance properties and configuration.
   */
  execute(connectionType?: DgraphConnectionType): Promise<Serialization>;
  /**
   * Makes a REST API query request via explicit `/api/route/endpoints`.
   */
  executeRestApiRequest(): Promise<Serialization>;
  /**
   * Makes an API query request via JSON payload.
   * @param request
   */
  executeJsonApiRequest(): Promise<Serialization>;
  /**
   * Makes a direct request via GraphQL+.
   * @param request
   */
  executeDirectRequest(request?: Serialization): Promise<Serialization>;
}
