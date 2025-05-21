import BaseNode from "./baseNode";

const ImageNode = ({ data, selected }: any) => (
  <BaseNode backgroundColor="bg-purple-50" borderColor="border-purple-300" icon="🖼️" selected={selected}>
    <p className="font-medium text-purple-900">Imatge</p>
    {data.imageUrl ? (
      <div className="mt-2 overflow-hidden rounded-md border border-purple-200">
        <img 
          src={data.imageUrl} 
          alt={data.altText || 'Imatge del chatbot'} 
          className="w-full h-20 object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/150?text=Error+de+imatge';
          }}
        />
        <p className="text-xs text-purple-500 truncate p-1">{data.imageUrl}</p>
      </div>
    ) : (
      <p className="text-sm text-purple-600">Afegeix l'URL d'una imatge...</p>
    )}
  </BaseNode>
);

// Metadades del node
ImageNode.metadata = {
  type: 'imatge',
  icon: '🖼️',
  name: 'Imatge',
  visible: true,
};

export default ImageNode;
