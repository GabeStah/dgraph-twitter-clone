import { Query } from '../Query';
export declare const SearchQueries: {
  /**
   * Primary search for text within 'tweet.text' and 'hashtag.hashtag' predicates.
   */
  search: Query;
  /**
   * Get all Hashtags containing text.
   */
  searchHashtags: Query;
  /**
   * Get all Tweets containing text.
   */
  searchTweetText: Query;
  /**
   * Dynamic search based on passed function, predicate, and query.
   */
  searchBy: Query;
};
