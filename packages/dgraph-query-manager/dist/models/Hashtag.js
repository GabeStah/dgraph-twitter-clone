"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class Hashtag extends models_1.BaseModel {
    // TODO: Factory inverse generate database instances for BaseModel classes without uid
    constructor(params = {}) {
        super(params);
        // Override defaults
        Object.assign(this, Hashtag.deserialize(params));
    }
    static createObject(hashtag, indices) {
        return {
            'hashtag.hashtag': hashtag,
            'hashtag.indices': indices
        };
    }
    /**
     * Performs all steps of async Hashtag creation.
     * @param {Partial<Hashtag>} params
     * @returns {Promise<Hashtag<Tweet>>}
     */
    static async load(params = {}) {
        // Combine paramTypes with default properties.
        params = this.injectDefaults(params);
        // Serialize (e.g. convert fields to payload-compatible object)
        params = await this.serialize(params);
        // Perform mutation
        const serialization = await this.insert(params);
        if (!params.uid) {
            params.uid = new models_1.Uid(serialization);
        }
        // paramTypes = ().response;
        // Deserialize (e.g. convert payload back to object)
        params = this.deserialize(params);
        return params;
    }
}
exports.Hashtag = Hashtag;

//# sourceMappingURL=Hashtag.js.map
