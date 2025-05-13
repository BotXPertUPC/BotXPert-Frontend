// src/pages/FlowBuilder.tsx
import React, { useState, useCallback, useEffect, useImperativeHandle } from 'react';
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
import RespostaNode from '../components/nodes/respostaNode';
import ImageNode from '../components/nodes/imageNode';
import NodeSettings from '../components/nodeSettings';
import { flowService } from '../services/flowService';

const nodeTypes = {
  inici: StartNode,
  missatge: MessageNode,
  pregunta: QuestionNode,
  resposta: RespostaNode,
  imatge: ImageNode,
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

const FlowBuilder = React.forwardRef((props: { botflowId?: number }, ref) => {
  const { botflowId } = props;
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    getNodes: () => nodes,
    getEdges: () => edges,
    setNodes: (newNodes: Node[]) => setNodes(newNodes),
    setEdges: (newEdges: Edge[]) => setEdges(newEdges)
  }));

  // Wrapped 'showToast' in useCallback to prevent it from changing on every render
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const { setCenter } = useReactFlow();

  const [connectOption, setConnectOption] = useState<{
    nodeId: string;
    optionIndex: number;
  } | null>(null);

  /* ---------- Helpers ---------- */
  const hasOutgoingEdge = useCallback(
    (id: string) => edges.some((e) => e.source === id),
    [edges],
  );

  const handleOptionConnect = (fromNodeId: string, optionIndex: number, type: string) => {
    const newId = String(nodeId);
    const fromNode = nodes.find((n) => n.id === fromNodeId);
    if (!fromNode) return;
   
    // Verificar si el nodo origen es un nodo final
    if (fromNode.type === 'final') {
      showToast('No se pueden crear conexiones desde un nodo final.');
      return;
    }
 
    const newNode: Node = {
      id: newId,
      type,
      position: {
        x: fromNode.position.x + 300,
        y: fromNode.position.y + optionIndex * 120 + 40,
      },
      data: {
        text: '',
        id: newId,
        ...(type === 'pregunta' && {
          options: ['Opció 1', 'Opció 2'],
          connections: {},
          onConnectOption: handleOptionConnect,
          setConnectOption,
          connectOption,
        }),
      },
    };
 
    // Actualizar el nodo origen con la nueva conexión
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === fromNodeId) {
          // Preservar todas las conexiones existentes y añadir la nueva
          const currentConnections = n.data.connections || {};
          return {
            ...n,
            data: {
              ...n.data,
              connections: {
                ...currentConnections,
                [optionIndex]: newId,
              },
              onConnectOption: handleOptionConnect,
              setConnectOption,
              connectOption,
            },
          };
        }
        return n;
      }).concat(newNode)
    );
 
    setEdges((eds) => [
      ...eds,
      {
        id: `e${fromNodeId}-${newId}`,
        source: fromNodeId,
        target: newId,
        type: 'custom',
        sourceHandle: `option-${optionIndex}`,
      },
    ]);
 
    setNodeId((id) => id + 1);
    setSelectedNodeId(newId);
  };


  /* ---------- Afegir node fill (només un per pare) ---------- */
  const addNode = (type: string, sourceNodeId: string) => {
    const source = nodes.find((n) => n.id === sourceNodeId);
    if (!source) return;


    // Verificar si el nodo origen es un nodo final
    // Los nodos finales NO deben tener ningún tipo de nodo conectado a ellos
    if (source.type === 'final') {
      showToast('No se pueden crear nodos a partir de un nodo final. Los nodos finales deben ser terminales.');
      return;
    }


    if (!connectOption && source.type === 'pregunta') {
      return;
    }


    // Validaciones para nodos finales
    if (type === 'final') {
      // Verificar si ya existe un nodo final que viene del mismo nodo origen
      const alreadyHasFinalNode = nodes
        .filter(node => node.type === 'final')
        .some(node => edges.some(edge => edge.source === sourceNodeId && edge.target === node.id));
     
      if (alreadyHasFinalNode) {
        showToast('Este nodo ya tiene un nodo final conectado.');
        return;
      }
     
      // Verificar que el nodo origen está conectado al flujo (tiene entrada)
      const isNodeConnected = sourceNodeId === ROOT_ID || edges.some(edge => edge.target === sourceNodeId);
      if (!isNodeConnected) {
        showToast('No puedes crear un nodo final desde un nodo sin conexión de entrada.');
        return;
      }
    }


    const newId = String(nodeId);


    const newNode: Node = {
      id: newId,
      type,
      position: {
        x: source.position.x + 300,
        y: source.position.y + 100 + Math.random() * 100,
      },
      data: {
        text: '',
        id: newId,
        options: type === 'pregunta' ? ['Opció 1', 'Opció 2'] : undefined,
        connections: type === 'pregunta' ? {} : undefined,
        ...(type === 'imatge' && {
          imageUrl: '',
          altText: '',
        }),
        onConnectOption: handleOptionConnect,
        setConnectOption,
        connectOption,
        onChange: (updatedData: any) => {
          setNodes((nds) =>
            nds.map((n) => (n.id === newId ? { ...n, data: { ...n.data, ...updatedData } } : n))
          );
        },
      },
    };


    setNodes((nds) => [...nds, newNode]);


    // 👉 Decide si ve d'una opció d'una pregunta
    if (connectOption) {
      const { nodeId: fromId, optionIndex } = connectOption;
  
      setEdges((eds) => [
        ...eds,
        {
          id: `e${fromId}-${newId}`,
          source: fromId,
          sourceHandle: `option-${optionIndex}`,
          target: newId,
          type: 'custom',
        },
      ]);
  
      // Assigna la connexió a la opció concreta
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === fromId) {
            return {
              ...n,
              data: {
                ...n.data,
                connections: {
                  ...(n.data.connections || {}),
                  [optionIndex]: newId,
                },
              },
            };
          }
          return n;
        })
      );
  
      setConnectOption(null); // Netegem després d’afegir
    } else {
      // Flux normal, node correlatiu
      setEdges((eds) => [
        ...eds,
        {
          id: `e${sourceNodeId}-${newId}`,
          source: sourceNodeId,
          target: newId,
          type: 'custom',
        },
      ]);
    }


    setCenter(
      newNode.position.x + 125, // centrem sobre la meitat del node (ample aprox)
      newNode.position.y + 50,  // centrem una mica més avall per quedar centrat verticalment
      {
        zoom: 1, // opcional, pots ajustar-ho segons vulguis
        duration: 1500, // animació suau
      }
    );
   
    setNodeId((id) => id + 1);
    selectNode(newId);
  };


  // Wrapped 'deleteNode' in useCallback to prevent it from changing on every render
  const deleteNode = useCallback((nodeId: string) => {
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
  }, [edges, hasOutgoingEdge, nodes, setCenter, showToast]);


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
  }, [selectedNodeId, nodes, edges, deleteNode]);
 
 
 
  useEffect(() => {
    const rootNodeExists = nodes.some((n) => n.id === ROOT_ID);
    if (!selectedNodeId && rootNodeExists) {
      selectNode(ROOT_ID);
    }
  }, [selectedNodeId, nodes]);

  // Cargar datos al iniciar si hay botflowId
  useEffect(() => {
    if (botflowId) {
      loadFlowData(botflowId);
    }
  }, [botflowId]);

  // Función para cargar datos del backend
  const loadFlowData = async (botflowId: number) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const backendNodes = await flowService.loadFlowNodes(botflowId);
      
      // Solo reemplazar los nodos si obtenemos datos válidos del backend
      if (backendNodes && Array.isArray(backendNodes) && backendNodes.length > 0) {
        // Aquí convertimos los nodos del backend al formato de ReactFlow
        const reactFlowNodes: Node[] = [];
        const reactFlowEdges: Edge[] = [];
        
        // Crear un mapa para convertir los tipos del backend a ReactFlow
        const nodeTypeMap: Record<string, string> = {
          'START': 'inici',
          'TEXT': 'missatge', // Por defecto, puede cambiar según el contenido
          'LIST': 'pregunta',
          'END': 'final'
        };
        
        // Procesar cada nodo del backend
        backendNodes.forEach((backendNode: any) => {
          // Determinar el tipo real basado en contenido o metadata
          let nodeType = nodeTypeMap[backendNode.type] || 'missatge';
          let nodeData: any = { text: backendNode.text || '' };
          
          // Procesar nodos de tipo TEXT para detectar imágenes
          if (backendNode.type === 'TEXT' && backendNode.text) {
            try {
              const jsonData = JSON.parse(backendNode.text);
              if (jsonData.type === 'image') {
                nodeType = 'imatge';
                nodeData = {
                  imageUrl: jsonData.url || '',
                  altText: jsonData.alt || ''
                };
              }
            } catch (e) {
              // Si no es JSON, es texto normal
            }
          }
          
          // Si es un nodo de pregunta, configurar opciones
          if (backendNode.type === 'LIST') {
            nodeType = 'pregunta';
            nodeData = {
              text: backendNode.list_header || '',
              options: [], // Se añadirán según las opciones de la lista
              connections: {}
            };
            
            // Procesar opciones si existen
            if (backendNode.list_options && Array.isArray(backendNode.list_options)) {
              nodeData.options = backendNode.list_options.map((opt: any) => opt.label);
              
              // Crear conexiones para cada opción
              backendNode.list_options.forEach((opt: any, idx: number) => {
                if (opt.target_node) {
                  nodeData.connections[idx] = String(opt.target_node);
                  
                  // Crear borde para esta conexión
                  reactFlowEdges.push({
                    id: `e${backendNode.id}-${opt.target_node}`,
                    source: String(backendNode.id),
                    target: String(opt.target_node),
                    sourceHandle: `option-${idx}`,
                    type: 'custom'
                  });
                }
              });
            }
          }
          
          // Crear el nodo de ReactFlow
          reactFlowNodes.push({
            id: String(backendNode.id),
            type: nodeType,
            position: {
              x: backendNode.position_x || 100,
              y: backendNode.position_y || 100
            },
            data: {
              ...nodeData,
              id: String(backendNode.id),
              onConnectOption: handleOptionConnect,
              setConnectOption,
              connectOption
            }
          });
          
          // Si tiene next_node, crear una conexión
          if (backendNode.next_node && backendNode.type !== 'LIST') {
            reactFlowEdges.push({
              id: `e${backendNode.id}-${backendNode.next_node}`,
              source: String(backendNode.id),
              target: String(backendNode.next_node),
              type: 'custom'
            });
          }
        });
        
        // Actualizar estado con los nuevos nodos y bordes
        if (reactFlowNodes.length > 0) {
          setNodes(reactFlowNodes);
          setEdges(reactFlowEdges);
          
          // Actualizar el contador de nodeId al máximo id + 1
          const maxId = Math.max(...reactFlowNodes.map(node => parseInt(node.id)));
          setNodeId(maxId + 1);
        }
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      setLoadError("No se pudieron cargar los datos del flujo.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-blue-600 font-medium">Cargando flujo...</p>
          </div>
        </div>
      )}
      
      {loadError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow z-50">
          {loadError}
        </div>
      )}

      <main className="flex h-screen">
        {/* Sidebar esquerra amb botons */}
        <div className="w-72 bg-white border-r p-6 space-y-4">
          <p className="text-base font-semibold text-gray-700 mb-4">Afegeix node</p>
          {Object.entries(nodeTypes)
            .filter(([key, NodeComponent]) => NodeComponent.metadata.visible)
            .map(([key, NodeComponent]) => {
              // Obtener el nodo seleccionado para verificaciones adicionales
              const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
             
              // Deshabilitar el botón si estamos intentando agregar un nodo a un nodo final
              const isDisabled = selectedNode?.type === 'final';
             
              return (
                <button
                  key={NodeComponent.metadata.type}
                  onClick={() => selectedNodeId && addNode(NodeComponent.metadata.type, selectedNodeId)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-base bg-white border border-gray-300 shadow-sm
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} transition`}
                  disabled={isDisabled}
                >
                  {NodeComponent.metadata.icon} {NodeComponent.metadata.name}
                </button>
              );
            })}
        </div>


        {/* Diagrama central */}
        <div className="flex-1 bg-white rounded-lg p-0 shadow-sm relative h-full">
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


        {/* Toast d'error */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow z-50 animate-fadeIn">
            {toast}
          </div>
        )}
      </main>
    </div>
  );
});


const ConfigTab = () => (
  <ReactFlowProvider>
    <FlowBuilder />
  </ReactFlowProvider>
);


export default ConfigTab;


export { FlowBuilder };