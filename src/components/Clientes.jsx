import { useState, useEffect } from "react";
import { supabase, getUserId } from "../supabase";
import { useDirtyForm } from "../hooks/useDirtyForm";
import { useMobile } from "../hooks/use-mobile";

const VACIO = {
  nombre: "",
  apellido: "",
  telefono: "",
  dni: "",
  cuil_cuit: "",
  email: "",
  direccion: "",
};

function IconoKebab() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function IconoExpandir() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconoContraer() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.9rem",
        color: "#888",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "44px",
          height: "24px",
          backgroundColor: checked ? "#2563eb" : "#374151",
          borderRadius: "12px",
          transition: "background-color 0.2s",
          cursor: "pointer",
        }}
        onClick={() => onChange(!checked)}
      >
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "22px" : "2px",
            width: "20px",
            height: "20px",
            backgroundColor: "#fff",
            borderRadius: "50%",
            transition: "left 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </div>
      <span>{label}</span>
    </label>
  );
}

function KebabMenu({
  clienteId,
  onEdit,
  onDelete,
  isVisible,
  onClose,
  isEliminado,
}) {
  if (!isVisible) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.3)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
          border: "1px solid #374151",
          borderRadius: "8px",
          padding: "0.5rem",
          minWidth: "120px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!isEliminado && (
          <button
            className="btn btn-secondary"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              padding: "0.5rem 0.75rem",
              fontSize: "0.85rem",
            }}
            onClick={() => {
              onEdit(clienteId);
              onClose();
            }}
          >
            <IconoEditar /> Editar
          </button>
        )}
        {isEliminado ? (
          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              padding: "0.5rem 0.75rem",
              fontSize: "0.85rem",
            }}
            onClick={() => {
              onDelete(clienteId);
              onClose();
            }}
          >
            ↺ Restaurar
          </button>
        ) : (
          <button
            className="btn btn-danger"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              padding: "0.5rem 0.75rem",
              fontSize: "0.85rem",
            }}
            onClick={() => {
              onDelete(clienteId);
              onClose();
            }}
          >
            <IconoEliminar /> Eliminar
          </button>
        )}
      </div>
    </div>
  );
}

