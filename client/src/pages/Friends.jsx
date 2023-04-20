import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BiCheck, BiUserPlus, BiUserX, BiX } from 'react-icons/bi';
import axios from 'axios';
import {
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  rejectFriendRequest,
  unfriend,
} from '../utils/APIRoutes';

const Friends = () => {
  const [friends, setFriends] = useState([
    {
      _id: 1,
      username: 'aashish',
    },
    {
      _id: 2,
      username: 'ayush',
    },
  ]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([
    { _id: 1, username: 'eleven' },
    { _id: 2, username: 'max' },
  ]);

  useEffect(() => {
    // const fetchFriends = async () => {
    //   try {
    //     const resFriends = await axios.get(getFriends, {
    //       headers: {
    //         'auth-token': localStorage.getItem('auth-token'),
    //       },
    //     });
    //     const resRequests = await axios.get(getFriendRequests, {
    //       headers: {
    //         'auth-token': localStorage.getItem('auth-token'),
    //       },
    //     });

    //     setFriends(Array.from(resFriends.data));
    //     setRequests(Array.from(resRequests.data));
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
    // fetchFriends();
    setRequests([
      {
        _id: '65jkakljfdq928389yksd',
        senderUsername: 'ashutosh',
        status: 'Pending',
      },
    ]);
  }, []);

  const handleClickUser = async (event, index) => {};

  const handleClickAccept = async (event, index) => {
    const currentUser = requests[index].senderUsername;
    const currentUserID = event.currentTarget.id;
    // const res = await axios.post(
    //   acceptFriendRequest,
    //   {
    //     senderId: currentUserID,
    //   },
    //   {
    //     headers: {
    //       'auth-token': localStorage.getItem('auth-token'),
    //     },
    //   }
    // );

    const newFriend = {
      _id: currentUserID,
      username: currentUser,
    };
    const newRequests = requests.filter(
      (request) => request._id != currentUserID
    );
    setRequests(newRequests);
    setFriends((current) => [...current, newFriend]);
  };

  const handleClickReject = async (event) => {
    const currentUserID = event.currentTarget.id;

    // const res = await axios.post(
    //   rejectFriendRequest,
    //   {
    //     senderId: currentUserID,
    //   },
    //   {
    //     headers: {
    //       'auth-token': localStorage.getItem('auth-token'),
    //     },
    //   }
    // );

    const newRequests = requests.filter(
      (request) => request._id != currentUserID
    );
    setRequests(newRequests);
  };

  const handleClickUnfriend = async (event) => {
    const currentUserID = event.currentTarget.id;

    // const res = await axios.post(
    //   unfriend,
    //   {
    //     friendId: currentUserID,
    //   },
    //   {
    //     headers: {
    //       'auth-token': localStorage.getItem('auth-token'),
    //     },
    //   }
    // );

    const newFriends = friends.filter((friend) => friend._id != currentUserID);
    setFriends(newFriends);
  };

  return (
    <Container>
      <UsersContainer>
        <h2>Users</h2>
        <UsersList>
          {users.map((user, index) => (
            <User key={user._id}>
              <div className='UserUsername'>{user.username}</div>
              <button
                onClick={(event) => handleClickUser(event, index)}
                id={user._id}
                className='AddUser'
              >
                <BiUserPlus />
              </button>
            </User>
          ))}
        </UsersList>
      </UsersContainer>
      <FriendRequestsContainer>
        <h2>Pending Friend Requests</h2>
        <FriendRequestsList>
          {requests.map((request, index) => (
            <FriendRequest key={request._id}>
              <div className='FriendRequestUsername'>
                {request.senderUsername}
              </div>
              <button
                onClick={(event) => handleClickAccept(event, index)}
                id={request._id}
                className='AcceptFriendRequest'
              >
                <BiCheck />
              </button>
              <button
                onClick={(event) => handleClickReject(event)}
                id={request._id}
                className='RejectFriendRequest'
              >
                <BiX />
              </button>
            </FriendRequest>
          ))}
        </FriendRequestsList>
      </FriendRequestsContainer>
      <FriendsContainer>
        <h2>Friends</h2>
        <FriendsList>
          {friends.map((friend) => (
            <Friend key={friend._id}>
              <div className='FriendUsername'>{friend.username}</div>
              <button
                className='Unfriend'
                onClick={(event) => handleClickUnfriend(event)}
                id={friend._id}
              >
                <BiUserX />
              </button>
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
  margin: 0px 50px;
  flex-direction: column;
  align-items: center;
  background-color: #252545;
`;

const FriendRequestsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 10px;
`;

const FriendRequest = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
  font-size: 1.3rem;
  border-radius: 0.2rem;
  text-align: center;
  .FriendRequestUsername {
    background-color: #ffffff34;
    padding: 0.5rem;
    margin: 0.5rem 0.5rem;
    border-radius: 0.2rem;
  }
  .AcceptFriendRequest {
    margin-right: 0.5em;
  }
  svg {
    font-size: 20px;
  }
  button {
    height: 2.7em;
    width: 2.7em;
  }
  .react-icons {
    vertical-align: middle;
  }
`;
const UsersContainer = styled.div`
  display: flex;
  width: 50vw;
  height: 75vh;
  padding: 50px;
  margin: 0px 50px;
  flex-direction: column;
  align-items: center;
  background-color: #252545;
`;

const UsersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 10px;
`;

const User = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
  font-size: 1.3rem;
  border-radius: 0.2rem;
  text-align: center;
  .UserUsername {
    background-color: #ffffff34;
    padding: 0.5rem;
    margin: 0.5rem 0.5rem;
    border-radius: 0.2rem;
  }
  svg {
    font-size: 20px;
  }
  button {
    height: 2.7em;
    width: 2.7em;
  }
  .react-icons {
    vertical-align: middle;
  }
`;

const FriendsContainer = styled.div`
  display: flex;
  width: 50vw;
  height: 75vh;
  padding: 50px;
  margin: 0px 50px;
  flex-direction: column;
  align-items: center;
  background-color: #252545;
`;

const FriendsList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 5px;
`;

const Friend = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.2rem 0;
  font-size: 1.3rem;
  border-radius: 0.2rem;
  text-align: center;
  .FriendUsername {
    background-color: #ffffff34;
    padding: 0.5rem;
    margin: 0.5rem 0.5rem;
    border-radius: 0.2rem;
  }
  svg {
    font-size: 20px;
  }
  button {
    height: 2.7em;
    width: 2.7em;
  }
  .react-icons {
    vertical-align: middle;
  }
`;

export default Friends;
