import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import ChatbotForm from './ChatbotForm';

const EditTab = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bot, setBot] = useState<{ name: string; description: string; phone_number: string} | null>(null);

  useEffect(() => {
    const fetchBot = async () => {
      const response = await api.get(`/api/botflows/${id}/`);
      setBot({ name: response.data.name, description: response.data.description, phone_number: '000000000', });
    };
    fetchBot();
  }, [id]);

  const handleUpdate = async ({ name, description }: { name: string; description: string }) => {
    await api.put(`/api/botflows/${id}/`, { name, description });
    navigate(`/chatbot/${id}`);
  };

  if (!bot) return <p>Carregant...</p>;

  return <ChatbotForm {...bot} onSubmit={handleUpdate} submitLabel="Actualitzar" />;
};

export default EditTab;
