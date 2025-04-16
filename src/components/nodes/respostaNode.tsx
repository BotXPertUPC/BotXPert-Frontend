import BaseNode from './baseNode';

const RespostaNode = ({ data }: any) => (
  <BaseNode backgroundColor="bg-green-50" borderColor="border-green-300" icon="✍️">
    <p className="font-medium text-green-900">Resposta oberta</p>
    <p className="text-sm text-green-800">{data.text || 'Escriu una resposta...'}</p>
  </BaseNode>
);

export default RespostaNode;
