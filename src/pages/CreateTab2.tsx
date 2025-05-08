import { useNavigate } from 'react-router-dom';
import api from '../api';
import ChatbotForm from './ChatbotForm';

const CreateTab2 = () => {
  const navigate = useNavigate();

  const handleCreate = async ({ name, description }: { name: string; description: string }) => {
    const response = await api.post('/api/botflows/', {
      name,
      description,
      phone_number: '000000000',
    });
    navigate(`/main`);
  };

  return <ChatbotForm onSubmit={handleCreate} submitLabel="Crear" />;
};

export default CreateTab2;
