import React from 'react';
import { Handle, Position } from 'reactflow';

const FinalNode = ({ data }: { data: { label: string } }) => {
  return (
    <div style={{ padding: 10, border: '1px solid black', borderRadius: 5, backgroundColor: '#f8d7da' }}>
      <strong>{data.label}</strong>
      {/* Only allow incoming edges */}
      <Handle type="target" position={Position.Top} />
    </div>
  );
};

export default FinalNode;