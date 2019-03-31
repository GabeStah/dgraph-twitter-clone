// Components
import DashboardProfileCard from '../Dashboard/DashboardProfileCard';
import Search from '../Search/Search';
import TweetBox from '../Tweet/TweetBox';
import TweetList from '../Tweet/TweetList';
import NavigationBar from '../Navigation/NavigationBar';
// Layout
import { Col, Container, Row } from 'react-bootstrap';
// Libs
import React from 'react';
import { DgraphQueryExecutor, Queries } from 'dgraph-query-manager';
// Local
import { useDgraphGlobal } from '../../hooks/';
import { useStateContext } from '../../state';
import { Route, Switch } from 'react-router-dom';
import { Action, ActionTypes } from '../../reducers/';
import config from '../../config';
import TweetModal from '../Tweet/TweetModal';

const Main = () => {
  // STATE
  const [state, dispatch] = useStateContext();

  // Default auth user
  const executor = new DgraphQueryExecutor(Queries.User.findFromEmail, {
    $email: config.user.defaultAuthEmail
  });
  const [isLoading, response] = useDgraphGlobal(
    executor,
    new Action(ActionTypes.SET_AUTHENTICATED_USER),
    // Only render once.
    [config.user.defaultAuthEmail]
  );

  return (
    <Container>
      <Route path={'/status/:tweetUid'} component={TweetModal} />
      <NavigationBar />
      <Container className='AppContainer'>
        <Row>
          <Col sm={3}>
            <Switch>
              <Route path={'/'} exact component={DashboardProfileCard} />
              <Route path={'/search'} exact component={Search} />
              <Route path={'/:screenName'} component={DashboardProfileCard} />
            </Switch>
          </Col>
          <Col>
            <TweetBox />
            <Route
              path={['/', '/:screenName', '/search', '/status/:tweetUid']}
              component={TweetList}
            />
          </Col>
          <Col sm={3} />
        </Row>
      </Container>
    </Container>
  );
};

export default Main;
