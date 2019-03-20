import config from './config';
import * as faker from 'faker';
import { BaseModel, BaseModelInterface } from './base-model';
import { Hashtag } from './hashtag';
import { Uid } from './uid';
import { User } from './user';
import * as twitter from 'twitter-text/dist';

export interface TweetInterface extends BaseModelInterface {
  'tweet.createdAt': Date | string;
  'tweet.favoriteCount'?: number;
  'tweet.favorited': false;
  'tweet.hashtag'?: Hashtag[];
  'tweet.inReplyToStatusId'?: Uid;
  'tweet.inReplyToUserId'?: Uid;
  'tweet.isQuoteStatus': false;
  'tweet.quotedStatus'?: Tweet;
  'tweet.retweetCount'?: number;
  'tweet.retweeted': false;
  'tweet.text': string;
  'tweet.user': User;
}

export class Tweet extends BaseModel<Tweet> implements TweetInterface {
  /**
   * UTC time when this Tweet was created.
   * @type {Date}
   */
  'tweet.createdAt': Date = new Date();

  /**
   * Collection of hashtags included in this Tweet, if applicable.
   * @type {?Hashtag[]}
   */
  'tweet.hashtag'?: Hashtag[];

  /**
   * Indicates approximately how many times this Tweet has been liked by Twitter users.
   * @type {?number}
   */
  'tweet.favoriteCount' = 0;

  /**
   * Indicates whether this Tweet has been favorited by the authenticating user.
   * @type {boolean}
   */
  'tweet.favorited': false;

  /**
   * If the represented Tweet is a reply, this field will contain the integer representation of the original Tweet’s ID.
   * @type {?Uid}
   */
  'tweet.inReplyToStatusId'?: Uid;

  /**
   * If the represented Tweet is a reply, this field will contain the integer representation of the original Tweet’s author ID. This will not necessarily always be the user directly mentioned in the Tweet.
   * @type {?Uid}
   */
  'tweet.inReplyToUserId'?: Uid;

  /**
   * Indicates whether this is a Quoted Tweet.
   * @type {boolean}
   */
  'tweet.isQuoteStatus': false;

  /**
   * Quoted Tweet, if applicable.
   * @type {?Tweet}
   */
  'tweet.quotedStatus'?: Tweet;

  /**
   * Number of times this Tweet has been retweeted.
   * @type {number}
   */
  'tweet.retweetCount' = 0;

  /**
   * Indicates whether this Tweet has been liked by the authenticating user.
   * @type {boolean}
   */
  'tweet.retweeted': false;

  /**
   * The actual UTF-8 text of the status upsert.
   * @type {string}
   */
  'tweet.text': string;

  /**
   * The user who posted this Tweet.
   * @type {User}
   */
  'tweet.user': User;

  constructor(params: Partial<Tweet> = {}) {
    super(params);
    // Override defaults
    Object.assign(this, Tweet.deserialize(params));
  }

  /**
   * Deserialize Dgraph form of Tweet object.
   * @param {Partial<any | Tweet>} params
   * @returns {Promise<Partial<Tweet>>}
   */
  static deserialize<Tweet>(params: Partial<Tweet | any> = {}): Partial<Tweet> {
    params = super.deserialize(params);
    // Dates
    if (params['tweet.createdAt'])
      params['tweet.createdAt'] = new Date(params['tweet.createdAt']);
    // User
    if (params['tweet.user']) {
      params['tweet.user'] = new User(params['tweet.user']);
    }
    // Hashtags
    if (params['tweet.hashtag']) {
      if (Array.isArray(params['tweet.hashtag'])) {
        params['tweet.hashtag'] = params['tweet.hashtag'].map(
          hashtag => new Hashtag(hashtag)
        );
      } else {
        params['tweet.hashtag'] = [new Hashtag(params['tweet.hashtag'])];
      }
    }
    // Uids
    if (params['tweet.inReplyToStatusId'])
      params['tweet.inReplyToStatusId'] = new Uid(
        params['tweet.inReplyToStatusId']
      );
    if (params['tweet.inReplyToUserId'])
      params['tweet.inReplyToUserId'] = new Uid(
        params['tweet.inReplyToUserId']
      );
    return params;
  }

