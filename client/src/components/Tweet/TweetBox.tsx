// Components
import { Button, Form } from 'react-bootstrap';
// Local
import { useStateContext } from '../../state';
// Libs
import React, { useState } from 'react';
import { DgraphQueryExecutor, Queries, Tweet } from 'dgraph-query-manager';
import { Action, ActionTypes } from '../../reducers/';
import { useDgraphGlobal } from '../../hooks/dgraph';

const TweetBox = () => {
  const [{ authUser, user, tweets }, dispatch] = useStateContext();

  const initialFormState = {
    'tweet.text': '',
    'tweet.user': authUser
  };
  const [currentTweet, setCurrentTweet] = useState(initialFormState);

  const handleInputChange = event => {
    // Destructure textbox `id` and `value` fields.
    const { id, value } = event.target;
    // Update currentTweet params
    setCurrentTweet({ ...currentTweet, [id]: value });
  };

  return (
    <Form
      className={'TweetBox'}
      onSubmit={async event => {
        event.preventDefault();
        if (
          !authUser ||
          !authUser.uid ||
          !currentTweet ||
          currentTweet['tweet.text'].length === 0
        ) {
          return;
        }

        const params = {
          'tweet.text': currentTweet['tweet.text'],
          'tweet.user': authUser
        };

        const serialization = await Tweet.upsert(params as Partial<Tweet>);

        // Tweet created
        if (serialization.success) {
          setCurrentTweet(initialFormState);
          // Only update tweet list if authUser equals viewed user.
          if (user && user.uid.toString() === authUser.uid.toString()) {
            dispatch(
              new Action(ActionTypes.SET_TWEETS, [
                ...tweets,
                serialization.response
              ])
            );
          }
        }
      }}
    >
      <Form.Group>
        <Form.Control
          id={'tweet.text'}
          as={'textarea'}
          type={'textarea'}
          value={currentTweet['tweet.text']}
          placeholder={"What's happening?"}
          onChange={handleInputChange}
        />
        <Button variant={'primary'} type={'submit'}>
          Tweet
        </Button>
      </Form.Group>
    </Form>
  );
};

export default TweetBox;
