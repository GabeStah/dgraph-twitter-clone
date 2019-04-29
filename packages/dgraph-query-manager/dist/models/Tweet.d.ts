import { BaseModel, BaseModelInterface, Hashtag, Uid, User } from '../models';
export interface TweetInterface extends BaseModelInterface {
  'tweet.createdAt': Date | string;
  'tweet.hashtag'?: Hashtag[];
  'tweet.inReplyToStatusId'?: Uid;
  'tweet.inReplyToUserId'?: Uid;
  'tweet.isQuoteStatus': boolean;
  'tweet.quotedStatus'?: Tweet;
  'tweet.text': string;
  'tweet.user': User;
}
export declare enum FakerTweetTypes {
  COMPANY_BS = 0,
  COMPANY_CATCH_PHRASE = 1,
  HACKER = 2,
  WORDS = 3,
  LOREM = 4
}
export declare class Tweet extends BaseModel<Tweet> implements TweetInterface {
  /**
   * UTC time when this Tweet was created.
   * @type {Date}
   */
  'tweet.createdAt': Date;
  /**
   * Collection of hashtags included in this Tweet, if applicable.
   * @type {?Hashtag[]}
   */
  'tweet.hashtag'?: Hashtag[];
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
  'tweet.isQuoteStatus': boolean;
  /**
   * Quoted Tweet, if applicable.
   * @type {?Tweet}
   */
  'tweet.quotedStatus'?: Tweet;
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
  constructor(params?: Partial<Tweet>);
  /**
   * Deserialize Dgraph form of Tweet object.
   * @param {Partial<any | Tweet>} params
   * @returns {Promise<Partial<Tweet>>}
   */
  static deserialize<Tweet>(params?: Partial<Tweet | any>): Partial<Tweet>;
  /**
   * Parses Tweet text and extracts Hashtags.
   * @param {Partial<Tweet>} params
   * @returns {Partial<Tweet>}
   */
  static extractHashtags(params?: Partial<Tweet>): Partial<Tweet>;
  /**
   * Generates a Tweet instance for testing.
   * @param {number} seed
   * @param params
   * @param mention
   * @returns {Tweet}
   */
  static generate(
    seed?: number,
    params?: Partial<User>,
    mention?: User | User[]
  ): Tweet;
  /**
   * Generates a mockup Tweet object for testing.
   * @param {number} seed
   * @param params
   * @param mention
   * @returns {Partial<Tweet>}
   */
  static generateFakeParams(
    seed?: number,
    params?: Partial<User>,
    mention?: User | User[]
  ): Partial<Tweet>;
  /**
   * Generates random tweet text.
   * @param seed
   * @param mention
   */
  static generateRandomTweetText(
    seed?: number,
    mention?: User | User[]
  ): string;
  /**
   * Generates hashtags from passed text field or 'tweet.text' property, using twitter-text lib.
   * @param text
   */
  getHashtags(text: string): any;
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
  ): string;
  /**
   * Performs all steps of async Tweet creation.
   * @param {Partial<Tweet>} params
   * @returns {Promise<Partial<Tweet>>}
   */
  static load(params?: Partial<Tweet>): Promise<Partial<Tweet>>;
  /**
   * Performs all steps of async Tweet creation.
   * @param {Partial<Tweet>} params
   * @returns {Promise<Partial<Tweet>>}
   */
  load(params?: Partial<Tweet>): Promise<Partial<Tweet>>;
  /**
   * Preprocessor that parses text, Hashtags, and User.  Invokes .create methods for each to ensure children exist.
   * @param {Partial<Tweet>} params
   * @returns {Promise<Partial<Tweet>>}
   */
  static loadChildren(params?: Partial<Tweet>): Promise<Partial<Tweet>>;
}
