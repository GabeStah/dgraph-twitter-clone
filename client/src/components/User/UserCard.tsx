// Components
// Layout
import './UserCard.css';
import { Card, Image } from 'react-bootstrap';
// Libs
import React from 'react';

const UserCard = ({ user }) => {
  let content = <h3>Loading User</h3>;

  if (user) {
    const name = user['user.name'];
    const screenName = user['user.screenName'];

    content = (
      <Card className='UserCard col-sm-4'>
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
        </Card.Body>
      </Card>
    );
  } else {
    content = (
      <>
        <h3>No User found.</h3>
      </>
    );
  }
  return content;
};

export default UserCard;
