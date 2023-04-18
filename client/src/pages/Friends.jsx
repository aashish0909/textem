import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { getFriendRequests, getFriends } from '../utils/APIRoutes';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const resFriends = await axios.get(getFriends, {
          headers: {
            'auth-token': localStorage.getItem('auth-token'),
          },
        });
        const resRequests = await axios.get(getFriendRequests, {
          headers: {
            'auth-token': localStorage.getItem('auth-token'),
          },
        });

        setFriends(Array.from(resFriends.data));
        setRequests(Array.from(resRequests.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchFriends();
  }, []);

  return (
    <Container>
      <FriendRequestsContainer>
        <h2>Pending Friend Requests</h2>
        <FriendRequestsList>
          {requests.map((request) => (
            <FriendRequest key={request._id}>
              <div>{request.senderUsername}</div>
              <div>{request.status}</div>
            </FriendRequest>
          ))}
        </FriendRequestsList>
      </FriendRequestsContainer>
      <FriendsContainer>
        <h2>Friends</h2>
        <FriendsList>
          {friends.map((friend) => (
            <Friend key={friend._id}>
              <div>{friend.username}</div>
            </Friend>
          ))}
        </FriendsList>
      </FriendsContainer>
    </Container>
  );
};

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  color: white;
`;

const FriendRequestsContainer = styled.div`
  display: flex;
  width: 50vw;
  height: 75vh;
  padding: 50px;
  flex-direction: column;
  align-items: center;
  background-color: #252545;
`;

const FriendRequestsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FriendRequest = styled.li`
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border: 1px solid white;
`;

const FriendsContainer = styled.div`
  display: flex;
  width: 50vw;
  height: 75vh;
  flex-direction: column;
  align-items: center;
  background-color: #252545;
`;

const FriendsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Friend = styled.li`
  margin: 0.5rem 0;
  padding: 0.5rem;
  border: 1px solid white;
`;

export default Friends;
