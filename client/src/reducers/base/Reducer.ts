import { Action, ActionTypes } from './Action';
import { State } from '../../state/';

export const Reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.SET_AUTHENTICATED_USER: {
      return {
        ...state,
        authUser: action.payload
      };
    }

    case ActionTypes.SET_SEARCH_RESULTS: {
      return {
        ...state,
        searchResults: action.payload
      };
    }

    case ActionTypes.SET_USER: {
      return {
        ...state,
        user: action.payload
      };
    }

    case ActionTypes.UPDATE_TWEET: {
      if (!state.tweets) return state;
      const index = state.tweets.findIndex(
        tweet => tweet.uid === action.payload.uid
      );
      const tempTweets = state.tweets;
      // Update passed Tweet.
      tempTweets[index] = action.payload;
      return {
        ...state,
        tweets: tempTweets
      };
    }

    case ActionTypes.SET_TWEETS: {
      return {
        ...state,
        tweets: action.payload
      };
    }

    default: {
      return state;
    }
  }
};
