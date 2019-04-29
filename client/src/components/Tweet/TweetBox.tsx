// Components
import { Button, Form } from 'react-bootstrap';
// Local
import { useStateContext } from '../../state';
// Libs
import React, { useState } from 'react';
import { Tweet } from 'dgraph-query-manager';
import { Action, ActionType } from '../../reducers/';

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

  const handleSubmit = async event => {
    event.preventDefault();
    // Checks for valid authUser and valid currentTweet text.
    if (
      !authUser ||
      !authUser.uid ||
      !currentTweet ||
      currentTweet['tweet.text'].length === 0
    ) {
      return;
    }

    const serialization = await Tweet.upsert({
      'tweet.text': currentTweet['tweet.text'],
      'tweet.user': authUser
    });

    // Tweet created
    if (serialization.success) {
      setCurrentTweet(initialFormState);
      // Only update tweet list if authUser equals viewed user.
      if (user && user.uid.toString() === authUser.uid.toString()) {
        dispatch(
          new Action(ActionType.SET_TWEETS, [...tweets, serialization.response])
        );
      }
    }
  };

  return (
    <Form className={'TweetBox'} onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Control
          id={'tweet.text'}
          as={'textarea'}
          type={'textarea'}
          value={currentTweet['tweet.text']}
          placeholder={"What's happening?"}
          onKeyDown={async event => {
            // On enter
            if (event.keyCode === 13) await handleSubmit(event);
          }}
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
