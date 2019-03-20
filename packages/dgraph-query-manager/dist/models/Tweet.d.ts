import { BaseModel, BaseModelInterface, Hashtag, Uid, User } from '../models';
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
     * Indicates approximately how many times this Tweet has been liked by Twitter users.
     * @type {?number}
     */
    'tweet.favoriteCount': number;
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
    'tweet.retweetCount': number;
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
     * @returns {Tweet}
     */
    static generate(seed?: number): Tweet;
    /**
     * Generates a mockup Tweet object for testing.
     * @param {number} seed
     * @returns {Partial<Tweet>}
     */
    static generateFakeParams(seed?: number): Partial<Tweet>;
    /**
     * Generates hashtags from passed text field or 'tweet.text' property, using twitter-text lib.
     * @param text
     */
    getHashtags(text: string): any;
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
