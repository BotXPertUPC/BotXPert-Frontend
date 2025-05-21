import React from 'react';
import { ArrowLeft, Bot, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const fakeTutorials = [
  {
    id: 1,
    title: 'Cómo empezar con NextConsult',
    description: 'Una introducción rápida a la aplicación.',
    thumbnail: '/LandingPage.png',
  },
  {
    id: 2,
    title: 'Crear tu primer flujo de trabajo',
    description: 'Tutorial paso a paso sobre flujos.',
    thumbnail: '/FlowBot.png',
  },
  {
    id: 3,
    title: 'Gestión de usuarios y permisos',
    description: 'Aprende cómo administrar tu equipo.',
    thumbnail: '/Login.png',
  },
];

const TutorialPage = () => {
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
        <h2 className="text-2xl font-semibold mb-6">Tutorials de la plataforma</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fakeTutorials.map((tutorial) => (
            <Link
              key={tutorial.id}
              to={`/tutorials/${tutorial.id}`}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-w-16 aspect-h-9 mb-4 overflow-hidden rounded">
                <img
                  src={tutorial.thumbnail}
                  alt={tutorial.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold">{tutorial.title}</h3>
              <p className="text-sm text-gray-600">{tutorial.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TutorialPage;
