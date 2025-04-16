import BaseNode from './baseNode';

const CondicionalNode = ({ data }: any) => (
  <BaseNode backgroundColor="bg-purple-50" borderColor="border-purple-300" icon="🔀">
    <p className="font-medium text-purple-900">{data.text || 'Condicional'}</p>
    <p className="text-sm text-purple-800">Ex: si resposta és 'sí' →...</p>
  </BaseNode>
);

export default CondicionalNode;
