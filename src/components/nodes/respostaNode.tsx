import BaseNode from './baseNode';

const RespostaNode = ({ data, selected }: any) => (
  <BaseNode backgroundColor="bg-green-50" borderColor="border-green-300" icon="✍️" selected={selected}>
    <p className="font-medium text-green-900">Resposta oberta</p>
    <p className="text-sm text-green-800">{data.text || 'Escriu una resposta...'}</p>
  </BaseNode>
);

// Metadades del node encapsulades en un objecte separat
RespostaNode.metadata = {
  type: 'resposta',
  icon: '✍️',
  name: 'Resposta',
  visible: true,
};

export default RespostaNode;
