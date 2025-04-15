import React from 'react';
import MainPage from './MainPage';
import { Route, Routes } from 'react-router-dom';
import CreateChatbot from './CreateChatbot';
import WelcomePage from './WelcomePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/create" element={<CreateChatbot />} />
      <Route path="/main" element={<MainPage />} />
    </Routes>
  );
}

export default App;