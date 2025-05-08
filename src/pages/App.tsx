import React from 'react';
import MainPage from './MainPage';
import { Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import FlowBuilder from './FlowBuilder';
import ChatbotDetail from './ChatbotDetail';
import ChatbotEditor from './ChatbotEditor';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from './LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create" element={<ProtectedRoute><ChatbotEditor /></ProtectedRoute>} />
      <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
      <Route path="/flow/:id" element={<ProtectedRoute><FlowBuilder /></ProtectedRoute>} />
      <Route path="/chatbot/:id" element={<ProtectedRoute><ChatbotDetail /></ProtectedRoute>} />
      <Route path="/chatbot/:id/edit" element={<ProtectedRoute><ChatbotEditor /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;