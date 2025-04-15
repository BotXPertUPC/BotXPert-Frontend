import { Handle, Position } from 'reactflow';

const MessageNode = ({ data }: any) => {
  return (
    <div className="bg-white border rounded p-4 shadow-sm w-56">
      <p className="font-medium">💬 Missatge:</p>
      <p className="text-sm">{data.text || 'Escriu un missatge...'}</p>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

export default MessageNode;
