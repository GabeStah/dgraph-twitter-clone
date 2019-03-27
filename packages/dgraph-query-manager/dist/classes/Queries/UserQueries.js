'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const ParamType_1 = require('../ParamType');
const Query_1 = require('../Query');
const TypeOf_1 = require('../TypeOf');
exports.UserQueries = {
  find: new Query_1.Query(
    `query find($id: string) {
        data(func: uid($id))
        {
            uid
            expand(_all_) {
                uid
                expand(_all_) 
            }
        }
     }`,
    '/user/:id',
    [new ParamType_1.ParamType('$id', TypeOf_1.TypeOf(String))]
  ),
  findFromEmail: new Query_1.Query(
    `query find($email: string) {
        data(func: eq(user.email, $email))
        {
            uid
            expand(_all_)
        }
     }`,
    '/user/from/email/:email',
    [new ParamType_1.ParamType('$email', TypeOf_1.TypeOf(String))]
  ),
  findFromScreenName: new Query_1.Query(
    `query find($screenName: string) {
        data(func: eq(user.screenName, $screenName))
        {
            uid
            expand(_all_)
        }
     }`,
    '/user/from/screenName/:screenName',
    [new ParamType_1.ParamType('$screenName', TypeOf_1.TypeOf(String))]
  ),
  getAll: new Query_1.Query(
    `query {
        data(func: has (user.email)) {
            uid
            expand(_all_)
        }
     }`,
    '/users'
  ),
  getAllWithChildren: new Query_1.Query(
    `query {
        data(func: has (user.email)) {
            uid
            expand(_all_) {
                uid
                expand(_all_)
            }
        }
     }`,
    '/users'
  )
};

//# sourceMappingURL=UserQueries.js.map
