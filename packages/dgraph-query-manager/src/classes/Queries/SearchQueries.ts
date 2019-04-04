import { ParamType } from '../ParamType';
import { Query } from '../Query';
import { TypeOf } from '../TypeOf';

export const SearchQueries = {
  /**
   * Primary search for text within 'tweet.text' and 'hashtag.hashtag' predicates.
   */
  search: new Query(
    `query find($query: string) {
        a as var(func: anyoftext(tweet.text, $query)) 
        var(func: anyoftext(hashtag.hashtag, $query)) {
          b as hashtags: ~tweet.hashtag
        }
        
        data(func: has(tweet.text)) @filter(uid(a) OR uid(b)) {
          uid
          expand(_all_) {
            uid
            expand(_all_)
          }
        }
     }`,
    '/search/:query',
    [new ParamType('$query', TypeOf(String))]
  ),

  /**
   * Get all Hashtags containing text.
   */
  searchHashtags: new Query(
    `query find($query: string) {
        data(func: anyoftext(hashtag.hashtag, $query))
        {
            uid
            expand(_all_) {
                uid
                expand(_all_) 
            }
        }
     }`,
    '/search/hashtag/:query',
    [new ParamType('$query', TypeOf(String))]
  ),

  /**
   * Get all Tweets containing text.
   */
  searchTweetText: new Query(
    `query find($query: string) {
        data(func: anyoftext(tweet.text, $query))
        {
            uid
            expand(_all_) 
            {
              uid
              expand(_all_)
            }
        }
     }`,
    '/search/tweet/:query',
    [new ParamType('$query', TypeOf(String))]
  ),

  /**
   * Dynamic search based on passed function, predicate, and query.
   */
  searchBy: new Query(
    `query find($query: string) {
        data(func: $function($predicate, $query))
        {
            uid
            expand(_all_) 
            {
              uid
              expand(_all_)
            }
        }
     }`,
    '/search/by/:function/:predicate/:query',
    [
      new ParamType('$function', TypeOf(String), true),
      new ParamType('$predicate', TypeOf(String), true),
      new ParamType('$query', TypeOf(String))
    ]
  )
};
