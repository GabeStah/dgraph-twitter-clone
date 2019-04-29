import { Action, ActionType } from './Action';
import { State } from '../../state/';
import { BaseModelDeletionMode, Uid, User } from 'dgraph-query-manager';
import * as _ from 'lodash';

export const Reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.SET_AUTHENTICATED_USER: {
      return {
        ...state,
        authUser: action.payload
      };
    }

    case ActionType.SET_SEARCH_RESULTS: {
      return {
        ...state,
        searchResults: action.payload
      };
    }

    case ActionType.SET_USER: {
      return {
        ...state,
        user: action.payload
      };
    }

    case ActionType.UPDATE_TWEET: {
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

    case ActionType.SET_TWEETS: {
      return {
        ...state,
        // If array, sort in descending order.
        tweets: Array.isArray(action.payload)
          ? action.payload.sort(
              (a, b) =>
                +new Date(b['tweet.createdAt']) -
                +new Date(a['tweet.createdAt'])
            )
          : [action.payload]
      };
    }

    case ActionType.TOGGLE_TWEET_PROPERTY: {
      const isEnabled = action.payload.isEnabled;
      const property = action.payload.property;
      const tweet = action.payload.tweet;
      const user = action.payload.user;

      const clone = _.clone(tweet);

      if (!_.has(clone, property)) {
        clone[property] = [];
      } else if (!_.isArray(clone[property])) {
        clone[property] = [clone[property]];
      }
      if (isEnabled) {
        clone[property].push(user);
      } else {
        clone[property] = _.reject(
          clone[property],
          other =>
            new Uid(other.uid).toString() === new Uid(user.uid).toString()
        );
      }

      return {
        ...state,
        tweets: _.map(state.tweets, original => {
          return original.uid.toString() === tweet.uid.toString()
            ? clone
            : original;
        })
      };
    }

    default: {
      return state;
    }
  }
};
