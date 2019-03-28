import { ParamType } from '../ParamType';
import { Query } from '../Query';
import { TypeOf } from '../TypeOf';

// TODO: Build search to seek in following locations:
// See better faker options at: http://faker.hook.io/?property=
// tweet.text
// user.screenName
// user.description
// hashtag.hashtag

export const SearchQueries = {
  search: new Query(
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
    [new ParamType('$query', TypeOf(String))]
  ),

  searchHashtags: new Query(
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
    '/search/:query',
    [new ParamType('$query', TypeOf(String))]
  ),

  searchTweetText: new Query(
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
    '/search/:query',
    [new ParamType('$query', TypeOf(String))]
  ),

  searchBy: new Query(
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
      new ParamType('$has', TypeOf(String), true),
      new ParamType('$filterFunction', TypeOf(String), true),
      new ParamType('$edge', TypeOf(String), true),
      new ParamType('$query', TypeOf(String))
    ]
  )
};
