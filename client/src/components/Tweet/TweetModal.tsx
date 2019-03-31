import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { DgraphQueryExecutor, Queries } from 'dgraph-query-manager';
import { useDgraphLocal } from '../../hooks/dgraph';
import TweetCard from './TweetCard';

const TweetModal = ({ match }) => {
  const [isShowing, setIsShowing] = useState(true);
  const [uid, setUid] = useState(undefined);
  const passedUid = match.params.tweetUid;

  // Update when passed Uid differs from state.
  if (uid !== passedUid) {
    setIsShowing(true);
    setUid(passedUid);
  }

  const onHide = () => {
    setIsShowing(false);
  };

  const executor = new DgraphQueryExecutor(Queries.Tweet.find, {
    $id: uid
  });

  const [isLoading, response] = useDgraphLocal(
    executor,
    // Only render once.
    [uid]
  );

  let content = <></>;

  if (!isLoading) {
    content = (
      <Modal show={isShowing} onHide={onHide}>
        <Modal.Header closeButton />
        <Modal.Body>
          <TweetCard tweet={response} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return content;
};

export default TweetModal;
