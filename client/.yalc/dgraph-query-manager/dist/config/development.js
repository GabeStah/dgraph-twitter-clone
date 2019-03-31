'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const classes_1 = require('../classes');
const development = {
  connectionType: classes_1.DgraphConnectionType.DIRECT,
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
