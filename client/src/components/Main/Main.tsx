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
import Following from '../User/Following';
import Followers from '../User/Followers';

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
      <Route path={'/:screenName/status/:tweetUid'} component={TweetModal} />
      <NavigationBar />
      <Container className='AppContainer'>
        <Row>
          <Col sm={4}>
            <Switch>
              <Route path={'/'} exact component={ProfileCard} />
              <Route path={'/search'} exact component={Search} />
              <Route path={'/:screenName'} component={ProfileCard} />
            </Switch>
          </Col>
          <Col>
            <TweetBox />
            <Switch>
              <Route path={'/:screenName/followers'} component={Followers} />
              <Route path={'/:screenName/following'} component={Following} />
              <Route
                path={[
                  '/',
                  '/:screenName',
                  '/search',
                  '/:screenName/status/:tweetUid'
                ]}
                component={TweetList}
              />
            </Switch>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default Main;
