"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const development = {
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

//# sourceMappingURL=../maps/config/development.js.map
