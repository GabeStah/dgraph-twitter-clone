// Components
import Tweet from './Tweet';
// Layout
import './TweetCard.css';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
// Libs
import React, { useEffect, useState } from 'react';
import { logger, numeral } from '../../helpers';
import {
  BaseModelDeletionMode,
  DgraphQueryExecutor,
  Queries,
  Uid,
  User
} from 'dgraph-query-manager';
import * as _ from 'lodash';
// Font
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRetweet } from '@fortawesome/free-solid-svg-icons';
import config from '../../config';
import { useStateContext } from '../../state';
import { Link } from 'react-router-dom';
import { Action, ActionType } from '../../reducers/base';

const TweetCard = ({ tweet }) => {
  const [{ authUser }, dispatch] = useStateContext();
  const [replies, setReplies]: [any, Function] = useState(undefined);
  const [, setIsLoading]: [boolean, Function] = useState(true);
  const [hasUserFavorited, setHasUserFavorited]: [boolean, Function] = useState(
    false
  );
  const [hasUserRetweeted, setHasUserRetweeted]: [boolean, Function] = useState(
    false
  );
  const [favoriteCount, setFavoriteCount]: [number, Function] = useState(0);
  const [retweetCount, setRetweetCount]: [number, Function] = useState(0);

  /**
   * Set replies.
   */
  useEffect(() => {
    if (!tweet) return;
    const params = {
      $id: tweet && tweet.uid ? tweet.uid.toString() : undefined
    };
    const executor = new DgraphQueryExecutor(Queries.Tweet.getReplies, params);
    executor
      .execute()
      .then(serialization => {
        setIsLoading(false);
        if (serialization.success) {
          // Set replies to Array
          if (Array.isArray(serialization.response)) {
            setReplies(serialization.response);
          } else {
            setReplies(new Array(serialization.response));
          }
        }
      })
      .catch(exception => {
        logger.error(exception);
        setIsLoading(false);
      });
  }, [authUser, tweet]);

  useEffect(() => {
    if (!authUser || !authUser.uid || !tweet) return;

    const favorites = tweet['~user.favorites'];
    const retweets = tweet['~user.retweets'];

    setHasUserFavorited(
      _.isArray(favorites)
        ? _.some(
            favorites,
            other => other && other.uid === authUser.uid.toString()
          )
        : !!_.isObject(favorites)
    );
    setHasUserRetweeted(
      _.isArray(retweets)
        ? _.some(
            retweets,
            other => other && other.uid === authUser.uid.toString()
          )
        : !!_.isObject(retweets)
    );
    setFavoriteCount(
      _.isArray(favorites) ? favorites.length : _.isObject(favorites) ? 1 : 0
    );
    setRetweetCount(
      _.isArray(retweets) ? retweets.length : _.isObject(retweets) ? 1 : 0
    );
  }, [authUser, tweet]);

  /**
   * Check if currently authed User has replied to Tweet.
   */
  const hasAuthUserReplied = (): boolean => {
    if (!authUser || !replies || !authUser.uid) {
      return false;
    }
    return replies.some(reply => {
      if (authUser.uid && reply) {
        const replyUser = _.first(reply['tweet.user']);
        return (
          replyUser &&
          replyUser.uid &&
          replyUser.uid.toString() === authUser.uid.toString()
        );
      }
    });
  };

  /**
   * Toggle boolean field of Tweet.
   * @param property
   * @param event
   * @param enabled
   */
  const toggleBooleanField = async (
    property: string,
    event: any,
    enabled: any
  ) => {
    event.preventDefault();
    if (!tweet || !tweet.uid || !authUser || !authUser.uid) return;

    // Toggle current value.
    enabled = !enabled;
    if (enabled) {
      await User.insert({
        uid: new Uid(authUser.uid).toString(),
        [property]: {
          uid: new Uid(tweet.uid).toString()
        }
      });
    } else {
      await User.delete(
        {
          uid: new Uid(authUser.uid).toString(),
          [property]: {
            uid: new Uid(tweet.uid).toString()
          }
        },
        BaseModelDeletionMode.Raw
      );
    }

    dispatch(
      new Action(ActionType.TOGGLE_TWEET_PROPERTY, {
        isEnabled: enabled,
        // Reverse predicate for Tweets
        property: `~${property}`,
        tweet,
        user: authUser
      })
    );
  };

  if (!tweet || !tweet.uid) return <></>;

  // Debug output Tweet Uid
  let debugElement;
  if (config.debug) {
    debugElement = <p>Uid: {tweet.uid.toString()}</p>;
  }

  return (
    <Card className='TweetCard'>
      <Card.Body>
        <Tweet tweet={tweet} />
        <ButtonGroup>
          <Button
            className={'reply'}
            variant={'link'}
            active={hasAuthUserReplied()}
          >
            <FontAwesomeIcon icon={['far', 'comment']} />{' '}
            {numeral(replies ? replies.length : 0).format('0a')}
          </Button>
          <Button
            className={'retweet'}
            variant={'link'}
            active={hasUserRetweeted}
            onClick={e =>
              toggleBooleanField('user.retweets', e, hasUserRetweeted)
            }
          >
            <FontAwesomeIcon icon={faRetweet} />{' '}
            {numeral(retweetCount).format('0a')}
          </Button>
          <Button
            className={'favorite'}
            variant={'link'}
            active={hasUserFavorited}
            onClick={e =>
              toggleBooleanField('user.favorites', e, hasUserFavorited)
            }
          >
            <FontAwesomeIcon icon={['far', 'heart']} />{' '}
            {numeral(favoriteCount).format('0a')}
          </Button>
          <Button className={'dm'} variant={'link'}>
            <FontAwesomeIcon icon={['far', 'envelope']} />
          </Button>
          <Link
            to={{
              pathname: `/${
                _.isArray(tweet['tweet.user'])
                  ? _.first(tweet['tweet.user'])['user.screenName']
                  : tweet['tweet.user']['user.screenName']
              }/status/${tweet.uid.toString()}`
            }}
          >
            <Button className={'details'} variant={'link'}>
              <FontAwesomeIcon icon={['far', 'arrow-alt-circle-right']} />{' '}
            </Button>
          </Link>
          {debugElement}
        </ButtonGroup>
      </Card.Body>
    </Card>
  );
};

export default TweetCard;