  /**
   * Parses Tweet text and extracts Hashtags.
   * @param {Partial<Tweet>} params
   * @returns {Partial<Tweet>}
   */
  static extractHashtags(params: Partial<Tweet> = {}): Partial<Tweet> {
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
        const hashtags: any[] = [];
        for (const element of extractedHashtags) {
          // Add new Hashtag instance
          hashtags.push(Hashtag.createObject(element.hashtag, element.indices));
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
  static generate(seed: number = config.faker.seed): Tweet {
    return new Tweet(this.generateFakeParams(seed));
  }

  /**
   * Generates a mockup Tweet object for testing.
   * @param {number} seed
   * @returns {Partial<Tweet>}
   */
  static generateFakeParams(seed: number = config.faker.seed): Partial<Tweet> {
    // Set seed base.
    faker.seed(seed);
    return {
      'tweet.favoriteCount': faker.random.number(),
      'tweet.favorited': faker.random.boolean(),
      // 'tweet.hashtag'?: [Hashtag];
      'tweet.inReplyToStatusId': new Uid(123),
      'tweet.inReplyToUserId': new Uid(456),
      'tweet.isQuoteStatus': faker.random.boolean(),
      // 'tweet.quotedStatus'?: Tweet,
      'tweet.retweetCount': faker.random.number(),
      'tweet.retweeted': faker.random.boolean(),
      'tweet.text': faker.lorem.sentence(),
      // 'tweet.user':               new User({
      //     uid: new Uid(678)
      // }),
      'tweet.user': User.generate()
    };
  }

  /**
   * Generates hashtags from passed text field or 'tweet.text' property, using twitter-text lib.
   * @param text
   */
  getHashtags(text: string) {
    return twitter.extractHashtagsWithIndices(text ? text : this['tweet.text']);
  }

  /**
   * Performs all steps of async Tweet creation.
   * @param {Partial<Tweet>} params
   * @returns {Promise<Partial<Tweet>>}
   */
  static async load(params: Partial<Tweet> = {}): Promise<Partial<Tweet>> {
    // Combine paramTypes with default properties.
    params = this.injectDefaults(params);
    // Load child elements (e.g. User.load(['tweet.user']) )
    params = await this.loadChildren(params);
    // Serialize (e.g. convert fields to payload-compatible object)
    params = await this.serialize(params);
    // Perform mutation (e.g. upsert)
    const serialization = await this.insert(params);
    if (!params.uid) {
      params.uid = new Uid(serialization);
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
  async load(params: Partial<Tweet> = {}): Promise<Partial<Tweet>> {
    // Combine paramTypes with default properties.
    params = Tweet.injectDefaults(params);
    // Load child elements (e.g. User.load(['tweet.user']) )
    params = await Tweet.loadChildren(params);
    // Serialize (e.g. convert fields to payload-compatible object)
    params = await Tweet.serialize(params);
    // Perform mutation (e.g. upsert)
    const serialization = await Tweet.insert(params);
    params.uid = new Uid(serialization);
    // Deserialize (e.g. convert payload back to Models)
    params = Tweet.deserialize(params);
    return params;
  }

  /**
   * Preprocessor that parses text, Hashtags, and User.  Invokes .create methods for each to ensure children exist.
   * @param {Partial<Tweet>} params
   * @returns {Promise<Partial<Tweet>>}
   */
  static async loadChildren(
    params: Partial<Tweet> = {}
  ): Promise<Partial<Tweet>> {
    // Parse hashtags
    params = this.extractHashtags(params);
    // Create Hashtags
    const hashtags = params['tweet.hashtag'];
    if (hashtags && Array.isArray(hashtags) && hashtags.length > 0) {
      params['tweet.hashtag'] = (await Hashtag.createMany(
        hashtags
      )) as Hashtag[];
    }
    // Create User
    const user = params['tweet.user'];
    if (user && Object.keys(user).length > 0) {
      params['tweet.user'] = (await User.create(user)).response as User;
    }
    return params;
  }
}
