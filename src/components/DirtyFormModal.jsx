import React from "react";

/**
 * Modal de confirmación para protección contra pérdida de datos
 * @param {Object} props
 * @param {boolean} props.show - Si el modal debe mostrarse
 * @param {Function} props.onSave - Callback para guardar cambios
 * @param {Function} props.onDiscard - Callback para descartar cambios
 * @param {Function} props.onCancel - Callback para cancelar acción
 */
export function DirtyFormModal({ show, onSave, onDiscard, onCancel }) {
  if (!show) return null;

  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
    // Limpiar el estado global para cerrar el modal
    if (window.hideDirtyFormModal) {
      window.hideDirtyFormModal();
    }
  };

  const handleDiscard = () => {
    if (onDiscard) {
      onDiscard();
    }
    // Limpiar el estado global para cerrar el modal
    if (window.hideDirtyFormModal) {
      window.hideDirtyFormModal();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    // Limpiar el estado global para cerrar el modal
    if (window.hideDirtyFormModal) {
      window.hideDirtyFormModal();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal dirty-form-modal">
        <div className="modal-header">
          <h3>¿Salir sin guardar?</h3>
        </div>

        <div className="modal-body">
          <p>Tenés cambios sin guardar. ¿Querés guardar antes de salir?</p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleSave}>
            Guardar
          </button>

          <button className="btn btn-secondary" onClick={handleDiscard}>
            Descartar
          </button>

          <button className="btn btn-outline" onClick={handleCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
