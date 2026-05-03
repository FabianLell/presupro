import React, { createContext, useContext, useState } from 'react';

/**
 * Contexto global para manejar protección contra pérdida de datos
 */
const DirtyFormContext = createContext();

/**
 * Provider del contexto de protección de datos
 */
export function DirtyFormProvider({ children }) {
  const [dirtyForm, setDirtyForm] = useState({
    isDirty: false,
    onSave: null,
    onDiscard: null,
    onCancel: null
  });

  /**
   * Registra un formulario con cambios sin guardar
   * @param {Object} formConfig - Configuración del formulario
   */
  const registerDirtyForm = (formConfig) => {
    setDirtyForm(formConfig);
  };

  /**
   * Limpia el registro de formulario sucio
   */
  const clearDirtyForm = () => {
    setDirtyForm({
      isDirty: false,
      onSave: null,
      onDiscard: null,
      onCancel: null
    });
  };

  /**
   * Verifica si hay un formulario con cambios sin guardar
   */
  const hasDirtyForm = () => {
    return dirtyForm.isDirty;
  };

  return (
    <DirtyFormContext.Provider value={{
      dirtyForm,
      registerDirtyForm,
      clearDirtyForm,
      hasDirtyForm
    }}>
      {children}
    </DirtyFormContext.Provider>
  );
}

/**
 * Hook para usar el contexto de protección de datos
 */
export function useDirtyFormContext() {
  const context = useContext(DirtyFormContext);
  if (!context) {
    throw new Error('useDirtyFormContext debe ser usado dentro de DirtyFormProvider');
  }
  return context;
}
