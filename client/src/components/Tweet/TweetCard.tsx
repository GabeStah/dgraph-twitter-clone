// Components
import Tweet from './Tweet';
// Layout
import './TweetCard.css';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
// Libs
import React, { useEffect, useState } from 'react';
import { logger, numeral } from '../../helpers';
import {
  DgraphQueryExecutor,
  Queries,
  Tweet as TweetModel
} from 'dgraph-query-manager';
// Font
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRetweet } from '@fortawesome/free-solid-svg-icons';
import config from '../../config';
import { useStateContext } from '../../state';
import { Link } from 'react-router-dom';
import { Action, ActionTypes } from '../../reducers/';

const TweetCard = props => {
  const tweet = props.tweet;
  if (!tweet || !tweet.uid) return <></>;
  const [{ user }, dispatch] = useStateContext();
  const [replies, setReplies]: [any, Function] = useState(undefined);
  const [, setIsLoading]: [boolean, Function] = useState(true);

  /**
   * Set replies to passed props.tweet.
   */
  useEffect(() => {
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
  }, [tweet]);

  // Debug output Tweet Uid
  let debugElement;
  if (config.debug) {
    debugElement = <p>Uid: {tweet.uid.toString()}</p>;
  }

  /**
   * Check if current User has replied to Tweet.
   */
  const hasUserReplied = () => {
    if (!user || !replies || !user.uid) return false;
    return replies.some(reply => {
      if (user.uid && reply) {
        return (
          reply['tweet.user'] &&
          reply['tweet.user'].uid &&
          reply['tweet.user'].uid.toString() === user.uid.toString()
        );
      }
    });
  };

  /**
   * Toggle boolean field of Tweet.
   * @param field
   * @param event
   */
  const toggleBooleanField = async (field, event) => {
    event.preventDefault();
    if (!tweet || !tweet.uid) return;

    const partial: Partial<TweetModel> = {};
    // Toggle current value.
    partial[field] = !tweet[field];
    // Update counter field.
    if (field === 'tweet.favorited') {
      partial['tweet.favoriteCount'] = partial[field]
        ? tweet['tweet.favoriteCount'] + 1
        : tweet['tweet.favoriteCount'] - 1;
    } else if (field === 'tweet.retweeted') {
      partial['tweet.retweetCount'] = partial[field]
        ? tweet['tweet.retweetCount'] + 1
        : tweet['tweet.retweetCount'] - 1;
    }
    const serialization = await TweetModel.upsert(tweet, partial);
    // Tweet created
    if (serialization.success) {
      // Dispatch state update to other components.
      dispatch(new Action(ActionTypes.UPDATE_TWEET, serialization.response));
    }
  };

  // TODO: Add reply popup modal
  // see:https://react-bootstrap.github.io/components/modal/

  return (
    <Card className='TweetCard'>
      <Card.Body>
        <Tweet tweet={tweet} />
        <ButtonGroup>
          <Button
            className={'reply'}
            variant={'link'}
            active={hasUserReplied()}
          >
            <FontAwesomeIcon icon={['far', 'comment']} />{' '}
            {numeral(replies ? replies.length : 0).format('0a')}
          </Button>
          <Button
            className={'retweet'}
            variant={'link'}
            active={tweet['tweet.retweeted']}
            onClick={e => toggleBooleanField('tweet.retweeted', e)}
          >
            <FontAwesomeIcon icon={faRetweet} />{' '}
            {numeral(tweet['tweet.retweetCount']).format('0a')}
          </Button>
          <Button
            className={'favorite'}
            variant={'link'}
            active={tweet['tweet.favorited']}
            onClick={e => toggleBooleanField('tweet.favorited', e)}
          >
            <FontAwesomeIcon icon={['far', 'heart']} />{' '}
            {numeral(tweet['tweet.favoriteCount']).format('0a')}
          </Button>
          <Button className={'dm'} variant={'link'}>
            <FontAwesomeIcon icon={['far', 'envelope']} />
          </Button>
          <Link to={`/status/${tweet.uid.toString()}`}>
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
