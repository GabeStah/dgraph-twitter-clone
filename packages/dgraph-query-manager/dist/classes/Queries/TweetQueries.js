"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParamType_1 = require("../ParamType");
const Query_1 = require("../Query");
const TypeOf_1 = require("../TypeOf");
exports.TweetQueries = {
    find: new Query_1.Query(`query find($id: string) {
      data(func: uid($id)) {
        uid
        expand(_all_) {
          uid
          expand(_all_) 
        }
      }
     }`, '/tweet/:id', [new ParamType_1.ParamType('$id', TypeOf_1.TypeOf(String))]),
    getAll: new Query_1.Query(`query {
      data(func: has (tweet.text)) {
        uid
        expand(_all_) {
          uid
          expand(_all_)
        }
      }
     }`, '/tweets'),
    getAllForUser: new Query_1.Query(`query find($id: string) {
      data(func: uid($id)) {
        tweets: ~tweet.user (orderdesc: tweet.createdAt) {
          uid
          expand(_all_) {
            uid
            expand(_all_)
          }
        }
      }
     }`, '/tweets/user/:id', [new ParamType_1.ParamType('$id', TypeOf_1.TypeOf(String))], 'data.tweets'),
    /**
     * Get all Tweets that reply to specified Tweet Uid.
     */
    getReplies: new Query_1.Query(`query find($id: string) {
      data(func: has(tweet.text)) {
        tweets: @filter(uid_in(tweet.inReplyToStatusId, $id)) {
          uid
          expand(_all_) {
            uid
            expand(_all_)
          }
        }
      }
    }`, `/tweet/:id/replies`, [new ParamType_1.ParamType('$id', TypeOf_1.TypeOf(String))], 'data.tweets')
};

//# sourceMappingURL=TweetQueries.js.map
