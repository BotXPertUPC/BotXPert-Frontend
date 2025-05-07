import React from 'react';
import MainPage from './MainPage';
import { Route, Routes } from 'react-router-dom';
import CreateChatbot from './CreateChatbot';
import WelcomePage from './WelcomePage';
import FlowBuilder from './FlowBuilder';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/create" element={<CreateChatbot />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/flow/:id" element={<FlowBuilder />} />
    </Routes>
  );
}

export default App;