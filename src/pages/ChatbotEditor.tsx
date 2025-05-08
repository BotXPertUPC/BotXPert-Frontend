import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bot } from 'lucide-react';
import api from '../api';

const ChatbotEditor = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      const fetchBot = async () => {
        try {
          const response = await api.get(`/api/botflows/${id}/`);
          setName(response.data.name);
          setDescription(response.data.description);
        } catch (error) {
          console.error('Error carregant el bot:', error);
          alert('No s’ha pogut carregar el chatbot');
        } finally {
          setLoading(false);
        }
      };
      fetchBot();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (id) {
        await api.put(`/api/botflows/${id}/`, { name, description, phone_number: '000000000' });
      } else {
        const response = await api.post(`/api/botflows/`, { name, description, phone_number: '000000000' });
        return navigate(`/chatbot/${response.data.id}`);
      }

      navigate('/main');
    } catch (err) {
      console.error('Error desant el bot:', err);
      alert('No s’ha pogut desar el chatbot');
    }
  };

  if (loading) return <p className="p-4">Carregant...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
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

      <main className="max-w-screen-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom del chatbot"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripció
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descriu el propòsit d'aquest chatbot"
                />
              </div>
            </div>
          </div>

          <div className="text-right">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              {id ? 'Actualitzar' : 'Crear'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ChatbotEditor;
