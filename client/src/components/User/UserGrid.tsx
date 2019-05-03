// Components
import UserCard from './UserCard';
// Helpers
// Hooks
// Layout
import Row from 'react-bootstrap/es/Row';
// Libs
import React from 'react';

const UserGrid = ({ users }) => {
  const columnCount = 3;

  if (users) {
    // Split users into array of arrays equal to column count.
    const rows = [...Array(Math.ceil(users.length / columnCount))].map(
      (row, index) =>
        users.slice(index * columnCount, index * columnCount + columnCount)
    );
    return (
      <>
        {rows.map((row, index) => (
          <Row key={index}>
            {row.map(user => (
              <UserCard key={user.uid} user={user} />
            ))}
          </Row>
        ))}
      </>
    );
  } else {
    return <h3>No Users found.</h3>;
  }
};

export default UserGrid;
