import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { DgraphQueryExecutor, Queries } from 'dgraph-query-manager';
import TweetCard from './TweetCard';
import { useStateContext } from '../../state';
import * as _ from 'lodash';
import { logger } from '../../helpers/logger';

const TweetModal = ({ match }) => {
  const [{ tweets }] = useStateContext();
  const [isShowing, setIsShowing] = useState(true);
  const [uid, setUid] = useState(undefined);
  const [tweet, setTweet] = useState(undefined);
  const passedUid = match.params.tweetUid;

  // Update when passed Uid differs from state.
  if (uid !== passedUid) {
    setIsShowing(true);
    setUid(passedUid);
  }

  const onHide = () => {
    setIsShowing(false);
  };

  useEffect(() => {
    // Attempt to retrieve Tweet from local state collection.
    setTweet(_.find(tweets, obj => obj.uid.toString() === uid));
    const executor = new DgraphQueryExecutor(Queries.Tweet.find, {
      $id: uid
    });
    // If Tweet not in state, retrieve from database.
    if (!tweet) {
      executor
        .execute()
        .then(serialization => {
          if (serialization.success) {
            setTweet(serialization.response);
          }
        })
        .catch(exception => {
          logger.error(exception);
        });
    }
  }, [tweet, tweets, uid]);

  return (
    <Modal show={isShowing} onHide={onHide}>
      <Modal.Header closeButton />
      <Modal.Body>
        <TweetCard tweet={tweet} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TweetModal;
