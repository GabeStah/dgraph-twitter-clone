import logger from '../logger';
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
export class Query implements QueryInterface {
  private _objectType: string;
  get objectType(): string {
    // Set initial value if not specified.
    if (!this._objectType) this.objectType = this.getObjectTypeFromRoute();
    return this._objectType;
  }

  set objectType(value: string) {
    this._objectType = value;
  }

  private _params: object = {};
  get params(): object {
    return this._params;
  }

  set params(value: object) {
    this._params = value;
  }

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
  ) {
    this.paramTypes = paramTypes;
    this.parseTree(tree);
    this.query = query;
    this.route = route;
  }

  /**
   * Parses the route string and obtains assumed retrieved object type.
   * e.g. '/tweets/:uid' returns 'tweets'
   */
  private getObjectTypeFromRoute(): string {
    const value = this.route.split('/')[1];
    return value ? value : 'Unknown';
  }

  /**
   * Splits the passed period-delimited tree string into array.
   * @param tree
   */
  private parseTree(tree?: string) {
    if (!tree) return;
    this.tree = tree.split('.');
  }

  /**
   * Generates the proper URI from route and passed params.
   * @param params
   */
  uri(params?: object): string | undefined {
    let newUri = this.route;
    if (params) {
      // replace $ in params with :
      Object.entries(params).forEach(([key, value]) => {
        newUri = newUri.replace(key.replace('$', ':'), value);
      });
    }
    return newUri;
  }

  /**
   * Validates passed params with specified paramTypes, if applicable.
   * @param params
   */
  validateParams(params: object | undefined) {
    this.params = params ? params : this.params;
    const paramTypes = this.paramTypes;
    if (!this.params) {
      if (paramTypes) {
        logger.error(`No params found for query: ${this.query}`);
        return false;
      }
    } else {
      if (paramTypes) {
        paramTypes.forEach(paramType => {
          // Check that params contain this paramType key.
          if (this.params.hasOwnProperty(paramType.key)) {
            // Skip undefined or null
            if (this.params[paramType.key]) {
              // Checks that constructor type of parameter matches paramType.
              if (
                this.params[paramType.key].constructor.name !==
                paramType.type.constructor.name
              ) {
                console.log(this.params);
                console.log(paramTypes);
                logger.error(
                  `Param for key of (${
                    paramType.key
                  }) must match constructor paramType of (${
                    paramType.type.constructor.name
                  }).`
                );
                return false;
              }
            }
          } else {
            logger.error(
              `Params must contain paramType key of (${paramType.key}).`
            );
            return false;
          }
        });
      }
    }
    return true;
  }
}
