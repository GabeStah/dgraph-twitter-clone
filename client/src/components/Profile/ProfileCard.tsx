// Components
import ProfileCardStats from './ProfileCardStats';
// Helpers
// Hooks
// Layout
import { Card, Image } from 'react-bootstrap';
// Libs
import { DgraphQueryExecutor, Queries } from 'dgraph-query-manager';
import React from 'react';
// Local
import { useStateContext } from '../../state';
import { useDgraphGlobal } from '../../hooks/';
import { Action, ActionType } from '../../reducers/';
import config from '../../config';

const ProfileCard = ({ match }) => {
  const screenName =
    match && match.params && match.params.screenName
      ? match.params.screenName
      : config.user.defaultAuthScreenName;

  const executorScreenName = new DgraphQueryExecutor(
    Queries.User.findFromScreenName,
    {
      $screenName: screenName
    }
  );
  const [isScreenNameLoading, responseScreenName] = useDgraphGlobal(
    executorScreenName,
    new Action(ActionType.SET_USER),
    // Re-render if match changes.
    [screenName],
    // Invalid if screenName doesn't exist.
    !screenName
  );

  const [{ user }] = useStateContext();

  const executorTweets = new DgraphQueryExecutor(Queries.Tweet.getAllForUser, {
    $id: user && user.uid ? user.uid.toString() : undefined
  });
  const [isLoading, response] = useDgraphGlobal(
    executorTweets,
    new Action(ActionType.SET_TWEETS),
    // Re-render if user changes.
    [user],
    // Invalid if user doesn't exist.
    !user
  );

  let content = <h3>Loading Profile</h3>;

  if (user) {
    const name = user['user.name'];
    const screenName = user['user.screenName'];
    content = (
      <Card className='ProfileCard'>
        <a className='ProfileCard-bg' href={`/${screenName}`} />
        <Card.Body>
          <a href={`/${screenName}`} title={name}>
            <Image
              src={
                user['user.avatar']
                  ? user['user.avatar']
                  : 'https://www.gravatar.com/avatar/00000000000000000000000000000000'
              }
            />
          </a>

          <div>
            <div>
              <a href={`/${screenName}`}>{name}</a>
            </div>
            <span>
              <a href={`/${screenName}`}>
                <span>
                  @<b>{screenName}</b>
                </span>
              </a>
            </span>
          </div>

          <ProfileCardStats />
        </Card.Body>
      </Card>
    );
  } else {
    content = (
      <>
        <h3>No User Profile found.</h3>
      </>
    );
  }

  return content;
};

export default ProfileCard;
