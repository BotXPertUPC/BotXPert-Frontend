// src/components/nodes/startNode.tsx
import BaseNode from './baseNode';

const StartNode = ({ data, selected }: any) => (
  <BaseNode
    backgroundColor="bg-sky-50"
    borderColor="border-sky-300"
    icon="🚀"
    selected={selected}
    showSource={true}
    showTarget={false} // només sortides, és l’inici
  >
    <p className="font-semibold text-sky-800">{data.label || 'Inici del flux'}</p>
  </BaseNode>
);

// Metadades del node encapsulades en un objecte separat
StartNode.metadata = {
  type: 'inici',
  icon: '🚀',
  name: 'Inici',
  visible: false,
};

export default StartNode;
