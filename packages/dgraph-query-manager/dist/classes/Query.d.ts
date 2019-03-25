import { ParamType } from './ParamType';
export interface QueryInterface {
  objectType: string;
  params: object;
  paramTypes?: ParamType<any>[];
  query: string;
  route: string;
  tree?: string[];
}
/**
 * Helper class for creating queries to be executed by Dgraph via dgraph-adapter.
 */
export declare class Query implements QueryInterface {
  private _objectType;
  objectType: string;
  private _params;
  params: object;
  paramTypes?: ParamType<any>[];
  query: string;
  route: string;
  tree?: string[];
  /**
   * @param query - Query string.
   * @param route - API route.
   * @param paramTypes? - Collection of valid parameter types.
   * @param tree? - Results tree definition.
   */
  constructor(
    query: string,
    route: string,
    paramTypes?: ParamType<any>[],
    tree?: string
  );
  /**
   * Parses the route string and obtains assumed retrieved object type.
   * e.g. '/tweets/:uid' returns 'tweets'
   */
  private getObjectTypeFromRoute;
  /**
   * Splits the passed period-delimited tree string into array.
   * @param tree
   */
  private parseTree;
  /**
   * Generates the proper URI from route and passed params.
   * @param params
   */
  uri(params?: object): string | undefined;
  /**
   * Validates passed params with specified paramTypes, if applicable.
   * @param params
   */
  validateParams(params: object | undefined): boolean;
}
