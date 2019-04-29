// Components
// Hooks
// Layout
import { Col, Row } from 'react-bootstrap';
// Libs
import React from 'react';
import { useStateContext } from '../../state';

const ProfileCardStats = () => {
  const [{ user }] = useStateContext();

  let content = <h3>Loading Stats</h3>;

  if (user) {
    const screenName = user['user.screenName'];
    content = (
      <Row className='ProfileCardStat' noGutters={true}>
        <Col xs={3}>
          <a href={`/${screenName}`}>
            <span className='ProfileCardStat-title'>Tweets</span>
            <span>{user['~tweet.user'] ? user['~tweet.user'].length : 0}</span>
          </a>
        </Col>
        <Col xs={4}>
          <a href={`/${screenName}/following`}>
            <span className='ProfileCardStat-title'>Following</span>
            <span>
              {user['user.friends'] ? user['user.friends'].length : 0}
            </span>
          </a>
        </Col>
        <Col xs={5}>
          <a href={`/${screenName}/followers`}>
            <span className='ProfileCardStat-title'>Followers</span>
            <span>
              {user['~user.friends'] ? user['~user.friends'].length : 0}
            </span>
          </a>
        </Col>
      </Row>
    );
  }

  return content;
};

export default ProfileCardStats;
