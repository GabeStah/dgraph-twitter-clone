export enum ActionTypes {
  SET_AUTHENTICATED_USER,
  SET_SEARCH_RESULTS,
  SET_USER,
  SET_TWEETS,
  UPDATE_TWEET
}

export interface ActionInterface {
  payload: any | undefined;
  type: ActionTypes;
}

export class Action implements ActionInterface {
  payload: any | undefined;
  type: ActionTypes;

  constructor(type: ActionTypes, payload?: any) {
    this.type = type;
    this.payload = payload;
  }
}
