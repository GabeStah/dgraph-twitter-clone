'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const adapters_1 = require('../adapters');
const classes_1 = require('../classes');
const logger_1 = require('../logger');
const axios_1 = require('axios');
const config_1 = require('../config');
var DgraphConnectionType;
(function(DgraphConnectionType) {
  DgraphConnectionType[(DgraphConnectionType['API'] = 0)] = 'API';
  DgraphConnectionType[(DgraphConnectionType['REST_API'] = 1)] = 'REST_API';
  DgraphConnectionType[(DgraphConnectionType['DIRECT'] = 2)] = 'DIRECT';
})(
  (DgraphConnectionType =
    exports.DgraphConnectionType || (exports.DgraphConnectionType = {}))
);
var DgraphQueryExecutorModes;
(function(DgraphQueryExecutorModes) {
  DgraphQueryExecutorModes[(DgraphQueryExecutorModes['Query'] = 0)] = 'Query';
  DgraphQueryExecutorModes[(DgraphQueryExecutorModes['QueryWithVars'] = 1)] =
    'QueryWithVars';
  DgraphQueryExecutorModes[(DgraphQueryExecutorModes['Json'] = 2)] = 'Json';
  DgraphQueryExecutorModes[(DgraphQueryExecutorModes['DeleteJson'] = 3)] =
    'DeleteJson';
})(
  (DgraphQueryExecutorModes =
    exports.DgraphQueryExecutorModes || (exports.DgraphQueryExecutorModes = {}))
);
class DgraphQueryExecutor {
  constructor(query, params, isMutation = false, request) {
    this.isMutation = false;
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
  static factory(params) {
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
  async execute(connectionType = config_1.default.connectionType) {
    let serialization;
    if (connectionType === DgraphConnectionType.REST_API) {
      serialization = await this.executeRestApiRequest();
    } else if (connectionType === DgraphConnectionType.API) {
      serialization = await this.executeJsonApiRequest();
    } else {
      // Default to direct.
      serialization = await this.executeDirectRequest(this.request);
    }
    // Assume a singular array of 'data' if not included.
    const tree =
      this.query.tree && this.query.tree.length > 0
        ? this.query.tree
        : new Array(['data']);
    if (serialization.response) {
      let combinedResponse = [];
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
      serialization.response = adapters_1.DgraphAdapterHttp.flattenArrays(
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
  async executeRestApiRequest() {
    const uri = this.query.uri(this.query.params);
    const response = new classes_1.Serialization({
      message: `Failed to retrieve ${
        this.query.objectType
      } via REST API request.`,
      request: this.query.query,
      uri
    });
    // Get URL
    const url = `${config_1.default.dgraph.api.protocol}://${
      config_1.default.dgraph.api.host
    }:${config_1.default.dgraph.api.port}/api/${uri}`;
    try {
      const axiosResponse = await axios_1.default.get(url);
      logger_1.default.info(
        `DgraphQueryExecutor.executeRestApiRequest response %o`,
        axiosResponse.data
      );
      response.response = axiosResponse.data.response;
      response.success = true;
    } catch (error) {
      logger_1.default.error(error);
      response.error = error;
    }
    return response;
  }
  /**
   * Makes an API query request via JSON payload.
   */
  async executeJsonApiRequest() {
    const response = new classes_1.Serialization({
      message: `Failed to retrieve ${
        this.query.objectType
      } via JSON API request.`,
      request: this.query.query
    });
    // Get URL
    const url = `${config_1.default.dgraph.api.protocol}://${
      config_1.default.dgraph.api.host
    }:${config_1.default.dgraph.api.port}/api/json`;
    try {
      const axiosResponse = await axios_1.default.post(url, this);
      logger_1.default.info(
        `DgraphQueryExecutor.executeJsonApiRequest response %o`,
        axiosResponse.data
      );
      response.response = axiosResponse.data.response;
      response.success = true;
    } catch (error) {
      logger_1.default.error(error);
      response.error = error;
    }
    return response;
  }
  /**
   * Makes a direct request via GraphQL+-.
   * @param request
   */
  async executeDirectRequest(request) {
    const adapter = new adapters_1.DgraphAdapterHttp();
    let response = new classes_1.Serialization({
      message: `Failed to retrieve ${
        this.query.objectType
      } via direct GraphQL+- request.`,
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
exports.DgraphQueryExecutor = DgraphQueryExecutor;

//# sourceMappingURL=DgraphQueryExecutor.js.map
