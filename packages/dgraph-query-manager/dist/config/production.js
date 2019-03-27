'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const development_1 = require('./development');
const production = {
  connectionType: development_1.DgraphConnectionType.DIRECT,
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

//# sourceMappingURL=production.js.map
