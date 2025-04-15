import React from 'react';
import { MessageSquare, Plus, MoreVertical, PenSquare, MessageCircleQuestion as QuestionCircle, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const chatbots = [
    {
      id: 'nextconsult',
      name: 'NextConsult',
      description: 'Assistent virtual per a consultoria inicial en transformació digital i serveis TI'
    },
    {
      id: 'nextcloud',
      name: 'NextCloud',
      description: 'Especialitzat en consultoria i manteniment d\'entorns cloud'
    },
    {
      id: 'nextsec',
      name: 'NextSec',
      description: 'Bot enfocat a consultoria en ciberseguretat'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo512.png" alt="BotXpert Logo" className="w-10 h-10" />
              <img src="/nom_app_black.png" alt="BotXpert Name Logo Black" className="h-10" />
            </div>
          <div className="flex items-center gap-4">
            <QuestionCircle className="w-6 h-6 text-gray-500" />
            <UserCircle className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-6">Els meus Chatbots</h1>
          <button 
            onClick={() => navigate('/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear Chatbot
          </button>
        </div>

        {/* Create Chatbot Card */}
        <div 
          onClick={() => navigate('/create')}
          className="bg-white rounded-lg p-6 mb-6 border hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Plus className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Crear Chatbot</h3>
              <p className="text-gray-600">Create a version of chatbot for specific purpose</p>
            </div>
          </div>
        </div>

        {/* Chatbot List */}
        {chatbots.map((bot) => (
          <div key={bot.id} className="bg-white rounded-lg p-6 mb-4 border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{bot.name}</h3>
                  <p className="text-gray-600">{bot.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <PenSquare className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default Dashboard;