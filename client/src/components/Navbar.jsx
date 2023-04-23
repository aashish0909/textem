import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Logo from '../assets/logo.svg';

const Navbar = () => {
  return (
    <Container>
      <LogoContainer>
        <img src={Logo} alt='logo' />
        <h3>textem</h3>
      </LogoContainer>
      <Nav>
        <NavItem>
          <NavLink to='/'>
            <h3>Home</h3>
          </NavLink>
        </NavItem>
      </Nav>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #252545;
  color: white;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 1rem;
  justify-content: center;
  img {
    height: 2rem;
  }
  h3 {
    color: white;
    text-transform: uppercase;
  }
`;

const Nav = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li``;

const NavLink = styled(Link)`
  h3 {
    color: white;
    text-transform: uppercase;
    transition: 0.25s ease-in-out;
    padding: 20px;
    &:hover {
      color: #252545;
      background-color: white;
    }
  }
  text-decoration: none;
`;

export default Navbar;
