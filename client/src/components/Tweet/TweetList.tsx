// Components
import TweetCard from './TweetCard';
// Helpers
// Hooks
// Libs
import React from 'react';
import { useStateContext } from '../../state';

const TweetList = () => {
  const [{ tweets }] = useStateContext();
  let content;

  if (tweets && Array.isArray(tweets) && tweets.length > 0) {
    // Sort Tweets by createdAt date, descending.
    // tslint:disable-next-line:prefer-object-spread
    content = tweets
      .sort(
        (a, b) =>
          +new Date(b['tweet.createdAt']) - +new Date(a['tweet.createdAt'])
      )
      .map((tweet: any) => <TweetCard key={tweet.uid} tweet={tweet} />);
  } else if (tweets && !Array.isArray(tweets)) {
    content = <TweetCard key={tweets.uid} tweet={tweets} />;
  } else {
    content = <h3>No Tweets found.</h3>;
  }

  return content;
};

export default TweetList;
