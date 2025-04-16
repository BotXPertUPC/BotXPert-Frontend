// src/components/nodes/baseNode.tsx
import { Handle, Position } from 'reactflow';
import React from 'react';

interface BaseNodeProps {
  children: React.ReactNode;
  backgroundColor?: string;
  icon?: string;
  borderColor?: string;
  selected?: boolean;
  showSource?: boolean;
  showTarget?: boolean;
}

const BaseNode = ({
  children,
  backgroundColor = 'bg-white',
  borderColor = 'border-gray-300',
  icon,
  selected = false,
  showSource = true,
  showTarget = true,
}: BaseNodeProps) => {
  return (
    <div className={`
      rounded-xl p-4 w-64 border shadow-md transition-all
      ${backgroundColor} ${borderColor}
      ${selected ? 'ring-2 ring-blue-400' : ''}
    `}>
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      {children}
      {showTarget && <Handle type="target" position={Position.Left} />}
      {showSource && <Handle type="source" position={Position.Right} />}
    </div>
  );
};

export default BaseNode;
