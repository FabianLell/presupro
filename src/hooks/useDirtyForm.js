import { useState, useEffect, useRef } from 'react';

/**
 * Hook reutilizable para detectar cambios en formularios y prevenir pérdida de datos
 * @param {Object} initialData - Datos iniciales del formulario
 * @param {Function} onSave - Función para guardar los cambios
 * @returns {Object} - Estado y funciones del hook
 */
export function useDirtyForm(initialData = {}, onSave) {
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const initialDataRef = useRef(initialData);
  const currentDataRef = useRef(initialData);

  // Actualizar datos iniciales cuando cambian
  useEffect(() => {
    initialDataRef.current = initialData;
    currentDataRef.current = initialData;
    setIsDirty(false);
  }, [initialData]);

  /**
   * Compara dos objetos para detectar cambios
   * @param {Object} obj1 
   * @param {Object} obj2 
   * @returns {boolean}
   */
  const hasChanges = (obj1, obj2) => {
    if (obj1 === obj2) return false;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return true;
    
    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) return true;
    }
    
    return false;
  };

  /**
   * Actualiza los datos actuales y verifica si hay cambios
   * @param {Object} newData 
   */
  const updateData = (newData) => {
    currentDataRef.current = newData;
    const dirty = hasChanges(initialDataRef.current, newData);
    setIsDirty(dirty);
  };

  /**
   * Marca el formulario como limpio (después de guardar)
   */
  const markAsClean = () => {
    initialDataRef.current = { ...currentDataRef.current };
    setIsDirty(false);
  };

  /**
   * Ejecuta una acción con protección de datos
   * @param {Function} action - Acción a ejecutar si no hay cambios o si confirma
   * @returns {Promise<boolean>} - true si la acción se ejecutó, false si se canceló
   */
  const executeWithProtection = async (action) => {
    if (!isDirty) {
      await action();
      return true;
    }

    // Si hay cambios, mostrar modal de confirmación
    setPendingAction(() => action);
    setShowConfirmModal(true);
    return false;
  };

  /**
   * Maneja la confirmación del modal
   */
  const handleConfirm = async () => {
    setShowConfirmModal(false);
    
    try {
      // Guardar cambios si hay función onSave
      if (onSave) {
        await onSave();
        markAsClean();
      }
      
      // Ejecutar acción pendiente
      if (pendingAction) {
        await pendingAction();
        setPendingAction(null);
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      // No ejecutar la acción si falló el guardado
    }
  };

  /**
   * Maneja el descarte de cambios
   */
  const handleDiscard = async () => {
    setShowConfirmModal(false);
    
    // Ejecutar acción pendiente
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
    }
    
    // Marcar como limpio
    markAsClean();
  };

  /**
   * Maneja la cancelación del modal
   */
  const handleCancel = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  return {
    isDirty,
    showConfirmModal,
    updateData,
    markAsClean,
    executeWithProtection,
    handleConfirm,
    handleDiscard,
    handleCancel,
    get currentData() { return currentDataRef.current; }
  };
}
