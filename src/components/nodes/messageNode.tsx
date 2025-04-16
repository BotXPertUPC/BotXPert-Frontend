import BaseNode from './baseNode';

const MessageNode = ({ data, selected }: any) => (
  <BaseNode backgroundColor="bg-blue-50" borderColor="border-blue-300" icon="💬" selected={selected}>
    <p className="font-medium text-blue-900">Missatge</p>
    <p className="text-sm text-blue-800">{data.text || 'Escriu un missatge...'}</p>
  </BaseNode>
);

export default MessageNode;
