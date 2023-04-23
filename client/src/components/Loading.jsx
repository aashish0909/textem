import React from 'react';
import { AiOutlineLoading } from 'react-icons/ai';
import styled from 'styled-components';

const Loading = () => {
  return (
    <Container>
      <AiOutlineLoading />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15em 1em;
  border: none;
  cursor: pointer;
  svg {
    font-size: 4rem;
    color: #ebe7ff;
    animation: spin 2s ease-in-out infinite;

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
`;

export default Loading;
