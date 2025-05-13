import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
  onSave: () => Promise<boolean>;
  interval?: number; // milisegundos
  enabled?: boolean;
}

export const useAutoSave = ({ 
  onSave, 
  interval = 60000, // Por defecto, cada minuto
  enabled = true 
}: UseAutoSaveOptions) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para ejecutar el guardado
  const executeAutoSave = async () => {
    if (!enabled) return;
    
    setIsAutoSaving(true);
    setError(null);
    
    try {
      const success = await onSave();
      if (success) {
        setLastSaved(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido durante el autoguardado'));
      console.error('Error en autoguardado:', err);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Configurar el intervalo de autoguardado
  useEffect(() => {
    if (enabled) {
      timeoutRef.current = setInterval(executeAutoSave, interval);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [enabled, interval, onSave]);

  return {
    lastSaved,
    isAutoSaving,
    error,
    executeAutoSave,
  };
};
