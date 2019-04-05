// Components
// Hooks
// Layout
import { Col, Row } from 'react-bootstrap';
// Libs
import React from 'react';
import { useStateContext } from '../../state';

const ProfileCardStats = () => {
  const [{ user, tweets }] = useStateContext();

  let content = <h3>Loading Stats</h3>;
  let tweetCount = 0;
  if (tweets) {
    tweetCount = Array.isArray(tweets) ? tweets.length : 1;
  }

  if (user) {
    const screenName = user['user.screenName'];
    content = (
      <Row className='ProfileCardStat' noGutters={true}>
        <Col xs={3}>
          <a href={`/${screenName}`}>
            <span className='ProfileCardStat-title'>Tweets</span>
            <span>{tweetCount}</span>
          </a>
        </Col>
        <Col xs={4}>
          <a href={`/${screenName}/following`}>
            <span className='ProfileCardStat-title'>Following</span>
            <span>{user['user.favouritesCount']}</span>
          </a>
        </Col>
        <Col xs={5}>
          <a href={`/${screenName}/followers`}>
            <span className='ProfileCardStat-title'>Followers</span>
            <span>{user['user.followersCount']}</span>
          </a>
        </Col>
      </Row>
    );
  }

  return content;
};

export default ProfileCardStats;
