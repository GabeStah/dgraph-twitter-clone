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
  )
};
