import React, { useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useLocation } from 'react-router-dom';
import MessageNode from '../components/nodes/messageNode';
import QuestionNode from '../components/nodes/questionNode';
import NodeSettings from '../components/nodeSettings';

const FlowBuilder = () => {
  const { state } = useLocation();
  const { name, description } = state || {};
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Inici' },
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeId, setNodeId] = useState(2);

  const addNode = (type: string) => {
    const newNode: Node = {
      id: String(nodeId),
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `Nou estat: ${type}`,
        text: '',
        options: type === 'pregunta' ? ['Opció 1', 'Opció 2'] : [],
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((id) => id + 1);
  };

  const nodeTypes = {
    missatge: MessageNode,
    pregunta: QuestionNode,
  };

  const handleNodeChange = (updatedNode: Node) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white shadow shrink-0">
        <h2 className="text-xl font-bold">Dissenyant: {name}</h2>
        <p className="text-gray-500">{description}</p>
      </div>

      {/* Cos principal amb Sidebar, Canvas i Configuració */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar esquerra */}
        <div className="w-64 bg-gray-100 p-4 border-r shrink-0">
          <h2 className="text-lg font-semibold mb-4">Afegir estat</h2>
          <div className="space-y-2">
            <button onClick={() => addNode('missatge')} className="w-full bg-white p-2 rounded shadow text-left">Missatge</button>
            <button onClick={() => addNode('pregunta')} className="w-full bg-white p-2 rounded shadow text-left">Pregunta amb opcions</button>
            <button onClick={() => addNode('condicional')} className="w-full bg-white p-2 rounded shadow text-left">Condicional</button>
            <button onClick={() => addNode('resposta')} className="w-full bg-white p-2 rounded shadow text-left">Resposta oberta</button>
            <button onClick={() => addNode('final')} className="w-full bg-white p-2 rounded shadow text-left">Fi del flux</button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
            onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
            onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
            onNodeClick={(_, node) => setSelectedNode(node)}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>

        {/* Panell de configuració del node seleccionat */}
        <div className="w-80 shrink-0 border-l">
          <NodeSettings
            node={selectedNode}
            onChange={handleNodeChange}
            onDelete={handleDeleteNode}
          />
        </div>
      </div>
    </div>
  );
};

export default FlowBuilder;
