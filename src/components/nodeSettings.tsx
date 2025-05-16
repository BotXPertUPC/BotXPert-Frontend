// src/components/nodeSettings.tsx
import { useEffect, useState } from 'react';
import { Node } from 'reactflow';

interface Props {
  node: Node | null;
  onChange: (node: Node) => void;
  onDelete: (nodeId: string) => void;
}

// Función para intentar extraer la URL directa de la imagen
const getDirectImageUrl = (url: string): string => {
  try {
    if (!url || url.trim() === '') {
      return '';
    }

    if (url.includes('upload.wikimedia.org') || url.includes('wikipedia.org')) {
      return url;
    }

    if (url.includes('images.app.goo.gl') || url.includes('google.com/imgres')) {
      return url;
    }

    if (
      url.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) || 
      url.startsWith('data:image/')
    ) {
      return url;
    }
    
    return url;
  } catch (error) {
    console.error("Error procesando URL de imagen:", error);
    return url;
  }
};

const NodeSettings = ({ node, onChange, onDelete }: Props) => {
  const [inputValue, setInputValue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [imageError, setImageError] = useState(false);
  
  // Flag para controlar si se debe actualizar desde el nodo
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Solo inicializamos los valores cuando cambia el nodo actual (montaje inicial o cambio de nodo)
  useEffect(() => {
    if (node) {
      setInputValue(node.data?.text || '');
      setImageUrl(node.data?.imageUrl || '');
      setAltText(node.data?.altText || '');
      setImageError(false);
      setIsInitialLoad(false);
    }
  }, [node?.id]); // Solo depende del ID del nodo, no de todo el nodo

  // Guardamos cambios de texto regular
  const handleTextChange = (value: string) => {
    setInputValue(value);
    if (node) {
      onChange({ ...node, data: { ...node.data, text: value } });
    }
  };

  // Guardamos cambios de URL de imagen
  const handleImageUrlChange = (value: string) => {
    setImageUrl(value);
    setImageError(false);
    if (node) {
      onChange({ ...node, data: { ...node.data, imageUrl: value } });
    }
  };

  // Guardamos cambios de texto alternativo
  const handleAltTextChange = (value: string) => {
    setAltText(value);
    if (node) {
      onChange({ ...node, data: { ...node.data, altText: value } });
    }
  };

  if (!node) return null;

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...(node.data.options || [])];
    updatedOptions[index] = value;
    onChange({ ...node, data: { ...node.data, options: updatedOptions } });
  };

  const addOption = () => {
    const updatedOptions = [...(node.data.options || []), 'Nova opció'];
    onChange({ ...node, data: { ...node.data, options: updatedOptions } });
  };

  return (
    <div className="w-80 bg-white p-4 border-l shadow h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Configuració del node
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({node.type} - ID: {node.id})
        </span>
        </h3>
        <button
          onClick={() => onDelete(node.id)}
          className="text-red-600 text-sm hover:underline"
        >
          🗑 Eliminar
        </button>
      </div>

      {['missatge', 'pregunta', 'resposta'].includes(node.type || '') && (
        <>
          <label className="text-sm font-medium block mb-1">
            {node.type === 'pregunta' ? 'Pregunta' : 'Text'}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
        </>
      )}

      {node.type === 'imatge' && (
        <>
          <label className="text-sm font-medium block mb-1">
            URL de la imatge
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            placeholder="Introdueix l'URL de la imatge"
            className="w-full p-2 border rounded mb-4"
          />
          
          {imageUrl && (imageUrl.includes('images.app.goo.gl') || imageUrl.includes('google.com/imgres')) ? (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <p className="font-medium">⚠️ URL de Google Images</p>
              <p>Les URLs de Google Images no són compatibles directament. Si us plau, fes clic a la imatge amb el botó dret i selecciona "Copia l'adreça de la imatge" per obtenir l'URL directa.</p>
            </div>
          ) : null}
          
          <label className="text-sm font-medium block mb-1">
            Text alternatiu
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => handleAltTextChange(e.target.value)}
            placeholder="Descripció de la imatge"
            className="w-full p-2 border rounded mb-4"
          />
          
          {imageUrl && (
            <div className="mt-2 mb-4">
              <p className="text-sm font-medium mb-1">Previsualització:</p>
              <div className="border rounded overflow-hidden">
                {imageError ? (
                  <div className="bg-gray-100 p-4 text-center text-gray-500 w-full h-40 flex flex-col items-center justify-center">
                    <p className="font-medium mb-2">No s'ha pogut carregar la imatge</p>
                    <p className="text-xs text-gray-400 max-w-xs">Assegureu-vos que la URL apunta directament a una imatge (.jpg, .png, .gif, etc.) i que és accessible públicament</p>
                  </div>
                ) : (
                  <img 
                    src={imageUrl} 
                    alt={altText || 'Previsualització'} 
                    className="w-full object-contain max-h-40"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}

      {node.type === 'pregunta' && (
        <>
          <label className="text-sm font-medium block mb-2">Opcions de resposta</label>
          {node.data.options?.map((opt: string, i: number) => (
            <input
              key={i}
              type="text"
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
          ))}
          <button
            onClick={addOption}
            className="text-sm text-blue-600 mt-2 hover:underline"
          >
            ➕ Afegir opció
          </button>
        </>
      )}
    </div>
  );
};

export default NodeSettings;
