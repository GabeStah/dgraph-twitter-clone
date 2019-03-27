import {
  DgraphAdapterHttp,
  DgraphAdapterHttp as DgraphAdapter
} from '../adapters';
import { Serialization } from '../classes';
import { Query } from './Query';
import logger from '../logger';
import axios from 'axios';
import config from '../config';
import { DgraphConnectionType } from '../config/development';

export interface DgraphQueryExecutorInterface {
  isMutation: boolean;
  params?: object;
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
  params?: object;
  query: Query;
  request?: Serialization;

  constructor(
    query: Query,
    params?: object,
    isMutation = false,
    request?: Serialization
  ) {
    this.isMutation = isMutation;
    this.params = params;
    this.query = query;
    this.request = request;
    query.validateParams(params);
  }

  /**
   * Execute Dgraph query based on instance properties and configuration.
   */
  async execute(): Promise<Serialization> {
    let serialization;
    if (config.connectionType === DgraphConnectionType.API) {
      serialization = await this.executeApiRequest();
    } else {
      // Default to direct.
      serialization = await this.executeDirectRequest(this.request);
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
      // Flatten arrays
      serialization.response = DgraphAdapterHttp.flattenArrays(tempResponse);
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
    const response = new Serialization({
      message: `Failed to retrieve ${
        this.query.objectType
      } via direct request.`,
      request: this.query.query
    });

    // Get URL
    const url = `${config.dgraph.api.protocol}://${config.dgraph.api.host}:${
      config.dgraph.api.port
    }/api/${this.query.uri(this.params)}`;

    // TODO: Change HTTP verb dynamically based on Query.
    axios
      .get(url)
      .then(axiosResponse => {
        logger.info(
          `DgraphQueryExecutor.executeDirect response %o`,
          axiosResponse.data.response
        );
        response.response = axiosResponse.data.response;
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
      message: `Failed to retrieve ${this.query.objectType} via API request.`,
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
