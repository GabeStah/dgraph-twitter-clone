import { Query } from '../Query';
export declare const TweetQueries: {
  find: Query;
  getAll: Query;
  getAllForUser: Query;
  /**
   * Get all Tweets that reply to specified Tweet Uid.
   */
  getReplies: Query;
};
