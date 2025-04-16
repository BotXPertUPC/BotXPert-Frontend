// src/pages/FlowBuilder.tsx
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Position,
  Connection,
  NodeChange,
  EdgeChange,
  NodeRemoveChange,
  NodeSelectionChange,
  getSmoothStepPath,
} from 'reactflow';
import 'reactflow/dist/style.css';

import MessageNode from '../components/nodes/messageNode';
import QuestionNode from '../components/nodes/questionNode';
import FinalNode from '../components/nodes/finalNode';

const nodeTypes = {
  missatge: MessageNode,
  pregunta: QuestionNode,
  final: FinalNode,
};

/* ---------- Aresta personalitzada amb fletxa ---------- */
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
}: {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g className="react-flow__edge">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="black" />
        </marker>
      </defs>
      <path
        id={id}
        d={edgePath}
        className="react-flow__edge-path"
        markerEnd="url(#arrowhead)"
        style={style}
      />
    </g>
  );
};

const edgeTypes = { custom: CustomEdge };
const ROOT_ID = '1';

const FlowBuilder = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: ROOT_ID,
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: <p>Inici</p> },
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeId, setNodeId] = useState(2);

  /* ---------- Helpers ---------- */
  const hasOutgoingEdge = useCallback(
    (id: string) => edges.some((e) => e.source === id),
    [edges],
  );

  /* ---------- Afegir node fill (només un per pare) ---------- */
  const addNode = (type: string, sourceNodeId: string) => {
    if (hasOutgoingEdge(sourceNodeId)) return; // ja té sortida

    const source = nodes.find((n) => n.id === sourceNodeId);
    const newNode: Node = {
      id: String(nodeId),
      type,
      position: source
        ? { x: source.position.x + 200, y: source.position.y }
        : { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `Nou estat: ${type}`,
        text: '',
        options: type === 'pregunta' ? ['Opció 1', 'Opció 2'] : [],
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [
      ...eds,
      { id: `e${sourceNodeId}-${nodeId}`, source: sourceNodeId, target: String(nodeId), type: 'custom' },
    ]);
    setNodeId((id) => id + 1);
  };

  /* ---------- Connexió drag‑and‑drop ---------- */
  const handleConnect = (params: Connection) => {
    if (!params.source || hasOutgoingEdge(params.source)) return;
    setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds));
  };

  /* ---------- Canvis de nodes ---------- */
  const handleNodesChange = (changes: NodeChange[]) => {
    /* 1. Bloquegem l'eliminació de l'arrel o dels nodes amb sortida  */
    const transformed: NodeChange[] = changes.map((c) => {
      if (
        c.type === 'remove' &&
        (c.id === ROOT_ID || hasOutgoingEdge(c.id))
      ) {
        /* Converteix el 'remove' en 'select' perquè no s'esborri */
        const sc: NodeSelectionChange = { id: c.id, type: 'select', selected: true };
        return sc;
      }
      return c;
    });

    setNodes((nds) => applyNodeChanges(transformed, nds));

    /* 2. Quins nodes s'han eliminat realment?  */
    const removedIds = changes
      .filter((c): c is NodeRemoveChange => c.type === 'remove')
      .map((c) => c.id)
      .filter((id) => id !== ROOT_ID && !hasOutgoingEdge(id));

    /* 3. Esborrem les arestes que tocaven els nodes eliminats */
    if (removedIds.length) {
      setEdges((eds) =>
        eds.filter(
          (e) => !removedIds.includes(e.source) && !removedIds.includes(e.target),
        ),
      );
    }
  };

  /* ---------- Canvis d'arestes: bloquejar 'remove' ---------- */
  const handleEdgesChange = (changes: EdgeChange[]) =>
    setEdges((eds) =>
      applyEdgeChanges(
        changes.filter((c) => c.type !== 'remove'), // ignorem 'remove'
        eds,
      ),
    );

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 max-w-7xl mx-auto px-4 py-0 space-y-6 flex h-screen">
        {/* --- Selector de tipus de node --- */}
        <div className="mb-4">
          <label
            htmlFor="nodeDropdown"
            className="block text-sm font-medium text-gray-700"
          >
            Add Node to Selected Node
          </label>
          <select
            id="nodeDropdown"
            size={6}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              const value = e.target.value;
              if (value && selectedNodeId) {
                addNode(value, selectedNodeId);
                e.target.value = '';
              }
            }}
            className="border rounded p-1 bg-white text-black z-50 relative"
          >
            <option value="">Afegeix un node</option>
            <option value="missatge">Missatge</option>
            <option value="pregunta">Pregunta amb opcions</option>
            <option value="condicional">Condicional</option>
            <option value="resposta">Resposta oberta</option>
            <option value="final">Fi del flux</option>
          </select>
        </div>

        {/* --- Canvas React‑Flow --- */}
        <div className="flex-1 bg-white rounded-lg p-6 shadow-sm relative h-full">
          <ReactFlow
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </main>
    </div>
  );
};

export default FlowBuilder;
