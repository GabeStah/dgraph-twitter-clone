import { Tweet, User } from 'dgraph-query-manager';

export interface StateInterface {
  authUser: User | undefined;
  searchResults: any;
  user: User | undefined;
  tweets: Tweet[];
}

export interface StateType {
  authUser: User | undefined;
  searchResults: any;
  user: User | undefined;
  tweets: Tweet[];
}

export const InitialState: any = {
  authUser: undefined,
  searchResults: undefined,
  user: undefined,
  tweets: []
};

export class State implements StateInterface {
  authUser: User | undefined;
  searchResults: undefined;
  user: User | undefined;
  tweets: Tweet[];
}
