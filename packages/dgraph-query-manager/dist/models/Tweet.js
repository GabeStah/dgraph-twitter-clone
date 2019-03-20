"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Lib
const faker = require("faker");
const twitter = require("twitter-text/dist");
// Local
const config_1 = require("../config");
const models_1 = require("../models");
class Tweet extends models_1.BaseModel {
    constructor(params = {}) {
        super(params);
        /**
         * UTC time when this Tweet was created.
         * @type {Date}
         */
        this['tweet.createdAt'] = new Date();
        /**
         * Indicates approximately how many times this Tweet has been liked by Twitter users.
         * @type {?number}
         */
        this['tweet.favoriteCount'] = 0;
        /**
         * Number of times this Tweet has been retweeted.
         * @type {number}
         */
        this['tweet.retweetCount'] = 0;
        // Override defaults
        Object.assign(this, Tweet.deserialize(params));
    }
    /**
     * Deserialize Dgraph form of Tweet object.
     * @param {Partial<any | Tweet>} params
     * @returns {Promise<Partial<Tweet>>}
     */
    static deserialize(params = {}) {
        params = super.deserialize(params);
        // Dates
        if (params['tweet.createdAt'])
            params['tweet.createdAt'] = new Date(params['tweet.createdAt']);
        // User
        if (params['tweet.user']) {
            params['tweet.user'] = new models_1.User(params['tweet.user']);
        }
        // Hashtags
        if (params['tweet.hashtag']) {
            if (Array.isArray(params['tweet.hashtag'])) {
                params['tweet.hashtag'] = params['tweet.hashtag'].map(hashtag => new models_1.Hashtag(hashtag));
            }
            else {
                params['tweet.hashtag'] = [new models_1.Hashtag(params['tweet.hashtag'])];
            }
        }
        // Uids
        if (params['tweet.inReplyToStatusId'])
            params['tweet.inReplyToStatusId'] = new models_1.Uid(params['tweet.inReplyToStatusId']);
        if (params['tweet.inReplyToUserId'])
            params['tweet.inReplyToUserId'] = new models_1.Uid(params['tweet.inReplyToUserId']);
        return params;
    }
    /**
     * Parses Tweet text and extracts Hashtags.
     * @param {Partial<Tweet>} params
     * @returns {Partial<Tweet>}
     */
    static extractHashtags(params = {}) {
        const text = params['tweet.text'];
        // Ensure valid tweet
        if (text && text.length > 0 && !twitter.isInvalidTweet(text)) {
            // Extract hashtags
            const extractedHashtags = twitter.extractHashtagsWithIndices(text);
            if (extractedHashtags &&
                Array.isArray(extractedHashtags) &&
                extractedHashtags.length > 0) {
                const hashtags = [];
                for (const element of extractedHashtags) {
                    // Add new Hashtag instance
                    hashtags.push(models_1.Hashtag.createObject(element.hashtag, element.indices));
                }
                // Assign hashtags
                params['tweet.hashtag'] = hashtags;
            }
        }
        return params;
    }
    /**
     * Generates a Tweet instance for testing.
     * @param {number} seed
     * @returns {Tweet}
     */
    static generate(seed = config_1.default.faker.seed) {
        return new Tweet(this.generateFakeParams(seed));
    }
    /**
     * Generates a mockup Tweet object for testing.
     * @param {number} seed
     * @returns {Partial<Tweet>}
     */
    static generateFakeParams(seed = config_1.default.faker.seed) {
        // Set seed base.
        faker.seed(seed);
        return {
            'tweet.favoriteCount': faker.random.number(),
            'tweet.favorited': faker.random.boolean(),
            // 'tweet.hashtag'?: [Hashtag];
            'tweet.inReplyToStatusId': new models_1.Uid(123),
            'tweet.inReplyToUserId': new models_1.Uid(456),
            'tweet.isQuoteStatus': faker.random.boolean(),
            // 'tweet.quotedStatus'?: Tweet,
            'tweet.retweetCount': faker.random.number(),
            'tweet.retweeted': faker.random.boolean(),
            'tweet.text': faker.lorem.sentence(),
            // 'tweet.user':               new User({
            //     uid: new Uid(678)
            // }),
            'tweet.user': models_1.User.generate()
        };
    }
    /**
     * Generates hashtags from passed text field or 'tweet.text' property, using twitter-text lib.
     * @param text
     */
    getHashtags(text) {
        return twitter.extractHashtagsWithIndices(text ? text : this['tweet.text']);
    }
    /**
     * Performs all steps of async Tweet creation.
     * @param {Partial<Tweet>} params
     * @returns {Promise<Partial<Tweet>>}
     */
    static async load(params = {}) {
        // Combine paramTypes with default properties.
        params = this.injectDefaults(params);
        // Load child elements (e.g. User.load(['tweet.user']) )
        params = await this.loadChildren(params);
        // Serialize (e.g. convert fields to payload-compatible object)
        params = await this.serialize(params);
        // Perform mutation (e.g. upsert)
        const serialization = await this.insert(params);
        if (!params.uid) {
            params.uid = new models_1.Uid(serialization);
        }
        // Deserialize (e.g. convert payload back to Models)
        params = this.deserialize(params);
        return params;
    }
    /**
     * Performs all steps of async Tweet creation.
     * @param {Partial<Tweet>} params
     * @returns {Promise<Partial<Tweet>>}
     */
    async load(params = {}) {
        // Combine paramTypes with default properties.
        params = Tweet.injectDefaults(params);
        // Load child elements (e.g. User.load(['tweet.user']) )
        params = await Tweet.loadChildren(params);
        // Serialize (e.g. convert fields to payload-compatible object)
        params = await Tweet.serialize(params);
        // Perform mutation (e.g. upsert)
        const serialization = await Tweet.insert(params);
        params.uid = new models_1.Uid(serialization);
        // Deserialize (e.g. convert payload back to Models)
        params = Tweet.deserialize(params);
        return params;
    }
    /**
     * Preprocessor that parses text, Hashtags, and User.  Invokes .create methods for each to ensure children exist.
     * @param {Partial<Tweet>} params
     * @returns {Promise<Partial<Tweet>>}
     */
    static async loadChildren(params = {}) {
        // Parse hashtags
        params = this.extractHashtags(params);
        // Create Hashtags
        const hashtags = params['tweet.hashtag'];
        if (hashtags && Array.isArray(hashtags) && hashtags.length > 0) {
            params['tweet.hashtag'] = (await models_1.Hashtag.createMany(hashtags));
        }
        // Create User
        const user = params['tweet.user'];
        if (user && Object.keys(user).length > 0) {
            params['tweet.user'] = (await models_1.User.create(user)).response;
        }
        return params;
    }
}
exports.Tweet = Tweet;

//# sourceMappingURL=../maps/models/Tweet.js.map
