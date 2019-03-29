import {
  DgraphAdapterHttp,
  DgraphAdapterHttp as DgraphAdapter
} from '../adapters';
import { Serialization } from '../classes';
import { Query } from './Query';
import logger from '../logger';
import axios from 'axios';
import config from '../config';

export enum DgraphConnectionType {
  API,
  DIRECT
}

export interface DgraphQueryExecutorInterface {
  isMutation: boolean;
  query: Query;
  request?: Serialization;
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
  request?: Serialization;

  constructor(
    query: Query,
    params?: object,
    isMutation = false,
    request?: Serialization
  ) {
    this.isMutation = isMutation;
    this.query = query;
    this.request = request;
    if (params) this.query.params = params;
    if (query.validateParams()) {
      query.injectCustomParams();
    }
  }

  /**
   * Execute Dgraph query based on instance properties and configuration.
   */
  async execute(
    connectionType: DgraphConnectionType = config.connectionType
  ): Promise<Serialization> {
    let serialization;
    if (connectionType === DgraphConnectionType.API) {
      serialization = await this.executeApiRequest();
    } else {
      // Default to direct.
      serialization = await this.executeDirectRequest(this.request);
    }

    // Assume singular array of 'data' if not included.
    const tree =
      this.query.tree && this.query.tree.length > 0
        ? this.query.tree
        : new Array(['data']);

    if (serialization.response) {
      let combinedResponse: any[] = [];
      for (const branch of tree) {
        let branchResponse = serialization.response;
        for (const stick of branch) {
          if (branchResponse[stick]) {
            branchResponse = branchResponse[stick];
          }
        }
        // Combines all previous arrays with new response array to generate full result set.
        combinedResponse = combinedResponse.concat(branchResponse);
      }
      serialization.message = `No ${this.query.objectType} found.`;

      // Flatten arrays
      serialization.response = DgraphAdapterHttp.flattenArrays(
        combinedResponse ? combinedResponse : serialization.response
      );
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

  /**
   * Makes an API query request.
   * @param request
   */
  async executeApiRequest(): Promise<Serialization> {
    const uri = this.query.uri(this.query.params);
    const response = new Serialization({
      message: `Failed to retrieve ${this.query.objectType} via API request.`,
      request: this.query.query,
      uri
    });

    // Get URL
    const url = `${config.dgraph.api.protocol}://${config.dgraph.api.host}:${
      config.dgraph.api.port
    }/api/${uri}`;

    // TODO: Change HTTP verb dynamically based on Query.
    await axios
      .get(url)
      .then(axiosResponse => {
        logger.info(
          `DgraphQueryExecutor.executeApiRequest response %o`,
          axiosResponse.data
        );
        response.response = axiosResponse.data.response;
        response.success = true;
        return response;
      })
      .catch(exception => {
        logger.error(exception);
        response.error = exception;
        return response;
      });

    return response;
  }

  /**
   * Makes a direct request.
   * @param request
   */
  async executeDirectRequest(request?: Serialization): Promise<Serialization> {
    const adapter = new DgraphAdapter();
    let response = new Serialization({
      message: `Failed to retrieve ${
        this.query.objectType
      } via direct request.`,
      request: this.query.query
    });

    // Allow request to be optionally passed.
    request = request ? request : response;

    if (this.isMutation) {
      response = await adapter.mutate(request);
    } else {
      if (this.query.paramTypes) {
        response = await adapter.queryWithVars(request, this.query.params);
      } else {
        response = await adapter.query(request);
      }
    }
    return response;
  }
}
