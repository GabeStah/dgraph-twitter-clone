import { ParamType } from '../ParamType';
import { Query } from '../Query';
import { TypeOf } from '../TypeOf';

export const TweetQueries = {
    find: new Query(`query find($id: string) {
        data(func: uid($id)) {
            uid
            expand(_all_) {
                uid
                expand(_all_) 
            }
        }
     }`,
        '/tweet/:id',
        [
        new ParamType('$id', TypeOf(String))
    ]),

    getAll: new Query(`query {
        data(func: has (tweet.text)) {
            uid
            expand(_all_) {
                uid
                expand(_all_)
            }
        }
     }`,
        '/tweets'),

    getAllForUser: new Query(`query find($id: string) {
        data(func: uid($id)) {
            tweets: ~tweet.user (orderdesc: tweet.createdAt) {
                uid
                expand(_all_) {
                    uid
                }
            }
        }
     }`,
        '/tweets/user/:id',
        [
        new ParamType('$id', TypeOf(String))
    ], 'data.tweets'),
};