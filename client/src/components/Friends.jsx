import React from 'react';
import { FaUserFriends } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

export default function Friends() {
  const navigate = useNavigate();
  const handleClick = async () => {
    navigate('/friends');
  };
  return (
    <Button onClick={handleClick}>
      <FaUserFriends />
    </Button>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a86f3;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
  }
`;
