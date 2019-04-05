import { Tweet, User } from 'dgraph-query-manager';

export const InitialState: any = {
  authUser: undefined,
  searchResults: undefined,
  user: undefined,
  tweets: []
};

export interface StateInterface {
  authUser: User | undefined;
  searchResults: any;
  user: User | undefined;
  tweets: Tweet[];
}

export class State implements StateInterface {
  authUser: User | undefined;
  searchResults: undefined;
  user: User | undefined;
  tweets: Tweet[];
}
