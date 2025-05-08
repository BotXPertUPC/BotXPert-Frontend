import BaseNode from './baseNode';

const FinalNode = ({ data, selected }: any) => (
  <BaseNode backgroundColor="bg-red-50" borderColor="border-red-300" icon="🏁" showSource={false} selected={selected}>
    <p className="font-semibold text-red-800">{data.label || 'Fi del flux'}</p>
  </BaseNode>
);

// Metadades del node encapsulades en un objecte separat
FinalNode.metadata = {
  type: 'final',
  icon: '🏁',
  name: 'Final',
  visible: true,
};

export default FinalNode;
