import React, { useState } from 'react';
import { ArrowLeft, Bot, Save } from 'lucide-react';

function CreateChatbot() {
  const [activeTab, setActiveTab] = useState('crear');

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
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Save className="w-5 h-5" />
              Desa
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('crear')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'crear'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Crear
            </button>
            <button
              onClick={() => setActiveTab('configurar')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'configurar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Configurar
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'crear' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Informació bàsica</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom del chatbot"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripció
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descriu el propòsit d'aquest chatbot"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Configuració</h2>
            <p className="text-gray-600">Contingut de configuració aquí...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default CreateChatbot;