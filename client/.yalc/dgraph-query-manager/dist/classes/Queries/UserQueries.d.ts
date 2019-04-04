import { Query } from '../Query';
export declare const UserQueries: {
  /**
   * Find a User by Uid.
   */
  find: Query;
  /**
   * Find a User by Email.
   */
  findFromEmail: Query;
  /**
   * Find a User by ScreenName.
   */
  findFromScreenName: Query;
  /**
   * Get all Users.
   */
  getAll: Query;
  /**
   * Get all Users with child nodes.
   */
  getAllWithChildren: Query;
};
