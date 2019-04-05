// Components
import { Nav, Navbar } from 'react-bootstrap';
// Libs
import React from 'react';
import SearchBox from './SearchBox';

const NavigationBar = () => {
  return (
    <Navbar bg='light' fixed='top'>
      <Navbar.Brand href='#home'>Dgraph + Twitter</Navbar.Brand>
      <Navbar.Toggle aria-controls='basic-navbar-nav' />
      <Navbar.Collapse key='basic-navbar-nav'>
        <Nav className='mr-auto'>
          <Nav.Link href='/'>Home</Nav.Link>
          <Nav.Link href='#moments'>Moments</Nav.Link>
          <Nav.Link href='#notifications'>Notifications</Nav.Link>
          <Nav.Link href='#messages'>Messages</Nav.Link>
        </Nav>
        <SearchBox />
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
