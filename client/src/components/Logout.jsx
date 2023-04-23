import axios from 'axios';
import React from 'react';
import { BiPowerOff } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { logoutRoute } from '../utils/APIRoutes';

export default function Logout({ socket }) {
  const navigate = useNavigate();
  const handleClick = async () => {
    const data = await axios.get(`${logoutRoute}`, {
      headers: {
        'auth-token': localStorage.getItem('auth-token'),
      },
    });
    if (data.status === 200) {
      localStorage.clear();
      navigate('/login');
    }
  };
  return (
    <Button onClick={handleClick}>
      <BiPowerOff />
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
