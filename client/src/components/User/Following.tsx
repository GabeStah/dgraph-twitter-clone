// Components
import UserGrid from './UserGrid';
// Helpers
import config from '../../config';
import { useStateContext } from '../../state';
// Hooks
import { Action, ActionType } from '../../reducers/base';
import { useDgraphGlobal } from '../../hooks/dgraph';
// Libs
import { DgraphQueryExecutor, Queries } from 'dgraph-query-manager';
import React from 'react';

const Following = ({ match }) => {
  const [{ user }] = useStateContext();
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
  const [isScreenNameLoading, responseScreenName] = useDgraphGlobal({
    executor: executorScreenName,
    action: new Action(ActionType.SET_USER),
    // Re-render if match changes.
    dependencies: [screenName],
    // Invalid if screenName doesn't exist.
    invalid: !screenName
  });
  const friends = user && user['user.friends'];

  return (
    <>
      <h1>Following</h1>
      <UserGrid users={friends} />
    </>
  );
};

export default Following;
