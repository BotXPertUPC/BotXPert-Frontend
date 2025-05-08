import React, { useState } from 'react';
import { ArrowLeft, Bot } from 'lucide-react';
import CreateTab from './CreateTab';

function CreateChatbot() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => window.history.back()} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-6 h-6" />
                </button>
              <div className="flex items-center gap-3">
                <Bot className="w-10 h-10 text-blue-500" />
                <div>
                  <h1 className="text-xl font-semibold">NextConsult</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <CreateTab />
      </main>
    </div>
  );
}

export default CreateChatbot;