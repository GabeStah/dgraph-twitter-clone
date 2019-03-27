// Lib
import * as faker from 'faker';
import * as twitter from 'twitter-text';
// Local
import config from '../config';
import { BaseModel, BaseModelInterface, Hashtag, Uid, User } from '../models';
import { getRandomEnumElement, weightedBoolean } from '../helpers/utility';
import logger from '../logger';

export interface TweetInterface extends BaseModelInterface {
  'tweet.createdAt': Date | string;
  'tweet.favoriteCount'?: number;
  'tweet.favorited': boolean;
  'tweet.hashtag'?: Hashtag[];
  'tweet.inReplyToStatusId'?: Uid;
  'tweet.inReplyToUserId'?: Uid;
  'tweet.isQuoteStatus': boolean;
  'tweet.quotedStatus'?: Tweet;
  'tweet.retweetCount'?: number;
  'tweet.retweeted': boolean;
  'tweet.text': string;
  'tweet.user': User;
}

export enum FakerTweetTypes {
  COMPANY_BS,
  COMPANY_CATCH_PHRASE,
  HACKER,
  WORDS,
  LOREM
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
  'tweet.favorited' = false;

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
  'tweet.isQuoteStatus' = false;

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
  'tweet.retweeted' = false;

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

    params = super.deserialize(params);
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
   * @param params
   * @param mention
   * @returns {Tweet}
   */
  static generate(
    seed: number = config.faker.seed,
    params?: Partial<User>,
    mention?: User | User[]
  ): Tweet {
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
    seed: number = config.faker.seed,
    params?: Partial<User>,
    mention?: User | User[]
  ): Partial<Tweet> {
    // Set seed base.
    faker.seed(seed);
    const max = 500;
    return {
      'tweet.favoriteCount': faker.random.number(max),
      'tweet.favorited': faker.random.boolean(),
      // 'tweet.hashtag'?: [Hashtag];
      // 'tweet.inReplyToStatusId': new Uid(123),
      // 'tweet.inReplyToUserId': new Uid(456),
      'tweet.isQuoteStatus': faker.random.boolean(),
      // 'tweet.quotedStatus'?: Tweet,
      'tweet.retweetCount': faker.random.number(max),
      'tweet.retweeted': faker.random.boolean(),
      'tweet.text': this.generateRandomTweetText(seed, mention),
      // 'tweet.user':               new User({
      //     uid: new Uid(678)
      // }),
      'tweet.user': User.generate(),
      ...params
    };
  }

  /**
   * Generates random tweet text.
   * @param seed
   * @param mention
   */
  static generateRandomTweetText(
    seed: number = config.faker.seed,
    mention?: User | User[]
  ): string {
    const type: FakerTweetTypes = getRandomEnumElement(FakerTweetTypes);
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
  getHashtags(text: string) {
    return twitter.extractHashtagsWithIndices(text ? text : this['tweet.text']);
  }

  /**
   * Generates a random string suitable for a Tweet text field.
   * @param word
   * @param hashtag
   * @param mention
   */
  static getValidTweetString(
    word: string | string[],
    hashtag?: number | string | string[],
    mention?: User | User[]
  ): string {
    const result: string[] = [];

    if (mention) {
      if (mention instanceof Array && mention.length > 0) {
        result.push(
          mention.map(user => `@${user['user.screenName']}`).join(' ')
        );
      } else if (mention instanceof User) {
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
        const tempTags: string[] = [];
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
    // Only create Hashtags if no Hashtags exist
    if (!params['tweet.hashtag'] || params['tweet.hashtag'].length === 0) {
      // Parse hashtags
      params = this.extractHashtags(params);
      // Create Hashtags
      const hashtags = params['tweet.hashtag'];
      if (hashtags && Array.isArray(hashtags) && hashtags.length > 0) {
        params['tweet.hashtag'] = (await Hashtag.createMany(
          hashtags
        )) as Hashtag[];
      }
    }
    // Create User
    const user = params['tweet.user'];
    if (user && Object.keys(user).length > 0) {
      params['tweet.user'] = (await User.create(user)).response as User;
    }
    return params;
  }
}
