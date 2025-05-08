// src/components/nodeSettings.tsx
import { useEffect, useState } from 'react';
import { Node } from 'reactflow';

interface Props {
  node: Node | null;
  onChange: (node: Node) => void;
  onDelete: (nodeId: string) => void;
}

const NodeSettings = ({ node, onChange, onDelete }: Props) => {
  const [inputValue, setInputValue] = useState('');

  // Actualitza l'input quan es canvia de node
  useEffect(() => {
    if (node?.data?.text) {
      setInputValue(node.data.text);
    } else {
      setInputValue('');
    }
  }, [node]);

  // Aplica el canvi de text amb debounce
  useEffect(() => {
    if (!node) return;
    const timeout = setTimeout(() => {
      onChange({ ...node, data: { ...node.data, text: inputValue } });
    }, 250);
    return () => clearTimeout(timeout);
  }, [inputValue, node, onChange]); // Added 'node' and 'onChange' to the dependency array

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

      {/* Camp de text per missatge, pregunta, resposta */}
      {['missatge', 'pregunta', 'resposta'].includes(node.type || '') && (
        <>
          <label className="text-sm font-medium block mb-1">
            {node.type === 'pregunta' ? 'Pregunta' : 'Text'}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
        </>
      )}

      {/* Opcions per preguntes */}
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
