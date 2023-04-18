import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { allUsersRoute, host } from '../utils/APIRoutes';
import Contacts from '../components/Contacts';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';
import { io } from 'socket.io-client';

function Chat() {
  const socket = useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      if (!localStorage.getItem('chat-app-user')) navigate('/login');
      else {
        setCurrentUser(await JSON.parse(localStorage.getItem('chat-app-user')));
        setIsLoaded(true);
      }
    };
    checkLogin();
  }, []);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host, {
        reconnectionAttempts: 10, // Try to reconnect 10 times
        reconnectionDelay: 1000, // Wait for 1 second before trying to reconnect
        reconnectionDelayMax: 5000, // Wait for up to 5 seconds before trying to reconnect
      });

      socket.current.emit('add-user', currentUser._id);
      socket.current.emit('update-user-status', {
        username: currentUser.username,
        status: true,
      });

      // Listen for heartbeat events from the server
      socket.current.on('heartbeat', () => {
        // Send heartbeat acknowledgement to the server
        socket.current.emit('heartbeat-ack');
      });

      // Handle disconnection events
      socket.current.on('disconnect', () => {
        // Update the user status to false
        socket.current.emit('update-user-status', {
          username: currentUser.username,
          status: false,
        });
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const data = await axios.get(`${allUsersRoute}`, {
            headers: {
              'auth-token': localStorage.getItem('auth-token'),
            },
          });
          setContacts(data.data);
        } else {
          navigate('/setAvatar');
        }
      }
    };
    fetchData();
  }, [currentUser]);
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container>
      <div className='container'>
        <Contacts
          contacts={contacts}
          currentUser={currentUser}
          changeChat={handleChatChange}
        />
        {isLoaded && currentChat === undefined ? (
          <Welcome />
        ) : (
          <ChatContainer currentChat={currentChat} socket={socket} />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat;
