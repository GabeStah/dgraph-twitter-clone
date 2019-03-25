"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
exports.logger = winston_1.createLogger({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), 
    // format.errors({ stack: true }),
    winston_1.format.splat(), winston_1.format.json()),
    defaultMeta: { service: 'api' },
    // transports: [
    //     new transports.File({ filename: 'logs/api-error.log', level: 'error' }),
    //     new transports.File({ filename: 'logs/api-combined.log' })
    // ],
    exitOnError: false,
});
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.transports.Console({
        format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
    }));
}
exports.default = exports.logger;

//# sourceMappingURL=index.js.map