function IconoEditar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconoEliminar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function Clientes({ soloLectura }) {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [selId, setSelId] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [esNuevo, setEsNuevo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [mostrarEliminados, setMostrarEliminados] = useState(false);

  // Mobile-specific states
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [kebabMenu, setKebabMenu] = useState(null);
  const [showMobileForm, setShowMobileForm] = useState(false);

  const isMobile = useMobile();

  // Hook de protección contra pérdida de datos
  const dirtyForm = useDirtyForm(VACIO, async () => {
    if (modoEdicion) {
      await guardar();
    }
  });

  // Registrar estado del formulario con sistema global
  useEffect(() => {
    if (dirtyForm.isDirty && modoEdicion) {
      window.currentDirtyForm = {
        isDirty: dirtyForm.isDirty,
        onSave: async () => {
          await guardar();
        },
      };
    } else {
      window.currentDirtyForm = null;
    }
  }, [dirtyForm.isDirty, modoEdicion]);

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    cargar();
  }, [mostrarEliminados]);

  async function cargar() {
    setCargando(true);
    let query = supabase.from("clientes").select("*").order("apellido");

    // Filtrar por is_active según el toggle
    if (!mostrarEliminados) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) setError("Error al cargar clientes");
    else setClientes(data || []);
    setCargando(false);
  }

  function handleChange(e) {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    dirtyForm.updateData(newForm);
  }

  function seleccionar(c) {
    // Verificar si hay cambios sin guardar antes de seleccionar
    if (dirtyForm.isDirty && modoEdicion) {
      // Mostrar confirmación usando el sistema global
      if (window.showDirtyFormModal) {
        window.showDirtyFormModal(
          async () => {
            // Guardar
            await guardar();
            // Luego seleccionar el cliente
            doSeleccionar(c);
          },
          () => {
            // Descartar
            doSeleccionar(c);
          },
          () => {
            // Cancelar - no hacer nada
          },
        );
      }
    } else {
      // Si no hay cambios, seleccionar normalmente
      doSeleccionar(c);
    }
  }

  function doSeleccionar(c) {
    setSelId(c.id);
    const clienteForm = {
      nombre: c.nombre,
      apellido: c.apellido,
      telefono: c.telefono || "",
      dni: c.dni || "",
      cuil_cuit: c.cuil_cuit || "",
      email: c.email || "",
      direccion: c.direccion || "",
    };
    setForm(clienteForm);
    dirtyForm.updateData(clienteForm);
    dirtyForm.markAsClean();
    setModoEdicion(false);
    setEsNuevo(false);
    setError("");
    setOk("");
  }

  function nuevo() {
    setSelId(null);
    setForm(VACIO);
    dirtyForm.updateData(VACIO);
    dirtyForm.markAsClean();
    setModoEdicion(true);
    setEsNuevo(true);
    setError("");
    setOk("");

    // Mobile-specific: show form when creating new
    if (isMobile) {
      setShowMobileForm(true);
    }
  }

  function cancelar() {
    if (esNuevo) {
      setSelId(null);
      setForm(VACIO);
      setModoEdicion(false);
      setEsNuevo(false);

      // Mobile-specific: hide form when cancelling new
      if (isMobile) {
        setShowMobileForm(false);
      }
    } else {
      const c = clientes.find((x) => x.id === selId);
      if (c) seleccionar(c);
      setModoEdicion(false);

      // Mobile-specific: hide form when cancelling edit
      if (isMobile) {
        setShowMobileForm(false);
      }
    }
    setError("");
    setOk("");
  }

  // Mobile-specific functions
  function toggleExpandedRow(clienteId) {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(clienteId)) {
      newExpanded.delete(clienteId);
    } else {
      newExpanded.add(clienteId);
    }
    setExpandedRows(newExpanded);
  }

  function handleKebabClick(clienteId, e) {
    e.stopPropagation();
    setKebabMenu(kebabMenu === clienteId ? null : clienteId);
  }

  function handleEditCliente(clienteId) {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (cliente) {
      seleccionar(cliente);
      setModoEdicion(true);
      setShowMobileForm(true);
    }
  }

  function handleDeleteCliente(clienteId) {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente?.is_active) {
      restaurar(clienteId);
    } else {
      setConfirmEliminar(clienteId);
    }
  }

  async function guardar() {
    setError("");
    setOk("");

    // Obtener datos del hook si el componente está vacío
    let currentForm = form;
    if (dirtyForm.currentData && dirtyForm.currentData.nombre) {
      currentForm = {
        nombre: dirtyForm.currentData.nombre || "",
        apellido: dirtyForm.currentData.apellido || "",
        telefono: dirtyForm.currentData.telefono || "",
        dni: dirtyForm.currentData.dni || "",
        cuil_cuit: dirtyForm.currentData.cuil_cuit || "",
        email: dirtyForm.currentData.email || "",
        direccion: dirtyForm.currentData.direccion || "",
      };
    }

    if (!currentForm.nombre.trim()) {
      setError("El nombre es obligatorio");
      throw new Error("El nombre es obligatorio");
    }
    if (!currentForm.apellido.trim()) {
      setError("El apellido es obligatorio");
      throw new Error("El apellido es obligatorio");
    }

    const userId = await getUserId();
    const datos = {
      user_id: userId,
      nombre: currentForm.nombre.trim(),
      apellido: currentForm.apellido.trim(),
      telefono: currentForm.telefono.trim(),
      dni: currentForm.dni.trim(),
      cuil_cuit: currentForm.cuil_cuit.trim(),
      email: currentForm.email.trim(),
      direccion: currentForm.direccion.trim(),
    };

    if (!esNuevo && selId) {
      const { error } = await supabase
        .from("clientes")
        .update(datos)
        .eq("id", selId);
      if (error) {
        setError("Error al actualizar");
        throw new Error("Error al actualizar");
      }
      setOk("Cliente actualizado");
      setModoEdicion(false);
      dirtyForm.markAsClean();

      // Mobile-specific: hide form after saving
      if (isMobile) {
        setShowMobileForm(false);
      }
    } else {
      const { data, error } = await supabase
        .from("clientes")
        .insert([datos])
        .select()
        .single();
      if (error) {
        setError("Error al guardar");
        throw new Error("Error al guardar");
      }
      setOk("Cliente agregado");
      setEsNuevo(false);
      setModoEdicion(false);
      setSelId(data.id);
      dirtyForm.markAsClean();

      // Mobile-specific: hide form after saving new
      if (isMobile) {
        setShowMobileForm(false);
      }
    }
    await cargar();
  }

  async function eliminar(id) {
    // Soft delete: actualizar is_active a false en lugar de borrar
    const { error } = await supabase
      .from("clientes")
      .update({ is_active: false })
      .eq("id", id);
    if (error) {
      setError("Error al eliminar");
      return;
    }
    setSelId(null);
    setForm(VACIO);
    setModoEdicion(false);
    setConfirmEliminar(null);
    cargar();
  }

  async function restaurar(id) {
    // Restaurar: setear is_active a true
    const { error } = await supabase
      .from("clientes")
      .update({ is_active: true })
      .eq("id", id);
    if (error) {
      setError("Error al restaurar");
      return;
    }
    setSelId(null);
    setForm(VACIO);
    setModoEdicion(false);
    cargar();
  }

  const filtrados = clientes.filter((c) => {
    if (!busqueda) return true;
    const t = busqueda.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(t) ||
      c.apellido?.toLowerCase().includes(t) ||
      c.telefono?.toLowerCase().includes(t) ||
      c.email?.toLowerCase().includes(t) ||
      c.dni?.toLowerCase().includes(t)
    );
  });

  const formularioVacio = !selId && !esNuevo;

  // Mobile form visibility logic
  const shouldShowForm = !isMobile || (isMobile && showMobileForm);

  // Mobile client row component
  function MobileClientRow({ cliente }) {
    const isExpanded = expandedRows.has(cliente.id);
    const isEliminado = !cliente.is_active;

    return (
      <div style={{ marginBottom: "0.5rem" }}>
        {/* Main row */}
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
            padding: "0.75rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            ...(isEliminado ? { opacity: 0.6 } : {}),
          }}
          onClick={() => toggleExpandedRow(cliente.id)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#222";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#1a1a1a";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Left side: Name, Lastname, Phone */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  fontWeight: "500",
                  color: "#f0f0f0",
                  fontSize: "0.95rem",
                }}
              >
                {cliente.nombre} {cliente.apellido}
              </span>
              {cliente.telefono && (
                <span
                  style={{
                    color: "#888",
                    fontSize: "0.85rem",
                    fontWeight: "400",
                  }}
                >
                  {cliente.telefono}
                </span>
              )}
            </div>

            {/* Right side: Kebab menu */}
            <button
              className="btn btn-secondary"
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.8rem",
                minWidth: "auto",
              }}
              onClick={(e) => handleKebabClick(cliente.id, e)}
            >
              <IconoKebab />
            </button>
          </div>

          {/* Expand arrow - centered below main content */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "0.5rem",
              color: "#888",
            }}
          >
            {isExpanded ? <IconoContraer /> : <IconoExpandir />}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div
            style={{
              background: "#1f1f1f",
              border: "1px solid #2a2a2a",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              padding: "0.75rem",
              marginTop: "-1px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {cliente.dni && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#888", fontSize: "0.85rem" }}>
                    DNI:
                  </span>
                  <span style={{ color: "#f0f0f0", fontSize: "0.9rem" }}>
                    {cliente.dni}
                  </span>
                </div>
              )}
              {cliente.direccion && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#888", fontSize: "0.85rem" }}>
                    Dirección:
                  </span>
                  <span style={{ color: "#f0f0f0", fontSize: "0.9rem" }}>
                    {cliente.direccion}
                  </span>
                </div>
              )}
              {cliente.cuil_cuit && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#888", fontSize: "0.85rem" }}>
                    CUIT:
                  </span>
                  <span style={{ color: "#f0f0f0", fontSize: "0.9rem" }}>
                    {cliente.cuil_cuit}
                  </span>
                </div>
              )}
              {cliente.email && (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#888", fontSize: "0.85rem" }}>
                    Email:
                  </span>
                  <span style={{ color: "#f0f0f0", fontSize: "0.9rem" }}>
                    {cliente.email}
                  </span>
                </div>
              )}
              {isEliminado && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#ff6b6b",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    marginTop: "0.5rem",
                    padding: "0.25rem",
                    background: "#2a1a1a",
                    borderRadius: "4px",
                  }}
                >
                  ELIMINADO
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="md-layout">
      {/* FORMULARIO - Hidden on mobile unless showMobileForm is true */}
      {shouldShowForm && (
        <div
          className="md-form-area"
          style={{
            display: isMobile && !showMobileForm ? "none" : "block",
            ...(isMobile
              ? {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 50,
                  background: "#1a1a1a",
                }
              : {}),
          }}
        >
          <div className="md-form-header">
            <h2 className={formularioVacio ? "" : "activo"}>
              {esNuevo
                ? "Nuevo cliente"
                : selId
                  ? "Datos del cliente"
                  : "Seleccioná un cliente"}
            </h2>
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              {error && <span className="msg-error">{error}</span>}
              {ok && <span className="msg-ok">{ok}</span>}
              {!soloLectura && !modoEdicion && (
                <button className="btn btn-primary" onClick={nuevo}>
                  + Nuevo
                </button>
              )}
              {!soloLectura &&
                selId &&
                !modoEdicion &&
                !esNuevo &&
                (() => {
                  const cliente = clientes.find((c) => c.id === selId);
                  const isEliminado = !cliente?.is_active;
                  return !isEliminado ? (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setModoEdicion(true)}
                    >
                      <IconoEditar /> Editar
                    </button>
                  ) : null;
                })()}
              {!soloLectura &&
                selId &&
                !esNuevo &&
                !modoEdicion &&
                (() => {
                  const cliente = clientes.find((c) => c.id === selId);
                  const isEliminado = !cliente?.is_active;
                  return isEliminado ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => restaurar(selId)}
                    >
                      ↺ Restaurar
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger"
                      onClick={() => setConfirmEliminar(selId)}
                    >
                      <IconoEliminar /> Eliminar
                    </button>
                  );
                })()}
              {modoEdicion && (
                <>
                  <button className="btn btn-primary" onClick={guardar}>
                    Guardar
                  </button>
                  <button className="btn btn-secondary" onClick={cancelar}>
                    Cancelar
                  </button>
                </>
              )}
              {/* Mobile close button */}
              {isMobile && showMobileForm && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowMobileForm(false)}
                  style={{ marginLeft: "auto" }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="form-row">
            <input
              name="nombre"
              placeholder="Nombre *"
              value={form.nombre}
              onChange={handleChange}
              readOnly={!modoEdicion}
            />
            <input
              name="apellido"
              placeholder="Apellido *"
              value={form.apellido}
              onChange={handleChange}
              readOnly={!modoEdicion}
            />
          </div>
          <div className="form-row" style={{ marginTop: "0.65rem" }}>
            <input
              name="telefono"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
              readOnly={!modoEdicion}
            />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              readOnly={!modoEdicion}
            />
          </div>
          <div className="form-row" style={{ marginTop: "0.65rem" }}>
            <input
              name="dni"
              placeholder="DNI"
              value={form.dni}
              onChange={handleChange}
              readOnly={!modoEdicion}
            />
            <input
              name="cuil_cuit"
              placeholder="CUIL / CUIT"
              value={form.cuil_cuit}
              onChange={handleChange}
              readOnly={!modoEdicion}
            />
          </div>
          <input
            name="direccion"
            placeholder="Dirección"
            value={form.direccion}
            onChange={handleChange}
            readOnly={!modoEdicion}
            style={{ marginTop: "0.65rem" }}
          />
        </div>
      )}

      {/* BUSCADOR */}
      <div className="md-search-area">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <input
            placeholder="Buscar cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ flex: 1 }}
          />
          {/* Mobile: Toggle switch, Desktop: Checkbox */}
          {isMobile ? (
            <ToggleSwitch
              checked={mostrarEliminados}
              onChange={setMostrarEliminados}
              label="Eliminados"
            />
          ) : (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9rem",
                color: "#888",
                whiteSpace: "nowrap",
              }}
            >
              <input
                type="checkbox"
                checked={mostrarEliminados}
                onChange={(e) => setMostrarEliminados(e.target.checked)}
              />
              Ver Eliminados
            </label>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <div className="md-list-area">
        {cargando ? (
          <p style={{ color: "#888", padding: "1rem" }}>Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p style={{ color: "#888", padding: "1rem" }}>No hay clientes</p>
        ) : (
          <>
            {/* Desktop view */}
            {!isMobile && (
              <table style={{ tableLayout: "fixed", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "40%", textAlign: "left" }}>
                      Apellido, Nombre
                    </th>
                    <th style={{ width: "15%" }}>Teléfono</th>
                    <th style={{ width: "30%" }}>Email</th>
                    <th style={{ width: "15%" }}>DNI</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((c) => (
                    <tr
                      key={c.id}
                      className={`${selId === c.id ? "seleccionado" : ""} ${!c.is_active ? "eliminado" : ""}`}
                      onClick={() => seleccionar(c)}
                      style={
                        !c.is_active
                          ? {
                              color: "#999",
                              textDecoration: "line-through",
                              opacity: 0.7,
                            }
                          : {}
                      }
                    >
                      <td style={{ textAlign: "left" }}>
                        <span>
                          {c.apellido}, {c.nombre}
                        </span>
                        {!c.is_active && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "#ff6b6b",
                              fontWeight: "bold",
                              marginLeft: "0.5rem",
                            }}
                          >
                            ELIMINADO
                          </span>
                        )}
                      </td>
                      <td>{c.telefono || "—"}</td>
                      <td>{c.email || "—"}</td>
                      <td>{c.dni || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Mobile view */}
            {isMobile && (
              <div style={{ padding: "0.5rem" }}>
                {filtrados.map((c) => (
                  <MobileClientRow key={c.id} cliente={c} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Kebab Menu */}
      {kebabMenu && (
        <KebabMenu
          clienteId={kebabMenu}
          isVisible={true}
          onClose={() => setKebabMenu(null)}
          onEdit={handleEditCliente}
          onDelete={handleDeleteCliente}
          isEliminado={!clientes.find((c) => c.id === kebabMenu)?.is_active}
        />
      )}

      {/* MODAL CONFIRMAR ELIMINAR */}
      {confirmEliminar && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¿Eliminar cliente?</h3>
            <p
              style={{
                color: "#666",
                fontSize: "0.9rem",
                margin: "0.5rem 0 1rem",
              }}
            >
              El cliente será archivado y no aparecerá en los listados. Podrás
              restaurarlo más tarde si es necesario.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn-danger"
                onClick={() => eliminar(confirmEliminar)}
              >
                Eliminar
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmEliminar(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
