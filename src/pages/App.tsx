import React from 'react';
import MainPage from './MainPage';
import { Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import FlowBuilder from './FlowBuilder';
import ChatbotDetail from './ChatbotDetail';
import ChatbotEditor from './ChatbotEditor';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/create" element={<ChatbotEditor  />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/flow/:id" element={<FlowBuilder />} />
      <Route path="/chatbot/:id" element={<ChatbotDetail />} />
      <Route path="/chatbot/:id/edit" element={<ChatbotEditor  />} />
    </Routes>
  );
}

export default App;