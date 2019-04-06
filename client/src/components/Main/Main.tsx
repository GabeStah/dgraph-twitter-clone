// Components
import ProfileCard from '../Profile/ProfileCard';
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
import { Route, Switch } from 'react-router-dom';
import { Action, ActionType } from '../../reducers/';
import config from '../../config';
import TweetModal from '../Tweet/TweetModal';

const Main = () => {
  // Default auth user
  const executor = new DgraphQueryExecutor(Queries.User.findFromEmail, {
    $email: config.user.defaultAuthEmail
  });
  const [isLoading, response] = useDgraphGlobal({
    executor,
    action: new Action(ActionType.SET_AUTHENTICATED_USER),
    dependencies: [config.user.defaultAuthEmail]
  });

  return (
    <Container>
      <Route path={'/status/:tweetUid'} component={TweetModal} />
      <NavigationBar />
      <Container className='AppContainer'>
        <Row>
          <Col sm={3}>
            <Switch>
              <Route path={'/'} exact component={ProfileCard} />
              <Route path={'/search'} exact component={Search} />
              <Route path={'/:screenName'} component={ProfileCard} />
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
