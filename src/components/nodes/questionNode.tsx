import { Handle, Position } from 'reactflow';
import BaseNode from './baseNode';

const QuestionNode = ({ data, selected }: any) => {
  const connections = data.connections || {};

  return (
    <BaseNode
      backgroundColor="bg-yellow-50"
      borderColor="border-yellow-300"
      icon="❓"
      selected={selected}
    >
      <p className="font-medium text-yellow-900">{data.text || 'Pregunta'}</p>

      <ul className="mt-2 text-sm text-yellow-800 space-y-3 relative">
        {(data.options || []).map((opt: string, i: number) => (
          <li key={i} className="flex items-center justify-between gap-2 relative">
            {/* Handle per connexió de l’opció */}
            <Handle
              type="source"
              position={Position.Right}
              id={`option-${i}`}
              style={{ top: '50%', transform: `translateY(${i * 1.8}rem)`, right: -10 }}
            />

            <span className="text-sm text-gray-700">🔹 {opt}</span>
            {connections[i] ? (
              <span className="text-xs text-green-600">→ Node {connections[i]}</span>
            ) : data.connectOption?.nodeId === data.id && data.connectOption?.optionIndex === i ? (
              <div className="flex flex-col space-y-1">
                {['missatge', 'resposta', 'final'].map((type) => (
                  <button
                    key={type}
                    className="text-xs text-white bg-blue-500 px-2 py-1 rounded hover:bg-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      data.onConnectOption(data.id, i, type);
                      data.setConnectOption(null); // tancar menú
                    }}
                  >
                    ➕ {type}
                  </button>
                ))}
                <button
                  className="text-xs text-gray-500 underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    data.setConnectOption(null);
                  }}
                >
                  Cancel·lar
                </button>
              </div>
            ) : (
              <button
                className="text-blue-600 text-xs hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  data.setConnectOption({ nodeId: data.id, optionIndex: i });
                }}
              >
                ➕ Connectar
              </button>
            )}

          </li>
        ))}
      </ul>

      <Handle type="target" position={Position.Left} />
    </BaseNode>
  );
};

export default QuestionNode;
