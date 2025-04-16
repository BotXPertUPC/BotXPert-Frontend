import React, { useState } from 'react';
import { ArrowLeft, Bot, Save, Rocket } from 'lucide-react';
import CreateTab from './CreateTab';
import FlowBuilder from './FlowBuilder';

function CreateChatbot() {
  const [activeTab, setActiveTab] = useState('crear');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleDeployClick = () => {
    setShowDeployModal(true);
  };

  const closeSaveModal = () => {
    setShowSaveModal(false);
  };

  const closeDeployModal = () => {
    setShowDeployModal(false);
  };

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
            <div className="flex items-center gap-4">
              <button 
                onClick={handleDeployClick} 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Desplegar
              </button>
              <button 
                onClick={handleSaveClick} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Save className="w-5 h-5" />
                Desa
              </button>
            </div>
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
          <CreateTab />
        ) : (
          <FlowBuilder />
        )}
      </main>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirmació</h2>
            <p>Estàs segur que vols desar els canvis?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button 
                onClick={closeSaveModal} 
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg">
                Cancel·lar
              </button>
              <button 
                onClick={closeSaveModal} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirmació</h2>
            <p>Estàs segur que vols desplegar l'aplicació en el telèfon 666666666?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button 
                onClick={closeDeployModal} 
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg">
                Cancel·lar
              </button>
              <button 
                onClick={closeDeployModal} 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateChatbot;