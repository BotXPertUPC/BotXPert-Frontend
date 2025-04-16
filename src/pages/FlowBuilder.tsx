// src/pages/FlowBuilder.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
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
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';


import StartNode from '../components/nodes/startNode';
import MessageNode from '../components/nodes/messageNode';
import QuestionNode from '../components/nodes/questionNode';
import FinalNode from '../components/nodes/finalNode';
import CondicionalNode from '../components/nodes/condicionalNode';
import RespostaNode from '../components/nodes/respostaNode';
import NodeSettings from '../components/nodeSettings';

const nodeTypes = {
  inici: StartNode,
  missatge: MessageNode,
  pregunta: QuestionNode,
  condicional: CondicionalNode,
  resposta: RespostaNode,
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
      type: 'inici',
      position: { x: 100, y: 100 },
      data: { label: <p>Inici</p> },
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeId, setNodeId] = useState(2);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const { setCenter } = useReactFlow();

  /* ---------- Helpers ---------- */
  const hasOutgoingEdge = useCallback(
    (id: string) => edges.some((e) => e.source === id),
    [edges],
  );

  /* ---------- Afegir node fill (només un per pare) ---------- */
  const addNode = (type: string, sourceNodeId: string) => {
    // No fem res si no tenim ID vàlid
    if (!sourceNodeId) return;
  
    const source = nodes.find((n) => n.id === sourceNodeId);
    if (!source) return;
  
    // Tipus de node que no poden tenir fills
    const noChildTypes = ['final'];
  
    // No permetem afegir si el tipus del node pare és d’aquests
    if (noChildTypes.includes(source.type || "")) return;
  
    // Si ja té una sortida, tampoc deixem afegir-hi més
    if (hasOutgoingEdge(sourceNodeId)) return;
  
    const newNode: Node = {
      id: String(nodeId),
      type,
      position: {
        x: source.position.x + 320,
        y: source.position.y + 100,
      },
      data: {
        label: `Nou estat: ${type}`,
        text: '',
        options: type === 'pregunta' ? ['Opció 1', 'Opció 2'] : [],
      },
    };
  
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [
      ...eds,
      {
        id: `e${sourceNodeId}-${nodeId}`,
        source: sourceNodeId,
        target: String(nodeId),
        type: 'custom',
      },
    ]);
    setCenter(
      newNode.position.x + 125, // centrem sobre la meitat del node (ample aprox)
      newNode.position.y + 50,  // centrem una mica més avall per quedar centrat verticalment
      {
        zoom: 1, // opcional, pots ajustar-ho segons vulguis
        duration: 1500, // animació suau
      }
    );
    setNodeId((id) => id + 1);
    selectNode(String(nodeId));
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === ROOT_ID || hasOutgoingEdge(nodeId)) {
      showToast("No pots esborrar aquest node.");
      return;
    }
  
    const parentEdge = edges.find((e) => e.target === nodeId);
    const parentNodeId = parentEdge ? parentEdge.source : null;
  
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  
    if (parentNodeId) {
      const parentNode = nodes.find((n) => n.id === parentNodeId);
      if (parentNode) {
        setCenter(
          parentNode.position.x + 125,
          parentNode.position.y + 50,
          { zoom: 1, duration: 1500 }
        );
      }
    }
  
    selectNode(parentNodeId);
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
  
    const selectNode = (nodeId: string | null) => {
      setSelectedNodeId(nodeId);
    
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === nodeId,
        }))
      );
    };
    
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Si el focus està en un input, textarea o select, no fem res
        const tag = (e.target as HTMLElement).tagName.toLowerCase();
        if (['input', 'textarea', 'select'].includes(tag)) return;
    
        // Si s'ha premut Delete o Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (!selectedNodeId) return;
          deleteNode(selectedNodeId);
        }
      };
    
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeId, nodes, edges]);
    
    
    
  useEffect(() => {
    const rootNodeExists = nodes.some((n) => n.id === ROOT_ID);
    if (!selectedNodeId && rootNodeExists) {
      selectNode(ROOT_ID);
    }
  }, [selectedNodeId, nodes]);
  

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex h-screen">
      {/* Sidebar esquerra amb botons */}
      <div className="w-56 bg-white border-r p-4 space-y-2">
        <p className="text-sm font-semibold text-gray-700 mb-2">Afegeix node</p>
        {['missatge', 'pregunta', 'condicional', 'resposta', 'final'].map((type) => (
          <button
            key={type}
            onClick={() => selectedNodeId && addNode(type, selectedNodeId)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm bg-white border border-gray-300 shadow-sm hover:bg-gray-100 transition"
          >
            {type === 'missatge' && '💬 Missatge'}
            {type === 'pregunta' && '❓ Pregunta'}
            {type === 'condicional' && '🔀 Condicional'}
            {type === 'resposta' && '✍️ Resposta'}
            {type === 'final' && '🏁 Final'}
          </button>
        ))}
      </div>

      {/* Diagrama central */}
      <div className="flex-1 bg-white rounded-lg p-6 shadow-sm relative h-full">
        <ReactFlow
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onNodeClick={(_, node) => selectNode(node.id)}
          onNodeDragStart={(_, node) => selectNode(node.id)}
          fitView
          deleteKeyCode={null} // Disable default delete key behavior
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Panell de configuració dret */}
      {selectedNodeId && (
        <div className="w-80 bg-white border-l p-4 shadow h-full overflow-y-auto">
          <NodeSettings
            node={nodes.find((n) => n.id === selectedNodeId) || null}
            onChange={(updatedNode) =>
              setNodes((nds) =>
                nds.map((n) => (n.id === updatedNode.id ? updatedNode : n))
              )
            }
            onDelete={deleteNode}
          />
        </div>
      )}
    </main>

    </div>
  );
};

const ConfigTab = () => (
  <ReactFlowProvider>
    <FlowBuilder />
  </ReactFlowProvider>
);

export default ConfigTab;

