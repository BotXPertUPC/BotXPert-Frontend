import api from "../api";
import { Node, Edge } from "reactflow";

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

export const convertFlowToBackendFormat = (
  nodes: Node[],
  edges: Edge[],
  botflowId: number
): BackendNode[] => {
  return nodes.map((node) => {
    let nextNodeId: number | null = null;

    if (node.type !== "pregunta") {
      const outgoingEdge = edges.find((edge) => edge.source === node.id);
      nextNodeId = outgoingEdge ? parseInt(outgoingEdge.target) : null;
    }
    const nodeTypeMap: Record<string, string> = {
      inici: "START",
      missatge: "TEXT",
      pregunta: "LIST",
      resposta: "TEXT",
      imatge: "TEXT", 
      final: "END",
    };

    let text = node.data?.text || "";

    if (node.type === "imatge") {
      text = JSON.stringify({
        url: node.data?.imageUrl || "",
        alt: node.data?.altText || "",
        type: "image",
      });
    }

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


export const flowService = {
  saveFlowNodes: async (nodes: Node[], edges: Edge[], botflowId: number) => {
    try {
      const startNode = nodes.find(node => node.type === 'inici');
      if (!startNode) {
        console.warn("No se encontró un nodo de inicio. Se recomienda tener uno.");
      }
      
      try {
        const existingResponse = await api.get(`botflows/${botflowId}/nodes/`);
        const existingNodes = existingResponse.data || [];
        
        for (const node of existingNodes) {
          if (node.next_node) {
            await api.put(`nodes/${node.id}/`, {
              ...node,
              next_node: null
            });
          }
        }
        
        try {
          const listOptionsResponse = await api.get('list-options/');
          const listOptions = listOptionsResponse.data || [];
          
          const relevantOptions = listOptions.filter((option: any) => {
            const nodeId = option.node;
            return existingNodes.some((node: any) => node.id === nodeId);
          });
          
          for (const option of relevantOptions) {
            await api.delete(`list-options/${option.id}/`);
          }
        } catch (listError) {
          console.warn("Error cleaning list options:", listError);
        }
        
        for (const node of existingNodes) {
          await api.delete(`nodes/${node.id}/`);
        }
      } catch (e) {
        console.warn("Error al limpiar nodos:", e);
      }
      
      const nodesData = nodes.map((node, index) => {
        let text = node.data?.text || "";
        
        if (node.type === "imatge") {
          text = JSON.stringify({
            url: node.data?.imageUrl || "",
            alt: node.data?.altText || "",
            type: "image",
          });
        }
        
        return {
          id: index + 1,
          bot_flow: botflowId,
          type: mapNodeTypeToBackend(node.type || 'missatge'),
          text: node.type !== 'pregunta' ? text : undefined,
          position_x: node.position.x,
          position_y: node.position.y,
          list_header: node.type === 'pregunta' ? text : undefined,
          next_node: null
        };
      });
      
      try {
        for (let i = 1; i <= nodesData.length; i++) {
          try {
            await api.delete(`nodes/${i}/`);
          } catch (error) {
            // Ignore errors - node might not exist
          }
        }
      } catch (error) {
        console.warn("Error pre-cleaning nodes:", error);
      }
      
      for (const nodeData of nodesData) {
        try {
          await api.post(`nodes/`, nodeData);
        } catch (nodeError: unknown) {
          const isAxiosError = (error: any): error is { response?: { data?: any; status?: number } } => {
            return error && typeof error === 'object' && 'response' in error;
          };
          
          if (isAxiosError(nodeError)) {
            console.error(`Error creating node ${nodeData.id}:`, 
                          nodeError.response?.data || "No response data", 
                          `Status: ${nodeError.response?.status}`);
            
            if (nodeError.response?.status === 400) {
              try {
                await api.put(`nodes/${nodeData.id}/`, nodeData);
              } catch (putError) {
                console.error(`PUT also failed for node ${nodeData.id}:`, putError);
              }
            }
          } else {
            console.error("Error object:", nodeError);
          }
        }
      }
      
      try {
        const allNodesResponse = await api.get(`botflows/${botflowId}/nodes/`);
        const allNodes = allNodesResponse.data;
        
        const nodesByPosition = new Map();
        
        allNodes.forEach((node: any) => {
          const posKey = `${Math.round(node.position_x)}-${Math.round(node.position_y)}`;
          nodesByPosition.set(posKey, node);
        });
        
        for (const edge of edges) {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          
          if (!sourceNode || !targetNode) {
            console.warn(`Edge refers to non-existent nodes: ${edge.source} -> ${edge.target}`);
            continue;
          }
          
          if (sourceNode.type === 'pregunta') {
            console.log(`Skipping edge from question node: ${edge.source} -> ${edge.target}`);
            continue;
          }
          
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
          
          try {
            await api.put(`nodes/${backendSourceNode.id}/`, {
              ...backendSourceNode,
              next_node: backendTargetNode.id
            });
          } catch (updateError) {
            console.error(`Failed to update relation for node ${backendSourceNode.id}:`, updateError);
          }
        }
        
        const questionNodes = nodes.filter(node => node.type === 'pregunta');
        
        const nodeIdMap = new Map();
        nodes.forEach((node, index) => {
          const nodeId = index + 1;
          const posKey = `${Math.round(node.position.x)}-${Math.round(node.position.y)}`;
          nodeIdMap.set(posKey, nodeId);
        });
        
        for (const questionNode of questionNodes) {
          const posKey = `${Math.round(questionNode.position.x)}-${Math.round(questionNode.position.y)}`;
          const backendNodeId = nodesByPosition.get(posKey)?.id;
          
          if (!backendNodeId) {
            console.warn(`Backend node not found for question node at position ${posKey}`);
            continue;
          }
          
          const options = questionNode.data?.options || [];
          const connections = questionNode.data?.connections || {};
                    
          for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const targetNodeId = connections[i];
            
            if (!targetNodeId) {
              continue;
            }
            
            const targetNode = nodes.find(n => n.id === targetNodeId);
            if (!targetNode) {
              console.warn(`Target node ${targetNodeId} not found`);
              continue;
            }
            
            const targetPosKey = `${Math.round(targetNode.position.x)}-${Math.round(targetNode.position.y)}`;
            const backendTargetNode = nodesByPosition.get(targetPosKey);
            
            if (!backendTargetNode) {
              console.warn(`Backend target node not found at position ${targetPosKey}`);
              continue;
            }
            
            try {
              await api.post('list-options/', {
                node: backendNodeId,
                label: option,
                target_node: backendTargetNode.id
              });
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
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  },

  loadFlowNodes: async (botflowId: number) => {
    try {
      const response = await api.get(`botflows/${botflowId}/nodes/`);
      return response.data;
    } catch (error) {
      console.error("Error cargando nodos:", error);
      throw error;
    }
  }
};

function mapNodeTypeToBackend(type: string): string {
  switch (type) {
    case 'inici': return 'START';
    case 'final': return 'END';
    case 'pregunta': return 'LIST';
    case 'imatge': return 'TEXT'; 
    case 'missatge': return 'TEXT';
    case 'resposta': return 'ANSWER';
    default: return 'TEXT';
  }
}
