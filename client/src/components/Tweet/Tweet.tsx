// Layout
import './Tweet.css';
import { Image } from 'react-bootstrap';
// Libs
import moment from 'moment';
import React from 'react';
import * as twitter from 'twitter-text';
import ReactHtmlParser from 'react-html-parser';
import * as _ from 'lodash';

const Tweet = props => {
  const tweet = props.tweet;
  const user = _.isArray(tweet['tweet.user'])
    ? _.first(tweet['tweet.user'])
    : tweet['tweet.user'];
  const name = user['user.name'];
  const screenName = user['user.screenName'];

  const tweetLinks = twitter.autoLink(tweet['tweet.text'], {
    hashtagUrlBase: '/search?q=%23',
    listUrlBase: '/',
    usernameUrlBase: '/'
  });

  return (
    <>
      <div className={'tweet-header'}>
        <ul>
          <li>
            <a href={`/${screenName}`} title={name}>
              <Image
                className={'avatar'}
                src={user && user['user.avatar'] ? user['user.avatar'] : ''}
              />
            </a>
          </li>
          <li>
            <span>
              <a href={`/${screenName}`}>
                <b>{name}</b>
              </a>
            </span>
          </li>
          <li>
            <a href={`/${screenName}`}>
              <span>@{screenName}</span>
            </a>
          </li>
          <li>
            <span className={'createdAt'}>
              {moment(tweet['tweet.createdAt']).fromNow()}
            </span>
          </li>
        </ul>
      </div>
      <div className={'tweet'}>
        <p>{ReactHtmlParser(tweetLinks)}</p>
      </div>
    </>
  );
};

export default Tweet;
