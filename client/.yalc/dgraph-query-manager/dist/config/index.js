'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const development_1 = require('./development');
const production_1 = require('./production');
let config;
if (process.env.NODE_ENV !== 'production') {
  config = development_1.default;
} else {
  config = production_1.default;
}
exports.default = config;

//# sourceMappingURL=index.js.map
