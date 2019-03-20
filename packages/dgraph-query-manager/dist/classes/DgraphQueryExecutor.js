"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adapters_1 = require("../adapters");
const classes_1 = require("../classes");
var DgraphQueryExecutorModes;
(function (DgraphQueryExecutorModes) {
    DgraphQueryExecutorModes[DgraphQueryExecutorModes["Query"] = 0] = "Query";
    DgraphQueryExecutorModes[DgraphQueryExecutorModes["QueryWithVars"] = 1] = "QueryWithVars";
    DgraphQueryExecutorModes[DgraphQueryExecutorModes["Json"] = 2] = "Json";
    DgraphQueryExecutorModes[DgraphQueryExecutorModes["DeleteJson"] = 3] = "DeleteJson";
})(DgraphQueryExecutorModes = exports.DgraphQueryExecutorModes || (exports.DgraphQueryExecutorModes = {}));
class DgraphQueryExecutor {
    constructor(query, params) {
        this.isMutation = false;
        this.query = query;
        this.params = params;
        query.validateParams(params);
    }
    async execute() {
        const adapter = new adapters_1.DgraphAdapterHttp();
        let serialization = new classes_1.Serialization({
            message: `Failed to retrieve ${this.query.objectType}.`,
            request: this.query.query
        });
        if (this.isMutation) {
            serialization = await adapter.mutate(serialization);
        }
        else {
            if (this.query.paramTypes) {
                serialization = await adapter.queryWithVars(serialization, this.query.params);
            }
            else {
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
            if (!Array.isArray(serialization.response) ||
                (Array.isArray(serialization.response) &&
                    serialization.response.length > 0)) {
                serialization.message = `${this.query.objectType} found.`;
                serialization.success = true;
            }
        }
        return serialization;
    }
}
exports.DgraphQueryExecutor = DgraphQueryExecutor;

//# sourceMappingURL=../maps/classes/DgraphQueryExecutor.js.map
