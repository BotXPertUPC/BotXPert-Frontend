import { Handle, Position } from 'reactflow';
import BaseNode from './baseNode';

const QuestionNode = ({ data, selected }: any) => {
  const connections = data.connections || {};
  const isConnecting = (index: number) =>
    data.connectOption?.nodeId === data.id && data.connectOption?.optionIndex === index;

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
              style={{ top: '50%', transform: `translateY(-50%)`, right: -10, position: 'absolute' }}
            />

            <span className="text-sm text-gray-700">🔹 {opt}</span>

            {connections[i] ? (
              <span className="text-xs text-green-600">→ Node {connections[i]}</span>
            ) : (
              <button
                className={`text-xs ${
                  isConnecting(i)
                    ? 'text-orange-600 underline font-semibold'
                    : 'text-blue-600 hover:underline'
                } ml-2`}
                onClick={(e) => {
                  e.stopPropagation();
                  data.setConnectOption({ nodeId: data.id, optionIndex: i });
                }}
              >
                ➕ {isConnecting(i) ? 'Esperant...' : 'Connectar'}
              </button>
            )}
          </li>
        ))}
      </ul>

      <Handle type="target" position={Position.Left} />
    </BaseNode>
  );
};

// Metadades del node encapsulades en un objecte separat
QuestionNode.metadata = {
  type: 'pregunta',
  icon: '❓',
  name: 'Pregunta',
  visible: true,
};

export default QuestionNode;
