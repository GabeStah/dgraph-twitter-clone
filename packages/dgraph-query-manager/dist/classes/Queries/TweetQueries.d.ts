import { Query } from '../Query';
export declare const TweetQueries: {
  /**
   * Find a Tweet by Uid.
   */
  find: Query;
  /**
   * Get all Tweets.
   */
  getAll: Query;
  /**
   * Get first N Tweets.
   */
  getAllPaginated: Query;
  /**
   * Get all Tweets created by User.
   */
  getAllForUser: Query;
  /**
   * Get all Tweets that reply to specified Tweet Uid.
   */
  getReplies: Query;
};
