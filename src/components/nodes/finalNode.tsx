import BaseNode from './baseNode';

const FinalNode = ({ data }: any) => (
  <BaseNode backgroundColor="bg-red-50" borderColor="border-red-300" icon="🏁" showSource={false}>
    <p className="font-semibold text-red-800">{data.label || 'Fi del flux'}</p>
  </BaseNode>
);

export default FinalNode;
