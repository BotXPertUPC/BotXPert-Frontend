import React from 'react';
import MainPage from './MainPage';
import { Route, Routes } from 'react-router-dom';
import CreateChatbot from './CreateChatbot';
import WelcomePage from './WelcomePage';
import FlowBuilder from './FlowBuilder';
import ChatbotDetail from './ChatbotDetail';
import CreateTab from './ChatbotDetail';
import EditTab from './EditTab';
import EditChatbot  from './EditChatbot';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/create" element={<CreateChatbot  />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/flow/:id" element={<FlowBuilder />} />
      <Route path="/chatbot/:id" element={<ChatbotDetail />} />
      <Route path="/chatbot/:id/edit" element={<EditChatbot  />} />
    </Routes>
  );
}

export default App;