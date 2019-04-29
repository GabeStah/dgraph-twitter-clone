export enum ActionType {
  SET_AUTHENTICATED_USER,
  SET_SEARCH_RESULTS,
  SET_USER,
  SET_TWEETS,
  UPDATE_TWEET,
  TOGGLE_TWEET_PROPERTY
}

export interface ActionInterface {
  payload: any | undefined;
  type: ActionType;
}

export class Action implements ActionInterface {
  payload: any | undefined;
  type: ActionType;

  constructor(type: ActionType, payload?: any) {
    this.type = type;
    this.payload = payload;
  }
}
