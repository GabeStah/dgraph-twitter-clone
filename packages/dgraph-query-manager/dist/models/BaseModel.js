"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-null-keyword
const logger_1 = require("../logger");
const adapters_1 = require("../adapters");
const classes_1 = require("../classes");
const models_1 = require("../models");
/**
 * All - Deletes the node and all child nodes.
 * Node - Deletes node.
 * Edge - Deletes specified edge(s).
 * AllChildEdges - Removes all child edges from node.
 * AllChildNodes - Deletes all child nodes and edge references from node.
 */
var BaseModelDeletionMode;
(function (BaseModelDeletionMode) {
    BaseModelDeletionMode[BaseModelDeletionMode["All"] = 0] = "All";
    BaseModelDeletionMode[BaseModelDeletionMode["Node"] = 1] = "Node";
    BaseModelDeletionMode[BaseModelDeletionMode["Edge"] = 2] = "Edge";
    BaseModelDeletionMode[BaseModelDeletionMode["AllChildEdges"] = 3] = "AllChildEdges";
    BaseModelDeletionMode[BaseModelDeletionMode["AllChildNodes"] = 4] = "AllChildNodes";
})(BaseModelDeletionMode = exports.BaseModelDeletionMode || (exports.BaseModelDeletionMode = {}));
class BaseModel {
    /**
     * Constructs an instance of inheriting class using an (optional) partial parameters object.
     * @param {Partial<BaseModel<T>>} params
     * @param uid
     */
    constructor(params = {}, uid) {
        Object.assign(this, params);
        if (this.uid) {
            this.uid = new models_1.Uid(this.uid);
        }
    }
    /**
     * Factory that creates BaseModel instances from Partial<BaseModel<T>> paramTypes.
     * @param {Partial<BaseModel<T>>} params
     * @returns {Promise<BaseModel<T>>}
     */
    static async create(params) {
        const className = this.name;
        const serialization = new classes_1.Serialization({
            message: `${className} successfully created.`,
            data: params,
            request: params
        });
        return new Promise((resolve, reject) => {
            this.load(params)
                .then(processed => {
                logger_1.default.info(`${className}.create.load.then fulfilled, processed: %o`, processed);
                serialization.response = new this(processed);
                serialization.success = true;
                resolve(serialization);
            })
                .catch(error => {
                logger_1.default.info(`${className}.create.load.then failed, error: %o', error`);
                serialization.error = error;
                serialization.message = `${className} creation failed.`;
                serialization.success = false;
                resolve(serialization);
            });
        });
    }
    /**
     * Factory that creates multiple BaseModel instances from BaseModel array.
     * @param {Partial<BaseModel<T>>[]} params
     * @returns {Promise<BaseModel<T>[]>}
     */
    static async createMany(params = []) {
        var e_1, _a;
        const elements = [];
        try {
            for (var params_1 = __asyncValues(params), params_1_1; params_1_1 = await params_1.next(), !params_1_1.done;) {
                const param = params_1_1.value;
                elements.push((await this.create(param)).response);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (params_1_1 && !params_1_1.done && (_a = params_1.return)) await _a.call(params_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return elements;
    }
    /**
     * Delete nodes, edges, or children of passed object.
     * @param {Uid | BaseModel<T> | object | string} item
     * @param {BaseModelDeletionMode} mode
     * @param {string} edge
     * @returns {Promise<Serialization>}
     */
    static async delete(item, mode = BaseModelDeletionMode.All, edge) {
        const adapter = new adapters_1.DgraphAdapterHttp();
        const className = this.name;
        let serialization = new classes_1.Serialization({
            message: `${className} successfully deleted.`,
            data: item
        });
        if (item instanceof BaseModel ||
            (typeof item === 'object' && !(item instanceof models_1.Uid))) {
            serialization.request = this.getDeletionRequest(item, mode, edge);
        }
        return new Promise((resolve, reject) => {
            adapter
                .mutate(serialization, adapters_1.MutationTypes.DeleteJson)
                .then(result => {
                serialization = result;
                serialization.success = true;
                resolve(serialization);
            })
                .catch(error => {
                serialization.error = error;
                serialization.statusCode = 500;
                serialization.success = false;
                serialization.message = `${className} deletion failed.`;
                reject(serialization);
            });
        });
    }
    /**
     * Deserialize Dgraph object.
     * @param {Partial<any | T>} params
     * @returns {Promise<Partial<T>>}
     */
    static deserialize(params = {}) {
        // Update Uid
        if (params.uid) {
            if (Array.isArray(params.uid)) {
                // Assume first Uid is applicable
                params.uid = new models_1.Uid(params.uid[0]);
            }
            else {
                params.uid = new models_1.Uid(params.uid);
            }
        }
        return params;
    }
    /**
     * Find a node in database based on passed Uid or BaseModel<T> instance type.
     * @param {BaseModel<T> | Uid | string | number} params
     * @returns {Promise<Serialization>}
     */
    static async find(params) {
        // const adapter = new DgraphAdapter();
        const className = this.name;
        let uid = '';
        // Get uid string from Uid instance.
        if (params instanceof this && params.uid) {
            uid = params.uid.toString();
        }
        else if (params instanceof models_1.Uid) {
            uid = params.toString();
        }
        const executor = new classes_1.DgraphQueryExecutor(classes_1.Queries[className].find, {
            $id: uid
        });
        const serialization = await executor.execute();
        if (serialization && serialization.success && serialization.response) {
            // Create instance of T from deserialized result.
            serialization.response = new this(serialization.response);
        }
        return serialization;
    }
    /**
     * Find this node in database.
     * @returns {Promise<Serialization>}
     */
    async find() {
        const adapter = new adapters_1.DgraphAdapterHttp();
        const className = this.constructor.name;
        const serialization = new classes_1.Serialization({
            message: `${className} found.`
        });
        return new Promise((resolve, reject) => {
            adapter
                .query(serialization)
                .then(payload => {
                serialization.data = payload;
                serialization.response = payload;
                serialization.success = true;
                resolve(serialization);
            })
                .catch(error => {
                serialization.data = this;
                serialization.statusCode = 500;
                serialization.success = false;
                serialization.message = `${className} find failed.`;
                reject(serialization);
            });
        });
    }
    /**
     * Converts passed JSON string or object to new inheriting class instance.
     * @param {object | string} json
     * @returns {InstanceType<T>}
     */
    static fromJSON(json) {
        switch (typeof json) {
            case 'object':
                return Object.assign(new this(), json);
            case 'string':
                return Object.assign(new this(), JSON.parse(json));
        }
    }
    /**
     * Converts passed object to new inheriting calss instance.
     * @param {object} obj
     * @returns {InstanceType<T>}
     */
    fromObject(obj) {
        return Object.assign(new this(), obj);
    }
    /**
     * Generates a deletion request object based on passed object and paramTypes.
     * @param {BaseModel<T> | any} params
     * @param {BaseModelDeletionMode} mode
     * @param {string} edge
     * @returns {object | undefined}
     */
    static getDeletionRequest(params, mode = BaseModelDeletionMode.All, edge) {
        let result = [];
        // Add primary Uid
        if (params.hasOwnProperty('uid') && params.uid) {
            result.push({
                uid: params.uid.toString()
            });
        }
        if (mode === BaseModelDeletionMode.All) {
            // Add parent node Uid to uids list.
            Object.entries(params).forEach(([key, value]) => {
                // Check if deletable
                if (value instanceof BaseModel && value.isDeletableType()) {
                    // Add Uid to list to delete actual child node
                    result.push(new models_1.Uid(value));
                }
                else if (Array.isArray(value) &&
                    value.some(element => element instanceof BaseModel && element.isDeletableType())) {
                    // Add array of node Uids to uids list
                    result = result.concat(value
                        .filter(parent => parent.isDeletableType())
                        .map(child => new models_1.Uid(child)));
                }
            });
        }
        else if (mode === BaseModelDeletionMode.AllChildNodes) {
            Object.entries(params).forEach(([key, value]) => {
                // Check if deletable
                if (value instanceof BaseModel && value.isDeletableType()) {
                    // Null key of child type to remove edge reference
                    result[0][key] = null;
                    // Add Uid to list to delete actual child node
                    result.push(new models_1.Uid(value));
                }
                else if (Array.isArray(value) &&
                    value.some(element => element instanceof BaseModel && element.isDeletableType())) {
                    // Null key of child type to remove edge reference
                    result[0][key] = null;
                    // Add array of node Uids to uids list
                    result = result.concat(value
                        .filter(parent => parent.isDeletableType())
                        .map(child => new models_1.Uid(child)));
                }
            });
        }
        else if (mode === BaseModelDeletionMode.AllChildEdges) {
            Object.entries(params).forEach(([key, value]) => {
                // Check if deletable
                if (value instanceof BaseModel && value.isDeletableType()) {
                    // Null key of child type to remove edge reference
                    result[0][key] = null;
                }
                else if (Array.isArray(value) &&
                    value.some(element => element instanceof BaseModel && element.isDeletableType())) {
                    result[0][key] = null;
                }
            });
        }
        else if (mode === BaseModelDeletionMode.Edge) {
            let count = 0;
            if (edge) {
                Object.entries(params).forEach(([key, value]) => {
                    if (key === edge) {
                        // Check if deletable
                        if (value instanceof BaseModel && value.isDeletableType()) {
                            // Null key of child type to remove edge reference
                            result[0][key] = null;
                            count++;
                        }
                        else if (Array.isArray(value) &&
                            value.some(element => element instanceof BaseModel && element.isDeletableType())) {
                            result[0][key] = null;
                            count++;
                        }
                    }
                });
            }
            // No matching edges found.
            if (count === 0) {
                throw new Error(`Cannot delete edge (${edge}) of object: ${JSON.stringify(params)}`);
            }
        }
        // GRPC won't accept a single-element Array, so return first element object if singular.
        return result.length === 1 ? result[0] : result;
    }
    /**
     * Generates temporary instance of T and returns object containing combined default properties with passes paramTypes.
     * @param {Partial<T>} params
     * @returns {InstanceType<T>}
     */
    static injectDefaults(params = {}) {
        const temp = new this();
        return Object.assign({}, temp, params);
    }
    /**
     * Directly insert object into database.
     * @param {Partial<T>} params
     * @param {Partial<T> | object} params2
     * @returns {Promise<Serialization>}
     */
    static async insert(params = {}, params2) {
        Object.assign(params, params2);
        const adapter = new adapters_1.DgraphAdapterHttp();
        const className = this.name;
        const serialization = new classes_1.Serialization({
            message: `${className} created.`,
            request: params,
            data: params
        });
        return new Promise((resolve, reject) => {
            adapter
                .mutate(serialization)
                .then(serialization => {
                // serialization.response = payload;
                serialization.success = true;
                resolve(serialization);
            })
                .catch(error => {
                // serialization.data = paramTypes;
                serialization.statusCode = 500;
                serialization.success = false;
                serialization.error = error;
                serialization.message = `${className} creation failed.`;
                reject(serialization);
            });
        });
    }
    /**
     * Indicates if instance is a deletable type.
     * @returns {boolean}
     */
    isDeletableType() {
        const className = this.constructor.name;
        return className === 'Hashtag' || className === 'Tweet';
    }
    /**
     * Indicates if passed in value is a deletable type.
     * @param obj
     * @returns {boolean}
     */
    static isDeletableType(obj) {
        const className = obj.constructor.name;
        return className === 'Hashtag' || className === 'Tweet';
    }
    /**
     * Indicates if instance is a nodeable type (i.e. can have a Uid in database).
     * @returns {boolean}
     */
    isNodeableType() {
        const className = this.constructor.name;
        return (className === 'Hashtag' || className === 'Tweet' || className === 'User');
    }
    /**
     * Indicates if passed in value is a nodeable type (i.e. can have a Uid in database).
     * @param obj
     * @returns {boolean}
     */
    static isNodeableType(obj) {
        const className = obj.constructor.name;
        return (className === 'Hashtag' || className === 'Tweet' || className === 'User');
    }
    /**
     * Determines if passed payload object is valid.
     * @param {object} response
     * @returns {boolean}
     */
    static isResponseValid(response) {
        const className = this.name;
        return !!(typeof response === 'object' && response[className]);
    }
    /**
     * Invokes async BaseModel<T> creation process.
     * @param {Partial<BaseModel<T>>} params
     * @returns {Promise<Partial<BaseModel<T>>>}
     */
    static async load(params = {}) {
        // Combine paramTypes with default properties.
        params = this.injectDefaults(params);
        return params;
    }
    /**
     * Serialize object into Dgraph acceptable format for JSON transaction.
     * @param {Partial<any | T>} params
     * @returns {Promise<Partial<T>>}
     */
    static async serialize(params = {}) {
        var e_2, _a, e_3, _b;
        const serialization = {};
        // Update Uid
        if (params.uid) {
            if (Array.isArray(params.uid)) {
                // Assume first Uid is applicable
                params.uid = new models_1.Uid(params.uid[0]);
            }
            else {
                params.uid = new models_1.Uid(params.uid);
            }
        }
        try {
            for (var _c = __asyncValues(Object.keys(params)), _d; _d = await _c.next(), !_d.done;) {
                const key = _d.value;
                // Check if Uid
                if (params[key] instanceof models_1.Uid && key === 'uid') {
                    // Convert Uid to string values
                    serialization[key] = params[key].toString();
                }
                else if (params[key] instanceof BaseModel) {
                    // For BaseModel instances recursively serialize
                    serialization[key] = await this.serialize(params[key]);
                }
                else if (Array.isArray(params[key]) &&
                    params[key].filter(instance => instance instanceof BaseModel).length > 0) {
                    const instances = [];
                    try {
                        for (var _e = __asyncValues(params[key]), _f; _f = await _e.next(), !_f.done;) {
                            const instance = _f.value;
                            instances.push(await this.serialize(instance));
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) await _b.call(_e);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    serialization[key] = instances;
                }
                else {
                    serialization[key] = params[key];
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) await _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return serialization;
    }
    /**
     * Converts class instance to JSON string.
     * REMOVED: Removed due to incompatibility with GRPC (GRPC unintentionally calls this method).
     * @returns {string}
     */
    // toJSON<T>(this: T): string {
    //     const temp = JSON.stringify(Object.assign({}, this));
    //     return temp;
    // }
    /**
     * Converts class instance to JavaScript object.
     * @returns {T}
     */
    toObject() {
        return Object.assign({}, this);
    }
    /**
     * TODO: Convert instance to query.
     * @returns {string}
     */
    toQuery() {
        return '';
    }
    /**
     * Create database node of instance if matching Uid doesn't exist.
     * If Uid exists, update node instead.
     * @param {Partial<T>} params
     * @param {Partial<T> | object} params2
     * @returns {Promise<Serialization>}
     */
    static async upsert(params = {}, params2) {
        Object.assign(params, params2);
        const className = this.name;
        const serialization = new classes_1.Serialization({
            message: `${className} upserted.`,
            data: params,
            request: params
        });
        return new Promise((resolve, reject) => {
            this.load(params)
                .then(payload => {
                serialization.response = new this(payload);
                serialization.success = true;
                resolve(serialization);
            })
                .catch(error => {
                // serialization.data = this;
                serialization.error = error;
                serialization.statusCode = 500;
                serialization.success = false;
                serialization.message = `${className} upsert failed.`;
                reject(serialization);
            });
        });
    }
}
exports.BaseModel = BaseModel;

//# sourceMappingURL=BaseModel.js.map
