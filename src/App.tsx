import React from 'react';
import MainPage from './mainPage';
import { Route, Routes } from 'react-router-dom';
import CreateChatbot from './createChatbot';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/create" element={<CreateChatbot />} />
    </Routes>
  );
}

export default App;