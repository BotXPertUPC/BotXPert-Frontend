import React from 'react';
import { ArrowLeft, Bot } from 'lucide-react';
import EditTab from './EditTab';

function EditChatbot() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <EditTab />
      </main>
    </div>
  );
}

export default EditChatbot;
