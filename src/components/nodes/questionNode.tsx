import { Handle, Position } from 'reactflow';

const QuestionNode = ({ data }: any) => {
  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded p-4 shadow-sm w-60">
      <p className="font-semibold"> {data.text || 'Pregunta'}</p>
      <ul className="mt-2 space-y-1 text-sm text-gray-700">
        {(data.options || []).map((opt: string, i: number) => (
          <li key={i}> {opt}</li>
        ))}
      </ul>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

export default QuestionNode;
