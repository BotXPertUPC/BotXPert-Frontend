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
import MessageNode from '../components/nodes/messageNode';
import QuestionNode from '../components/nodes/questionNode';

const FlowBuilder = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-0 space-y-6 flex h-screen">
        <div className="flex flex-col md:flex-row gap-6 w-full h-full">
          {/* Sidebar esquerra */}
          <div className="w-full md:w-1/4 bg-white rounded-lg p-6 shadow-sm h-full">
            <h2 className="text-lg font-semibold mb-4">Afegir estat</h2>
            <div className="space-y-2">
              <button onClick={() => addNode('missatge')} className="w-full bg-gray-100 p-2 rounded shadow text-left">Missatge</button>
              <button onClick={() => addNode('pregunta')} className="w-full bg-gray-100 p-2 rounded shadow text-left">Pregunta amb opcions</button>
              <button onClick={() => addNode('condicional')} className="w-full bg-gray-100 p-2 rounded shadow text-left">Condicional</button>
              <button onClick={() => addNode('resposta')} className="w-full bg-gray-100 p-2 rounded shadow text-left">Resposta oberta</button>
              <button onClick={() => addNode('final')} className="w-full bg-gray-100 p-2 rounded shadow text-left">Fi del flux</button>
            </div>
          </div>

          {/* React Flow Canvas */}
          <div className="flex-1 bg-white rounded-lg p-6 shadow-sm relative h-full">
            <ReactFlow
              nodeTypes={nodeTypes}
              nodes={nodes}
              edges={edges}
              onNodesChange={(changes) => {
                setTimeout(() => {
                  setNodes((nds) => {
                    return applyNodeChanges(
                      changes.map((change) => {
                        if (change.type === 'remove' && change.id === '1') {
                          return { ...change, type: 'select', selected: true }; // Evita que el nodo 'Inici' sea eliminado
                        }
                        return change;
                      }),
                      nds
                    );
                  });
                }, 0);
              }}
              onEdgesChange={(changes) => {
                setTimeout(() => {
                  setEdges((eds) => applyEdgeChanges(changes, eds));
                }, 0);
              }}
              onConnect={(params) => setEdges((eds) => addEdge(params, eds))}
              onNodeClick={(_, node) => setSelectedNode(node)}
              fitView
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlowBuilder;
