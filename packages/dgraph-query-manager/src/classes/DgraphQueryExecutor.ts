import { DgraphAdapterHttp as DgraphAdapter } from '../adapters';
import { Serialization } from '../classes';
import { Query } from './Query';

export interface DgraphQueryExecutorInterface {
  isMutation: boolean;
  query: Query;
  params?: object;
}

export enum DgraphQueryExecutorModes {
  Query,
  QueryWithVars,
  Json,
  DeleteJson
}

export class DgraphQueryExecutor implements DgraphQueryExecutorInterface {
  isMutation = false;
  query: Query;
  params?: object;

  constructor(query: Query, params?: object) {
    this.query = query;
    this.params = params;
    query.validateParams(params);
  }

  async execute(): Promise<Serialization> {
    const adapter = new DgraphAdapter();
    let serialization = new Serialization({
      message: `Failed to retrieve ${this.query.objectType}.`,
      request: this.query.query
    });

    if (this.isMutation) {
      serialization = await adapter.mutate(serialization);
    } else {
      if (this.query.paramTypes) {
        serialization = await adapter.queryWithVars(
          serialization,
          this.query.params
        );
      } else {
        serialization = await adapter.query(serialization);
      }
    }

    // Assume singular array of 'data' if not included.
    const tree = this.query.tree ? this.query.tree : ['data'];

    if (serialization.response) {
      let tempResponse = serialization.response;
      for (const branch of tree) {
        if (tempResponse[branch]) {
          tempResponse = tempResponse[branch];
        }
      }
      serialization.message = `No ${this.query.objectType} found.`;
      serialization.response = tempResponse;
      if (
        !Array.isArray(serialization.response) ||
        (Array.isArray(serialization.response) &&
          serialization.response.length > 0)
      ) {
        serialization.message = `${this.query.objectType} found.`;
        serialization.success = true;
      }
    }

    return serialization;
  }
}
