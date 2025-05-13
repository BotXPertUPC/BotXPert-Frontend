import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Bot, Save, Rocket } from 'lucide-react';
import { Node, Edge, ReactFlowProvider } from 'reactflow';
import { FlowBuilder } from './FlowBuilder';
import { useParams } from 'react-router-dom';
import { flowService } from '../services/flowService';

function CreateChatbot() {
  const { id } = useParams<{ id: string }>();
  const botflowId = parseInt(id || '0');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  
  const flowBuilderRef = useRef<{
    getNodes: () => Node[];
    getEdges: () => Edge[];
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
  }>(null);

  // Efecto para guardar automáticamente antes de cerrar la página
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (flowBuilderRef.current && botflowId) {
        // Intentar guardar los cambios
        e.preventDefault();
        e.returnValue = "¿Seguro que quieres salir? Los cambios pueden perderse.";
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [botflowId]);

  // Función para guardar el flujo
  const saveFlow = async () => {
    if (!flowBuilderRef.current || !botflowId) return false;
    
    setIsSaving(true);
    try {
      const nodes = flowBuilderRef.current.getNodes();
      const edges = flowBuilderRef.current.getEdges();
      const result = await flowService.saveFlowNodes(nodes, edges, botflowId);
      
      setSaveSuccess(result);
      setTimeout(() => setSaveSuccess(null), 3000);
      return result;
    } catch (error) {
      console.error("Error guardando el flujo:", error);
      setSaveSuccess(false);
      setTimeout(() => setSaveSuccess(null), 3000);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = async () => {
    const result = await saveFlow();
    if (result) {
      setShowSaveModal(true);
    }
  };

  const validateFlow = () => {
    // Accedim als nodes i arestes a través de la referència
    if (!flowBuilderRef.current) return false;
   
    const nodes = flowBuilderRef.current.getNodes();
    const edges = flowBuilderRef.current.getEdges();
   
    // Busquem nodes que no siguin finals i no tinguin connexió sortint
    const errors: string[] = [];
   
    // Primer comprovem si hi ha final nodes consecutius
    const finalNodes = nodes.filter(node => node.type === 'final');
   
    // Comprovem quants nodes finals hi ha
    if (finalNodes.length > 3) {
      errors.push(`S'han detectat ${finalNodes.length} nodes finals. Això pot indicar un flux incorrecte.`);
    }
   
    nodes.forEach(node => {
      // Si no és un node final, hauria de tenir una sortida
      if (node.type !== 'final') {
        const hasOutgoingEdge = edges.some(edge => edge.source === node.id);
        if (!hasOutgoingEdge) {
          errors.push(`El node ${node.id} (${node.type}) no té cap connexió sortint.`);
        }
      }
     
      // Comprovem si hi ha nodes finals amb connexions incorrectes
      if (node.type === 'final') {
        // Comprovem si aquest node final té connexions entrants que provenen d'altres nodes finals
        const incomingEdges = edges.filter(edge => edge.target === node.id);
        incomingEdges.forEach(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          if (sourceNode && sourceNode.type === 'final') {
            errors.push(`Error: Nodo final (${sourceNode.id}) conectado a otro nodo final (${node.id}). Los nodos finales deben ser terminales.`);
          }
        });
       
        // Comprovem si aquest node final té connexions sortints
        const outgoingEdges = edges.filter(edge => edge.source === node.id);
        if (outgoingEdges.length > 0) {
          errors.push(`Error: El nodo final ${node.id} tiene ${outgoingEdges.length} conexiones salientes. Los nodos finales no pueden tener conexiones salientes.`);
        }
      }
    });

    // Comprovem si hi ha nodes finals formant una cadena
    const finalNodesWithConnections = finalNodes.filter(node => {
      const hasIncoming = edges.some(edge => edge.target === node.id);
      const hasOutgoing = edges.some(edge => edge.source === node.id);
      return hasIncoming || hasOutgoing;
    });

    if (finalNodesWithConnections.length > 1) {
      // Comprovem si formen una cadena
      const finalNodeIds = finalNodes.map(node => node.id);
      const finalNodeEdges = edges.filter(edge =>
        finalNodeIds.includes(edge.source) || finalNodeIds.includes(edge.target)
      );
     
      if (finalNodeEdges.length > 0) {
        errors.push(`Error: S'ha detectat una cadena de nodes finals (${finalNodeEdges.map(e => `${e.source}->${e.target}`).join(', ')}). Els nodes finals han d'estar aïllats.`);
      }
    }
   
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleDeployClick = () => {
    const isValid = validateFlow();
    if (isValid) {
      setShowDeployModal(true);
    } else {
      // Mostrar els errors en un modal
      setShowDeployModal(true); // Però amb contingut diferent que mostra els errors
    }
  };

  const closeSaveModal = () => {
    setShowSaveModal(false);
  };

  const closeDeployModal = () => {
    setShowDeployModal(false);
    setValidationErrors([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b relative">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => window.history.back()} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <Bot className="w-10 h-10 text-blue-500" />
                <div>
                  <h1 className="text-xl font-semibold">NextConsult</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleDeployClick}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                Desplegar
              </button>
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de último guardado */}
        {saveSuccess !== null && (
          <div className={`absolute top-full right-4 -translate-y-full p-3 rounded shadow-lg transition-opacity duration-500 ${
            saveSuccess ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-red-100 border border-red-300 text-red-700'
          }`}>
            {saveSuccess ? 'Cambios guardados correctamente' : 'Error al guardar cambios'}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-4 py-8">
        <ReactFlowProvider>
          <FlowBuilder ref={flowBuilderRef} botflowId={botflowId} />
        </ReactFlowProvider>
      </main>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirmació</h2>
            <p>Estàs segur que vols desar els canvis?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeSaveModal}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
              >
                Cancel·lar
              </button>
              <button
                onClick={closeSaveModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            {validationErrors.length > 0 ? (
              <>
                <h2 className="text-lg font-semibold mb-4 text-red-600">Errors de validació</h2>
                <p className="mb-3">No es pot desplegar el chatbot fins que es resolguin els següents errors:</p>
                <ul className="list-disc pl-5 mb-4 text-red-600">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="mb-1">{error}</li>
                  ))}
                </ul>
                <p className="text-sm italic mb-4">
                  Tots els nodes que no siguin de tipus "Final" han de tenir almenys una connexió sortint.
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={closeDeployModal}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                  >
                    Entès
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4">Confirmació</h2>
                <p>Estàs segur que vols desplegar l'aplicació en el telèfon 666666666?</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={closeDeployModal}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                  >
                    Cancel·lar
                  </button>
                  <button
                    onClick={closeDeployModal}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateChatbot;