import React from 'react';
import MainPage from './mainPage';
import { Route, Routes } from 'react-router-dom';
import CreateChatbot from './createChatbot';
import FlowBuilder from './flowBuilder';
import WelcomePage from './welcomePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/create" element={<CreateChatbot />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/flow" element={<FlowBuilder />} />
    </Routes>
  );
}

export default App;