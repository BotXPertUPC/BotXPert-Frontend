import {useEffect, useState} from 'react';
import { Node } from 'reactflow';

interface Props {
  node: Node | null;
  onChange: (node: Node) => void;
  onDelete: (nodeId: string) => void;
}

const NodeSettings = ({ node, onChange, onDelete }: Props) => {

    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (!node) return;
        const timeout = setTimeout(() => {
          onChange({ ...node, data: { ...node.data, text: inputValue } });
        }, 250);
        return () => clearTimeout(timeout);
      }, [inputValue]);

  if (!node) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...node, data: { ...node.data, text: e.target.value } });
  };

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
        <h3 className="font-semibold text-lg">Configuració del node</h3>
        <button onClick={() => onDelete(node.id)} className="text-red-600 text-sm">🗑 Eliminar</button>
      </div>

      {node.type === 'missatge' && (
        <>
          <label className="text-sm font-medium block mb-1">Text del missatge</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
        </>
      )}

      {node.type === 'pregunta' && (
        <>
          <label className="text-sm font-medium block mb-1">Pregunta</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

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
            Afegir opció
          </button>
        </>
      )}
    </div>
  );
};

export default NodeSettings;
