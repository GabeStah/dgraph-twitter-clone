"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adapters_1 = require("../adapters");
const classes_1 = require("../classes");
const logger_1 = require("../logger");
const axios_1 = require("axios");
const config_1 = require("../config");
const development_1 = require("../config/development");
var DgraphQueryExecutorModes;
(function (DgraphQueryExecutorModes) {
    DgraphQueryExecutorModes[DgraphQueryExecutorModes["Query"] = 0] = "Query";
    DgraphQueryExecutorModes[DgraphQueryExecutorModes["QueryWithVars"] = 1] = "QueryWithVars";
    DgraphQueryExecutorModes[DgraphQueryExecutorModes["Json"] = 2] = "Json";
    DgraphQueryExecutorModes[DgraphQueryExecutorModes["DeleteJson"] = 3] = "DeleteJson";
})(DgraphQueryExecutorModes = exports.DgraphQueryExecutorModes || (exports.DgraphQueryExecutorModes = {}));
class DgraphQueryExecutor {
    constructor(query, params, isMutation = false, request) {
        this.isMutation = false;
        this.isMutation = isMutation;
        this.params = params;
        this.query = query;
        this.request = request;
        query.validateParams(params);
    }
    /**
     * Execute Dgraph query based on instance properties and configuration.
     */
    async execute() {
        let serialization;
        if (config_1.default.connectionType === development_1.DgraphConnectionType.API) {
            serialization = await this.executeApiRequest();
        }
        else {
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
            serialization.response = tempResponse;
            if (!Array.isArray(serialization.response) ||
                (Array.isArray(serialization.response) &&
                    serialization.response.length > 0)) {
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
    async executeApiRequest() {
        let response = new classes_1.Serialization({
            message: `Failed to retrieve ${this.query.objectType} via direct request.`,
            request: this.query.query
        });
        // Get URL
        const url = `${config_1.default.dgraph.api.protocol}://${config_1.default.dgraph.api.host}:${config_1.default.dgraph.api.port}/api/${this.query.uri(this.params)}`;
        // TODO: Change HTTP verb dynamically based on Query.
        axios_1.default
            .get(url)
            .then(axiosResponse => {
            logger_1.default.info(`DgraphQueryExecutor.executeDirect response %o`, axiosResponse.data.response);
            response.response = axiosResponse.data.response;
            return response;
        })
            .catch(exception => {
            logger_1.default.error(exception);
            response.error = exception;
            return response;
        });
        return response;
    }
    /**
     * Makes a direct request.
     * @param request
     */
    async executeDirectRequest(request) {
        const adapter = new adapters_1.DgraphAdapterHttp();
        let response = new classes_1.Serialization({
            message: `Failed to retrieve ${this.query.objectType} via API request.`,
            request: this.query.query
        });
        // Allow request to be optionally passed.
        request = request ? request : response;
        if (this.isMutation) {
            response = await adapter.mutate(request);
        }
        else {
            if (this.query.paramTypes) {
                response = await adapter.queryWithVars(request, this.query.params);
            }
            else {
                response = await adapter.query(request);
            }
        }
        return response;
    }
}
exports.DgraphQueryExecutor = DgraphQueryExecutor;

//# sourceMappingURL=DgraphQueryExecutor.js.map
