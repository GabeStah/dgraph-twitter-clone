"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DgraphConnectionType;
(function (DgraphConnectionType) {
    DgraphConnectionType[DgraphConnectionType["API"] = 0] = "API";
    DgraphConnectionType[DgraphConnectionType["DIRECT"] = 1] = "DIRECT";
})(DgraphConnectionType = exports.DgraphConnectionType || (exports.DgraphConnectionType = {}));
const development = {
    connectionType: DgraphConnectionType.DIRECT,
    dgraph: {
        adapter: {
            address: 'http://192.168.99.100:8080'
        },
        api: {
            protocol: 'http',
            host: 'localhost',
            port: 5000
        }
    },
    faker: {
        seed: 1234567890
    }
};
exports.default = development;

//# sourceMappingURL=development.js.map
