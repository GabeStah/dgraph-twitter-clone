import { ParamType } from '../ParamType';
import { Query } from '../Query';
import { TypeOf } from '../TypeOf';

export const UserQueries = {
  /**
   * Find a User by Uid.
   */
  find: new Query(
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
    [new ParamType('$id', TypeOf(String))]
  ),

  /**
   * Find a User by Email.
   */
  findFromEmail: new Query(
    `query find($email: string) {
      data(func: eq(user.email, $email))
      {
        uid
        expand(_all_) {
          uid
          expand(_all_)
        }
      }
    }`,
    '/user/from/email/:email',
    [new ParamType('$email', TypeOf(String))]
  ),

  /**
   * Find a User by ScreenName.
   */
  findFromScreenName: new Query(
    `query find($screenName: string) {
      data(func: eq(user.screenName, $screenName))
      {
        uid
        expand(_all_) {
          uid
          expand(_all_)
        }
      }
    }`,
    '/user/from/screenName/:screenName',
    [new ParamType('$screenName', TypeOf(String))]
  ),

  /**
   * Get all Users.
   */
  getAll: new Query(
    `query {
      data(func: has (user.email)) {
        uid
        expand(_all_)
      }
    }`,
    '/users'
  ),

  /**
   * Get all Users with child nodes.
   */
  getAllWithChildren: new Query(
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
