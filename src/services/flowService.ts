import api from "../api";
import { Node, Edge } from "reactflow";

// Interfaces para mapear entre ReactFlow y el backend
interface BackendNode {
  id: number;
  bot_flow: number;
  type: string;
  text?: string;
  position_x: number;
  position_y: any;
  list_header?: string;
  next_node?: number | null;
}

// Función para convertir nodos y bordes de ReactFlow al formato del backend
export const convertFlowToBackendFormat = (
  nodes: Node[],
  edges: Edge[],
  botflowId: number
): BackendNode[] => {
  return nodes.map((node) => {
    // Encontrar el siguiente nodo basado en las conexiones
    let nextNodeId: number | null = null;

    // Si no es un nodo de pregunta, busca conexiones directas
    if (node.type !== "pregunta") {
      const outgoingEdge = edges.find((edge) => edge.source === node.id);
      nextNodeId = outgoingEdge ? parseInt(outgoingEdge.target) : null;
    }

    // Mapear tipo de nodo ReactFlow al formato backend
    const nodeTypeMap: Record<string, string> = {
      inici: "START",
      missatge: "TEXT",
      pregunta: "LIST",
      resposta: "TEXT",
      imatge: "TEXT", // Tratar imágenes como texto con URL
      final: "END",
    };

    // Preparar texto basado en el tipo de nodo
    let text = node.data?.text || "";

    // Para nodos de imagen, incluir la URL y texto alternativo
    if (node.type === "imatge") {
      text = JSON.stringify({
        url: node.data?.imageUrl || "",
        alt: node.data?.altText || "",
        type: "image",
      });
    }

    // Para nodos de pregunta, usar el texto como encabezado y gestionar opciones aparte
    let listHeader = node.type === "pregunta" ? text : undefined;

    return {
      id: parseInt(node.id),
      bot_flow: botflowId,
      type: nodeTypeMap[node.type as string] || "TEXT",
      text: node.type !== "pregunta" ? text : undefined,
      position_x: node.position.x,
      position_y: node.position.y,
      list_header: listHeader,
      next_node: nextNodeId,
    };
  });
};

// Función auxiliar para limpiar nodos antes de guardarlos - Commented out as it's unused
// Marking with @unused tag to indicate it may be used in the future
/** @unused */
const cleanNodeForStorage = (node: any) => {
  // Creamos una copia limpia del nodo sin referencias circulares
  const {
    id,
    type,
    position,
    data,
  } = node;

  // Extraemos solo las propiedades seguras de data
  let cleanData: any = {};
  if (data) {
    // Solo copia propiedades serializables
    if (data.text !== undefined) cleanData.text = data.text;
    if (data.imageUrl !== undefined) cleanData.imageUrl = data.imageUrl;
    if (data.altText !== undefined) cleanData.altText = data.altText;
    if (data.options) cleanData.options = [...data.options];
    if (data.connections) cleanData.connections = { ...data.connections };
    if (data.label && typeof data.label !== 'object') cleanData.label = data.label;
  }

  return {
    id,
    type,
    position: {
      x: position.x,
      y: position.y
    },
    data: cleanData
  };
};

// Función para generar un ID único y aleatorio para un nodo
const generateUniqueNodeId = (): number => {
  // Generar un número entre 100,000 y 10,000,000 para minimizar las probabilidades de colisión
  return Math.floor(Math.random() * 9900000) + 100000;
};

