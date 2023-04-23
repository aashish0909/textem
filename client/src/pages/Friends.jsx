import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BiCheck, BiUserPlus, BiUserX, BiX } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import styled from 'styled-components';
import Loading from '../components/Loading';
import Navbar from '../components/Navbar';
import {
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  getNonFriends,
  rejectFriendRequest,
  sendFriendRequest,
  unfriend,
} from '../utils/APIRoutes';

const Friends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const toastOptions = {
    position: 'bottom-right',
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  };

  useEffect(() => {
    const checkLogin = async () => {
      if (!localStorage.getItem('chat-app-user')) navigate('/login');
    };
    checkLogin();
  }, []);

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
        const resUsers = await axios.get(getNonFriends, {
          headers: {
            'auth-token': localStorage.getItem('auth-token'),
          },
        });

        setFriends(Array.from(resFriends.data));
        setRequests(Array.from(resRequests.data));
        setUsers(Array.from(resUsers.data));
        setTimeout(() => setLoading(false), 2000);
      } catch (error) {}
    };
    fetchFriends();
  }, []);

  const handleClickUser = async (event, index) => {
    const currentUserID = event.currentTarget.id;
    const res = await axios.post(
      sendFriendRequest,
      {
        recipientId: currentUserID,
      },
      {
        headers: {
          'auth-token': localStorage.getItem('auth-token'),
        },
      }
    );

    const newUsers = users.filter((user) => user._id != currentUserID);
    setUsers(newUsers);
    toast.success('Friend Request Sent!', toastOptions);
  };

  const handleClickAccept = async (event, index) => {
    const currentUser = requests[index].senderUsername;
    const currentUserID = event.currentTarget.id;
    const res = await axios.post(
      acceptFriendRequest,
      {
        senderId: currentUserID,
      },
      {
        headers: {
          'auth-token': localStorage.getItem('auth-token'),
        },
      }
    );

    const newRequests = requests.filter(
      (request) => request.senderId != currentUserID
    );
    setRequests(newRequests);

    const newFriend = {
      _id: currentUserID,
      username: currentUser,
    };
    const newFriends = [...friends];
    newFriends.push(newFriend);
    setFriends(newFriends);

    toast.success('Accepted Friend Request!', toastOptions);
  };

  const handleClickReject = async (event) => {
    const currentUserID = event.currentTarget.id;
    const res = await axios.post(
      rejectFriendRequest,
      {
        senderId: currentUserID,
      },
      {
        headers: {
          'auth-token': localStorage.getItem('auth-token'),
        },
      }
    );

    const newRequests = requests.filter(
      (request) => request.senderId != currentUserID
    );
    setRequests(newRequests);

    toast.error('Rejected Friend Request!', toastOptions);
  };

  const handleClickUnfriend = async (event) => {
    const currentUserID = event.currentTarget.id;

    const res = await axios.post(
      unfriend,
      {
        friendId: currentUserID,
      },
      {
        headers: {
          'auth-token': localStorage.getItem('auth-token'),
        },
      }
    );

    const newFriends = friends.filter((friend) => friend._id != currentUserID);
    setFriends(newFriends);

    toast.error('Removed from friends!', toastOptions);
  };

  return (
    <>
      <Navbar />
      <Container>
        <UsersContainer>
          <h2>Users</h2>
          {loading === false ? (
            <UsersList>
              {users.map((user, index) => (
                <User key={index}>
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
          ) : (
            <Loading />
          )}
        </UsersContainer>
        <FriendRequestsContainer>
          <h2>Pending Friend Requests</h2>
          {loading === false ? (
            <FriendRequestsList>
              {requests.map((request, index) => (
                <FriendRequest key={index}>
                  <div className='FriendRequestUsername'>
                    {request.senderUsername}
                  </div>
                  <button
                    onClick={(event) => handleClickAccept(event, index)}
                    id={request.senderId}
                    className='AcceptFriendRequest'
                  >
                    <BiCheck />
                  </button>
                  <button
                    onClick={(event) => handleClickReject(event)}
                    id={request.senderId}
                    className='RejectFriendRequest'
                  >
                    <BiX />
                  </button>
                </FriendRequest>
              ))}
            </FriendRequestsList>
          ) : (
            <Loading />
          )}
        </FriendRequestsContainer>
        <FriendsContainer>
          <h2>Friends</h2>
          {loading === false ? (
            <FriendsList>
              {friends.map((friend, index) => (
                <Friend key={index}>
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
          ) : (
            <Loading />
          )}
        </FriendsContainer>
      </Container>
      <ToastContainer />
    </>
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
  overflow: scroll;
  overflow-x: hidden;
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
