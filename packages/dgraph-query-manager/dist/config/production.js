"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const production = {
    dgraph: {
        adapter: {
            address: 'localhost:9080'
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
exports.default = production;

//# sourceMappingURL=../maps/config/production.js.map
