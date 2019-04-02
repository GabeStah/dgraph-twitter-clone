import { DgraphAdapterHttp as DgraphAdapter } from '../adapters';
import { Serialization } from '../classes';
import { Query } from './Query';
import logger from '../logger';
import axios from 'axios';
import config from '../config';

export enum DgraphConnectionType {
  API,
  REST_API,
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
   * Builds a DgraphQueryExecutor instance from partial params.
   * @param params
   */
  static factory(params: Partial<DgraphQueryExecutor> | any) {
    return new DgraphQueryExecutor(
      params.query,
      params.query.params,
      params.isMutation,
      params.request
    );
  }

  /**
   * Execute Dgraph query based on instance properties and configuration.
   */
  async execute(
    connectionType: DgraphConnectionType = config.connectionType
  ): Promise<Serialization> {
    let serialization;
    if (connectionType === DgraphConnectionType.REST_API) {
      serialization = await this.executeRestApiRequest();
    } else if (connectionType === DgraphConnectionType.API) {
      serialization = await this.executeJsonApiRequest();
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
      serialization.response = DgraphAdapter.flattenArrays(
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
   * Makes a REST API query request via explicit `/api/route/endpoints`.
   */
  async executeRestApiRequest(): Promise<Serialization> {
    const uri = this.query.uri(this.query.params);
    const response = new Serialization({
      message: `Failed to retrieve ${
        this.query.objectType
      } via REST API request.`,
      request: this.query.query,
      uri
    });

    // Get URL
    const url = `${config.dgraph.api.protocol}://${config.dgraph.api.host}:${
      config.dgraph.api.port
    }/api/${uri}`;

    await axios
      .get(url)
      .then(axiosResponse => {
        logger.info(
          `DgraphQueryExecutor.executeRestApiRequest response %o`,
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
   * Makes an API query request via JSON payload.
   */
  async executeJsonApiRequest(): Promise<Serialization> {
    const response = new Serialization({
      message: `Failed to retrieve ${
        this.query.objectType
      } via JSON API request.`,
      request: this.query.query
    });

    // Get URL
    const url = `${config.dgraph.api.protocol}://${config.dgraph.api.host}:${
      config.dgraph.api.port
    }/api/json`;

    await axios
      .post(url, this)
      .then(axiosResponse => {
        logger.info(
          `DgraphQueryExecutor.executeJsonApiRequest response %o`,
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
   * Makes a direct request via GraphQL+.
   * @param request
   */
  async executeDirectRequest(request?: Serialization): Promise<Serialization> {
    const adapter = new DgraphAdapter();
    let response = new Serialization({
      message: `Failed to retrieve ${
        this.query.objectType
      } via direct GraphQL+ request.`,
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
