'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const ParamType_1 = require('../ParamType');
const Query_1 = require('../Query');
const TypeOf_1 = require('../TypeOf');
// TODO: Build search to seek in following locations:
// See better faker options at: http://faker.hook.io/?property=
// tweet.text
// user.screenName
// user.description
// hashtag.hashtag
exports.SearchQueries = {
  search: new Query_1.Query(
    `query find($query: string) {
        a as var(func: anyoftext(tweet.text, $query)) 
        b as var(func: anyoftext(hashtag.hashtag, $query))
        
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
  searchHashtags: new Query_1.Query(
    `query find($query: string) {
        data(func: uid($query))
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
  searchTweetText: new Query_1.Query(
    `query find($query: string) {
    data(func: has(tweet.text)) @filter(anyoftext(tweet.text, $query))
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
  searchBy: new Query_1.Query(
    `query find($query: string) {
    data(func: has($has)) @filter($filterFunction($edge, $query))
    {
        uid
        expand(_all_) 
        {
          uid
          expand(_all_)
        }
    }
 }`,
    '/search/by/:edge/:has/:query',
    [
      new ParamType_1.ParamType('$has', TypeOf_1.TypeOf(String), true),
      new ParamType_1.ParamType(
        '$filterFunction',
        TypeOf_1.TypeOf(String),
        true
      ),
      new ParamType_1.ParamType('$edge', TypeOf_1.TypeOf(String), true),
      new ParamType_1.ParamType('$query', TypeOf_1.TypeOf(String))
    ]
  )
};

//# sourceMappingURL=SearchQueries.js.map
