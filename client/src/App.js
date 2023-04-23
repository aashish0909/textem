import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SetAvatar from './components/SetAvatar';
import Chat from './pages/Chat';
import Friends from './pages/Friends';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/friends' element={<Friends />} />
        <Route path='/login' element={<Login />} />
        <Route path='/setAvatar' element={<SetAvatar />} />
        <Route path='/' element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
