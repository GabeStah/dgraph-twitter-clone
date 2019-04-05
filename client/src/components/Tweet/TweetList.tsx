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
    content = tweets.map(tweet => <TweetCard key={tweet.uid} tweet={tweet} />);
  } else if (tweets && !Array.isArray(tweets)) {
    content = <TweetCard key={tweets.uid} tweet={tweets} />;
  } else {
    content = <h3>No Tweets found.</h3>;
  }

  return content;
};

export default TweetList;