// Servicio para gestionar las operaciones del flujo
export const flowService = {
  // Guardar los nodos en el backend
  saveFlowNodes: async (nodes: Node[], edges: Edge[], botflowId: number) => {
    try {
      // Identificar el nodo de inicio
      const startNode = nodes.find(node => node.type === 'inici');
      if (!startNode) {
        console.warn("No se encontró un nodo de inicio. Se recomienda tener uno.");
      }
      
      // 1. Limpiar nodos existentes
      try {
        const existingResponse = await api.get(`/api/botflows/${botflowId}/nodes/`);
        const existingNodes = existingResponse.data || [];
        
        // Eliminar referencias entre nodos primero
        for (const node of existingNodes) {
          if (node.next_node) {
            await api.put(`/api/nodes/${node.id}/`, {
              ...node,
              next_node: null
            });
          }
        }
        
        // También eliminar las opciones de lista existentes
        try {
          const listOptionsResponse = await api.get('/api/list-options/');
          const listOptions = listOptionsResponse.data || [];
          
          // Filtrar opciones que pertenecen a nodos de este botflow
          const relevantOptions = listOptions.filter((option: any) => {
            const nodeId = option.node;
            // Comprueba si este nodo pertenece al botflow actual
            return existingNodes.some((node: any) => node.id === nodeId);
          });
          
          // Eliminar opciones de lista
          for (const option of relevantOptions) {
            await api.delete(`/api/list-options/${option.id}/`);
            console.log(`Deleted list option ${option.id}`);
          }
        } catch (listError) {
          console.warn("Error cleaning list options:", listError);
        }
        
        // Luego eliminar los nodos
        for (const node of existingNodes) {
          await api.delete(`/api/nodes/${node.id}/`);
        }
      } catch (e) {
        console.warn("Error al limpiar nodos:", e);
      }
      
      // 2. Crear nodos SIN relaciones primero
      // Generate sequential IDs for nodes
      const nodesData = nodes.map((node, index) => {
        let text = node.data?.text || "";
        
        if (node.type === "imatge") {
          text = JSON.stringify({
            url: node.data?.imageUrl || "",
            alt: node.data?.altText || "",
            type: "image",
          });
        }
        
        // Include a proper ID starting from 1 for the first node
        return {
          id: index + 1, // Explicitly create sequential IDs starting from 1
          bot_flow: botflowId,
          type: mapNodeTypeToBackend(node.type || 'missatge'),
          text: node.type !== 'pregunta' ? text : undefined,
          position_x: node.position.x,
          position_y: node.position.y,
          list_header: node.type === 'pregunta' ? text : undefined,
          next_node: null // Sin relaciones inicialmente
        };
      });
      
      // Debugging - Check what we're sending
      console.log("Sending nodes data:", JSON.stringify(nodesData, null, 2));
      
      // Crear nodos uno por uno
      // First check if we need to delete nodes with existing IDs
      try {
        for (let i = 1; i <= nodesData.length; i++) {
          try {
            // Try to delete any existing node with this ID
            await api.delete(`/api/nodes/${i}/`);
            console.log(`Deleted existing node with ID ${i} if it existed`);
          } catch (error) {
            // Ignore errors - node might not exist
          }
        }
      } catch (error) {
        console.warn("Error pre-cleaning nodes:", error);
      }
      
      // Now create nodes with specified IDs
      for (const nodeData of nodesData) {
        try {
          // Create node with specified ID
          await api.post(`/api/nodes/`, nodeData);
          console.log(`Created node with ID ${nodeData.id} successfully`);
        } catch (nodeError: unknown) {
          // Type guard for Axios error objects
          const isAxiosError = (error: any): error is { response?: { data?: any; status?: number } } => {
            return error && typeof error === 'object' && 'response' in error;
          };
          
          // Safely log error details with type checking
          if (isAxiosError(nodeError)) {
            console.error(`Error creating node ${nodeData.id}:`, 
                          nodeError.response?.data || "No response data", 
                          `Status: ${nodeError.response?.status}`);
            
            // Try PUT instead of POST if it's a conflict error
            if (nodeError.response?.status === 400) {
              try {
                console.log(`Trying PUT instead for node ${nodeData.id}`);
                await api.put(`/api/nodes/${nodeData.id}/`, nodeData);
                console.log(`Updated node ${nodeData.id} successfully`);
              } catch (putError) {
                console.error(`PUT also failed for node ${nodeData.id}:`, putError);
              }
            }
          } else {
            console.error("Error object:", nodeError);
          }
        }
      }
      
      // 3. Actualizar relaciones
      try {
        // Refresh nodes from server to get actual IDs that were assigned
        const allNodesResponse = await api.get(`/api/botflows/${botflowId}/nodes/`);
        const allNodes = allNodesResponse.data;
        console.log("Retrieved nodes from server:", allNodes);
        
        // Create maps for node lookups
        const nodesByPosition = new Map();
        
        allNodes.forEach((node: any) => {
          // Round positions to account for floating point differences
          const posKey = `${Math.round(node.position_x)}-${Math.round(node.position_y)}`;
          nodesByPosition.set(posKey, node);
        });
        
        // Actualizar relaciones una por una
        for (const edge of edges) {
          // Find source and target nodes from original React Flow
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          
          if (!sourceNode || !targetNode) {
            console.warn(`Edge refers to non-existent nodes: ${edge.source} -> ${edge.target}`);
            continue;
          }
          
          // Skip list/question nodes - they have special handling
          if (sourceNode.type === 'pregunta') {
            console.log(`Skipping edge from question node: ${edge.source} -> ${edge.target}`);
            continue;
          }
          
          // Find nodes by position
          const sourcePositionKey = `${Math.round(sourceNode.position.x)}-${Math.round(sourceNode.position.y)}`;
          const targetPositionKey = `${Math.round(targetNode.position.x)}-${Math.round(targetNode.position.y)}`;
          
          const backendSourceNode = nodesByPosition.get(sourcePositionKey);
          const backendTargetNode = nodesByPosition.get(targetPositionKey);
          
          if (!backendSourceNode) {
            console.warn(`Source node not found at position ${sourcePositionKey}`);
            continue;
          }
          
          if (!backendTargetNode) {
            console.warn(`Target node not found at position ${targetPositionKey}`);
            continue;
          }
          
          // Try to update relation
          try {
            await api.put(`/api/nodes/${backendSourceNode.id}/`, {
              ...backendSourceNode,
              next_node: backendTargetNode.id
            });
            console.log(`Updated relation: ${backendSourceNode.id} -> ${backendTargetNode.id}`);
          } catch (updateError) {
            console.error(`Failed to update relation for node ${backendSourceNode.id}:`, updateError);
          }
        }
        
        // 4. Crear opciones de lista para nodos de pregunta
        const questionNodes = nodes.filter(node => node.type === 'pregunta');
        console.log(`Processing ${questionNodes.length} question nodes`);
        
        // Map para buscar nodos por posición original
        const nodeIdMap = new Map();
        nodes.forEach((node, index) => {
          const nodeId = index + 1; // Same ID scheme as node creation
          const posKey = `${Math.round(node.position.x)}-${Math.round(node.position.y)}`;
          nodeIdMap.set(posKey, nodeId);
        });
        
        // Crear opciones de lista para cada nodo de pregunta
        for (const questionNode of questionNodes) {
          // Encontrar el ID del backend para este nodo
          const posKey = `${Math.round(questionNode.position.x)}-${Math.round(questionNode.position.y)}`;
          const backendNodeId = nodesByPosition.get(posKey)?.id;
          
          if (!backendNodeId) {
            console.warn(`Backend node not found for question node at position ${posKey}`);
            continue;
          }
          
          const options = questionNode.data?.options || [];
          const connections = questionNode.data?.connections || {};
          
          console.log(`Creating ${options.length} options for node ${backendNodeId}:`, connections);
          
          // Crear cada opción
          for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const targetNodeId = connections[i];
            
            if (!targetNodeId) {
              console.log(`Option ${i} has no target`);
              continue;
            }
            
            // Encontrar el nodo destino
            const targetNode = nodes.find(n => n.id === targetNodeId);
            if (!targetNode) {
              console.warn(`Target node ${targetNodeId} not found`);
              continue;
            }
            
            // Buscar el ID del backend para el nodo destino
            const targetPosKey = `${Math.round(targetNode.position.x)}-${Math.round(targetNode.position.y)}`;
            const backendTargetNode = nodesByPosition.get(targetPosKey);
            
            if (!backendTargetNode) {
              console.warn(`Backend target node not found at position ${targetPosKey}`);
              continue;
            }
            
            // Crear la opción de lista
            try {
              await api.post('/api/list-options/', {
                node: backendNodeId,
                label: option,
                target_node: backendTargetNode.id
              });
              console.log(`Created option "${option}" for node ${backendNodeId} -> target ${backendTargetNode.id}`);
            } catch (optionError) {
              console.error(`Failed to create list option:`, optionError);
            }
          }
        }
      } catch (relationsError) {
        console.error("Error updating node relations:", relationsError);
      }
      
      return true;
    } catch (error: any) {
      console.error("Error guardando flujo:", error);
      // Log more detailed error information
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  },

  // Cargar los nodos desde el backend
  loadFlowNodes: async (botflowId: number) => {
    try {
      const response = await api.get(`/api/botflows/${botflowId}/nodes/`);
      return response.data;
    } catch (error) {
      console.error("Error cargando nodos:", error);
      throw error;
    }
  }
};

// Función auxiliar para mapear tipos de nodo de ReactFlow al backend
function mapNodeTypeToBackend(type: string): string {
  switch (type) {
    case 'inici': return 'START';
    case 'final': return 'END';
    case 'pregunta': return 'LIST';
    case 'imatge': return 'TEXT'; // Las imágenes se tratan como TEXT con formato especial
    case 'missatge': return 'TEXT';
    case 'resposta': return 'TEXT';
    default: return 'TEXT';
  }
}
