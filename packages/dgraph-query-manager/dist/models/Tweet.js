'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// Lib
const faker = require('faker');
const twitter = require('twitter-text');
// Local
const config_1 = require('../config');
const models_1 = require('../models');
const utility_1 = require('../helpers/utility');
var FakerTweetTypes;
(function(FakerTweetTypes) {
  FakerTweetTypes[(FakerTweetTypes['COMPANY_BS'] = 0)] = 'COMPANY_BS';
  FakerTweetTypes[(FakerTweetTypes['COMPANY_CATCH_PHRASE'] = 1)] =
    'COMPANY_CATCH_PHRASE';
  FakerTweetTypes[(FakerTweetTypes['HACKER'] = 2)] = 'HACKER';
  FakerTweetTypes[(FakerTweetTypes['WORDS'] = 3)] = 'WORDS';
  FakerTweetTypes[(FakerTweetTypes['LOREM'] = 4)] = 'LOREM';
})(
  (FakerTweetTypes = exports.FakerTweetTypes || (exports.FakerTweetTypes = {}))
);
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
     * Indicates whether this Tweet has been favorited by the authenticating user.
     * @type {boolean}
     */
    this['tweet.favorited'] = false;
    /**
     * Indicates whether this is a Quoted Tweet.
     * @type {boolean}
     */
    this['tweet.isQuoteStatus'] = false;
    /**
     * Number of times this Tweet has been retweeted.
     * @type {number}
     */
    this['tweet.retweetCount'] = 0;
    /**
     * Indicates whether this Tweet has been liked by the authenticating user.
     * @type {boolean}
     */
    this['tweet.retweeted'] = false;
    // Override defaults
    Object.assign(this, Tweet.deserialize(params));
  }
  /**
   * Deserialize Dgraph form of Tweet object.
   * @param {Partial<any | Tweet>} params
   * @returns {Promise<Partial<Tweet>>}
   */
  static deserialize(params = {}) {
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
        params['tweet.hashtag'] = params['tweet.hashtag'].map(
          hashtag => new models_1.Hashtag(hashtag)
        );
      } else {
        params['tweet.hashtag'] = [
          new models_1.Hashtag(params['tweet.hashtag'])
        ];
      }
    }
    // Uids
    if (params['tweet.inReplyToStatusId'])
      params['tweet.inReplyToStatusId'] = new models_1.Uid(
        params['tweet.inReplyToStatusId']
      );
    if (params['tweet.inReplyToUserId'])
      params['tweet.inReplyToUserId'] = new models_1.Uid(
        params['tweet.inReplyToUserId']
      );
    params = super.deserialize(params);
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
      if (
        extractedHashtags &&
        Array.isArray(extractedHashtags) &&
        extractedHashtags.length > 0
      ) {
        const hashtags = [];
        for (const element of extractedHashtags) {
          // Add new Hashtag instance
          hashtags.push(
            models_1.Hashtag.createObject(element.hashtag, element.indices)
          );
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
   * @param params
   * @param mention
   * @returns {Tweet}
   */
  static generate(seed = config_1.default.faker.seed, params, mention) {
    return new Tweet(this.generateFakeParams(seed, params, mention));
  }
  /**
   * Generates a mockup Tweet object for testing.
   * @param {number} seed
   * @param params
   * @param mention
   * @returns {Partial<Tweet>}
   */
  static generateFakeParams(
    seed = config_1.default.faker.seed,
    params,
    mention
  ) {
    // Set seed base.
    faker.seed(seed);
    const max = 500;
    return Object.assign(
      {
        'tweet.favoriteCount': faker.random.number(max),
        'tweet.favorited': faker.random.boolean(),
        'tweet.isQuoteStatus': faker.random.boolean(),
        'tweet.retweetCount': faker.random.number(max),
        'tweet.retweeted': faker.random.boolean(),
        'tweet.text': this.generateRandomTweetText(seed, mention),
        'tweet.user': models_1.User.generate()
      },
      params
    );
  }
  /**
   * Generates random tweet text.
   * @param seed
   * @param mention
   */
  static generateRandomTweetText(seed = config_1.default.faker.seed, mention) {
    const type = utility_1.getRandomEnumElement(FakerTweetTypes);
    let result;
    switch (type) {
      case FakerTweetTypes.COMPANY_BS:
        result = Tweet.getValidTweetString(
          [
            faker.company.bsAdjective(),
            faker.company.bsBuzz(),
            faker.company.bsNoun()
          ],
          [
            faker.company.catchPhraseAdjective(),
            faker.company.catchPhraseAdjective()
          ],
          mention
        );
        return result;
      case FakerTweetTypes.COMPANY_CATCH_PHRASE:
        result = Tweet.getValidTweetString(
          [
            faker.company.catchPhraseAdjective(),
            faker.company.catchPhraseDescriptor(),
            faker.company.catchPhraseNoun()
          ],
          [faker.company.bsAdjective(), faker.company.bsAdjective()],
          mention
        );
        return result;
      case FakerTweetTypes.HACKER:
        result = Tweet.getValidTweetString(
          faker.hacker.phrase(),
          [faker.hacker.ingverb(), faker.hacker.adjective()],
          mention
        );
        return result;
      case FakerTweetTypes.LOREM:
        result = Tweet.getValidTweetString(
          faker.lorem.sentence(),
          [faker.company.bsAdjective(), faker.lorem.word()],
          mention
        );
        return result;
      case FakerTweetTypes.WORDS:
        result = Tweet.getValidTweetString(
          [
            faker.random.word(),
            faker.random.word(),
            faker.random.word(),
            faker.random.word()
          ],
          [faker.random.word(), faker.random.word()],
          mention
        );
        return result;
    }
  }
  /**
   * Generates hashtags from passed text field or 'tweet.text' property, using twitter-text lib.
   * @param text
   */
  getHashtags(text) {
    return twitter.extractHashtagsWithIndices(text ? text : this['tweet.text']);
  }
  /**
   * Generates a random string suitable for a Tweet text field.
   * @param word
   * @param hashtag
   * @param mention
   */
  static getValidTweetString(word, hashtag, mention) {
    const result = [];
    if (mention) {
      if (mention instanceof Array && mention.length > 0) {
        result.push(
          mention.map(user => `@${user['user.screenName']}`).join(' ')
        );
      } else if (mention instanceof models_1.User) {
        result.push(`@${mention['user.screenName']}`);
      }
    }
    if (Array.isArray(word) && word.length > 0) {
      result.push(word.join(' '));
    } else if (typeof word === 'string') {
      result.push(word);
    }
    if (hashtag) {
      if (typeof hashtag === 'number') {
        const tempTags = [];
        // Generate number of hashtags
        for (let count = 0; count <= hashtag; count++) {
          tempTags.push(`#${faker.company.bsAdjective}`);
        }
        // Join with space delimiter.
        result.push(tempTags.join(' '));
      } else if (Array.isArray(hashtag) && hashtag.length > 0) {
        result.push(hashtag.map(tag => `#${tag}`).join(' '));
      } else if (typeof hashtag === 'string') {
        result.push(`#${hashtag}`);
      }
    }
    return result.join(' ');
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
    // Only create Hashtags if no Hashtags exist
    if (!params['tweet.hashtag'] || params['tweet.hashtag'].length === 0) {
      // Parse hashtags
      params = this.extractHashtags(params);
      // Create Hashtags
      const hashtags = params['tweet.hashtag'];
      if (hashtags && Array.isArray(hashtags) && hashtags.length > 0) {
        params['tweet.hashtag'] = await models_1.Hashtag.createMany(hashtags);
      }
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

//# sourceMappingURL=Tweet.js.map
