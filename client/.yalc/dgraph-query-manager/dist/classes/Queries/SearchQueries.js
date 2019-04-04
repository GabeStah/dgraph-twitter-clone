'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const ParamType_1 = require('../ParamType');
const Query_1 = require('../Query');
const TypeOf_1 = require('../TypeOf');
exports.SearchQueries = {
  /**
   * Primary search for text within 'tweet.text' and 'hashtag.hashtag' predicates.
   */
  search: new Query_1.Query(
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
    [new ParamType_1.ParamType('$query', TypeOf_1.TypeOf(String))]
  ),
  /**
   * Get all Hashtags containing text.
   */
  searchHashtags: new Query_1.Query(
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
    [new ParamType_1.ParamType('$query', TypeOf_1.TypeOf(String))]
  ),
  /**
   * Get all Tweets containing text.
   */
  searchTweetText: new Query_1.Query(
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
    [new ParamType_1.ParamType('$query', TypeOf_1.TypeOf(String))]
  ),
  /**
   * Dynamic search based on passed function, predicate, and query.
   */
  searchBy: new Query_1.Query(
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
      new ParamType_1.ParamType('$function', TypeOf_1.TypeOf(String), true),
      new ParamType_1.ParamType('$predicate', TypeOf_1.TypeOf(String), true),
      new ParamType_1.ParamType('$query', TypeOf_1.TypeOf(String))
    ]
  )
};

//# sourceMappingURL=SearchQueries.js.map
