import { ParamType } from './ParamType';
export declare enum HttpMethods {
  DELETE = 0,
  GET = 1,
  POST = 2,
  PUT = 3
}
export interface QueryInterface {
  httpMethod: HttpMethods;
  objectType: string;
  params: object;
  paramTypes?: ParamType<any>[];
  query: string;
  route: string;
  tree: string[][];
}
/**
 * Helper class for creating queries to be executed by Dgraph via dgraph-adapter.
 */
export declare class Query implements QueryInterface {
  private _objectType;
  objectType: string;
  params: object;
  httpMethod: HttpMethods;
  paramTypes?: ParamType<any>[];
  query: string;
  route: string;
  tree: string[][];
  /**
   * @param query - Query string.
   * @param route - REST_API route.
   * @param paramTypes? - Collection of valid parameter types.
   * @param tree? - Results tree definition.
   * @param httpMethod
   * @param params
   */
  constructor(
    query: string,
    route: string,
    paramTypes?: ParamType<any>[],
    tree?: string | string[],
    httpMethod?: HttpMethods,
    params?: object
  );
  /**
   * Builds a Query instance from partial params.
   * @param params
   */
  static factory(params: Partial<Query> | any): Query;
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
   * Injects custom params into query strings.  Useful for 'building' queries at runtime.
   * @param params
   */
  injectCustomParams(): void;
  /**
   * Validates passed params with specified paramTypes, if applicable.
   * @param params
   */
  validateParams(): boolean;
}
