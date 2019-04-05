import { Action, ActionType } from './Action';
import { State } from '../../state/';
import TweetCard from '../../components/Tweet/TweetList';
import React from 'react';

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
        // Sort in descending order.
        tweets: action.payload.sort(
          (a, b) =>
            +new Date(b['tweet.createdAt']) - +new Date(a['tweet.createdAt'])
        )
      };
    }

    default: {
      return state;
    }
  }
};
