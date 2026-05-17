import { useState, useEffect } from "react";
import { supabase, getUserId } from "../supabase";
import { useDirtyForm } from "../hooks/useDirtyForm";
import { useMobile } from "../hooks/use-mobile";

const VACIO = { nombre: "", descripcion: "", precio: "" };

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

export default function Servicios({ soloLectura }) {
  const [servicios, setServicios] = useState([]);
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
  const [kebabPosition, setKebabPosition] = useState(null);
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
    let query = supabase.from("user_servicios").select("*").order("nombre");

    // Filtrar por is_active según el toggle
    if (!mostrarEliminados) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) setError("Error al cargar servicios");
    else setServicios(data || []);
    setCargando(false);
  }

  function handleChange(e) {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    dirtyForm.updateData(newForm);
  }

  function seleccionar(s) {
    // Verificar si hay cambios sin guardar antes de seleccionar
    if (dirtyForm.isDirty && modoEdicion) {
      if (window.showDirtyFormModal) {
        window.showDirtyFormModal(
          async () => {
            await guardar();
            doSeleccionar(s);
          },
          () => {
            doSeleccionar(s);
          },
          () => {
            // Cancelar
          },
        );
      }
    } else {
      doSeleccionar(s);
    }
  }

  function doSeleccionar(s) {
    setSelId(s.id);
    const servicioForm = {
      nombre: s.nombre,
      descripcion: s.descripcion || "",
      precio: s.precio || "",
    };
    setForm(servicioForm);
    dirtyForm.updateData(servicioForm);
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

      if (isMobile) {
        setShowMobileForm(false);
      }
    } else {
      const s = servicios.find((x) => x.id === selId);
      if (s) seleccionar(s);
      setModoEdicion(false);

      if (isMobile) {
        setShowMobileForm(false);
      }
    }
    setError("");
    setOk("");
  }

  async function guardar() {
    setError("");
    setOk("");

    let currentForm = form;
    if (dirtyForm.currentData && dirtyForm.currentData.nombre) {
      currentForm = {
        nombre: dirtyForm.currentData.nombre || "",
        descripcion: dirtyForm.currentData.descripcion || "",
        precio: dirtyForm.currentData.precio || "",
      };
    }

    if (!currentForm.nombre.trim()) {
      setError("El nombre es obligatorio");
      throw new Error("El nombre es obligatorio");
    }
    if (!currentForm.precio || isNaN(currentForm.precio)) {
      setError("El precio debe ser un número");
      throw new Error("El precio debe ser un número");
    }

    const userId = await getUserId();
    const datos = {
      user_id: userId,
      nombre: currentForm.nombre.trim(),
      descripcion: currentForm.descripcion.trim(),
      precio: parseFloat(currentForm.precio),
    };

    if (!esNuevo && selId) {
      const { error } = await supabase
        .from("user_servicios")
        .update(datos)
        .eq("id", selId);
      if (error) {
        setError("Error al actualizar");
        throw new Error("Error al actualizar");
      }
      setOk("Servicio actualizado");
      setModoEdicion(false);
      dirtyForm.markAsClean();

      if (isMobile) {
        setShowMobileForm(false);
      }
    } else {
      const { data, error } = await supabase
        .from("user_servicios")
        .insert([datos])
        .select()
        .single();
      if (error) {
        setError("Error al guardar");
        throw new Error("Error al guardar");
      }
      setOk("Servicio agregado");
      setEsNuevo(false);
      setModoEdicion(false);
      setSelId(data.id);
      dirtyForm.markAsClean();

      if (isMobile) {
        setShowMobileForm(false);
      }
    }

    setForm(VACIO);
    cargar();
  }

  async function eliminar(id) {
    // Soft delete: actualizar is_active a false en lugar de borrar
    const { error } = await supabase
      .from("user_servicios")
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
    const { error } = await supabase
      .from("user_servicios")
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

  // Mobile-specific functions
  function toggleExpandedRow(servicioId) {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(servicioId)) {
      newExpanded.delete(servicioId);
    } else {
      newExpanded.add(servicioId);
    }
    setExpandedRows(newExpanded);
  }

  function handleKebabClick(servicioId, e) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setKebabPosition({ x: rect.left, y: rect.bottom });
    setKebabMenu(kebabMenu === servicioId ? null : servicioId);
  }

  function handleEditServicio(servicioId) {
    const servicio = servicios.find((s) => s.id === servicioId);
    if (servicio) {
      seleccionar(servicio);
      setModoEdicion(true);
      setShowMobileForm(true);
    }
  }

  function handleDeleteServicio(servicioId) {
    const servicio = servicios.find((s) => s.id === servicioId);
    if (!servicio?.is_active) {
      restaurar(servicioId);
    } else {
      setConfirmEliminar(servicioId);
    }
  }

  const filtrados = servicios.filter((s) => {
    if (!busqueda) return true;
    const t = busqueda.toLowerCase();
    return (
      s.nombre?.toLowerCase().includes(t) ||
      s.descripcion?.toLowerCase().includes(t)
    );
  });

  const formularioVacio = !selId && !esNuevo;

  // Mobile form visibility logic
  const shouldShowForm = !isMobile || (isMobile && showMobileForm);

  function KebabMenu({
    servicioId,
    onEdit,
    onDelete,
    isVisible,
    onClose,
    isEliminado,
    position,
  }) {
    if (!isVisible || !position) return null;

    return (
      <div
        className="modal-overlay"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.3)",
          zIndex: 100,
        }}
        onClick={onClose}
      >
        <div
          style={{
            position: "absolute",
            right: "10px",
            top: position.y,
            transform: "translateY(0)",
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
                onEdit(servicioId);
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
                onDelete(servicioId);
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
                onDelete(servicioId);
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

  function MobileServiceRow({ servicio }) {
    const isExpanded = expandedRows.has(servicio.id);
    const isEliminado = !servicio.is_active;

    return (
      <div style={{ marginBottom: "0.5rem" }}>
        <div
          className={`mobile-service-item ${selId === servicio.id ? "seleccionado" : ""} ${isEliminado ? "eliminado" : ""}`}
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "0.75rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            ...(isEliminado
              ? { opacity: 0.6, textDecoration: "line-through" }
              : {}),
          }}
          onClick={() => toggleExpandedRow(servicio.id)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#222";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#1e293b";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#f0f0f0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                maxWidth: "calc(100% - 120px)",
                textAlign: "left",
                paddingLeft: 0,
                marginLeft: 0,
              }}
            >
              {servicio.nombre}
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                color: "#4ade80",
                fontFamily: "monospace",
                margin: "0 0.5rem",
                whiteSpace: "nowrap",
              }}
            >
              ${parseFloat(servicio.precio).toLocaleString("es-AR")}
            </div>
            <button
              className="btn btn-secondary"
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.8rem",
                minWidth: "auto",
              }}
              onClick={(e) => handleKebabClick(servicio.id, e)}
            >
              <IconoKebab />
            </button>
          </div>

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

          {isExpanded && (
            <div
              style={{
                width: "100%",
                marginTop: "0.5rem",
                textAlign: "left",
              }}
            >
              {servicio.descripcion && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#666",
                    marginBottom: "0.3rem",
                    wordWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {servicio.descripcion}
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
          )}
        </div>
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
                ? "Nuevo servicio"
                : selId
                  ? "Datos del servicio"
                  : "Seleccioná un servicio"}
            </h2>
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              {error && <span className="msg-error">{error}</span>}
              {ok && <span className="msg-ok">{ok}</span>}
              {!isMobile && !soloLectura && !modoEdicion && (
                <button className="btn btn-primary" onClick={nuevo}>
                  + Nuevo
                </button>
              )}
              {!soloLectura &&
                selId &&
                !modoEdicion &&
                !esNuevo &&
                (() => {
                  const servicio = servicios.find((s) => s.id === selId);
                  const isEliminado = !servicio?.is_active;
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
                  const servicio = servicios.find((s) => s.id === selId);
                  const isEliminado = !servicio?.is_active;
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

          <input
            name="nombre"
            placeholder="Nombre (ej: Armado, Pintado, Soldadura) *"
            value={form.nombre}
            onChange={handleChange}
            readOnly={!modoEdicion}
          />

          <input
            name="descripcion"
            placeholder="Descripción opcional"
            value={form.descripcion}
            onChange={handleChange}
            readOnly={!modoEdicion}
            style={{ marginTop: "0.65rem" }}
          />

          <input
            name="precio"
            type="number"
            placeholder="Precio ($) *"
            value={form.precio}
            onChange={handleChange}
            readOnly={!modoEdicion}
            style={{ marginTop: "0.65rem" }}
          />
          {modoEdicion && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                marginTop: "1.5rem",
              }}
            >
              <button className="btn btn-secondary" onClick={cancelar}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={guardar}>
                Guardar
              </button>
            </div>
          )}
        </div>
      )}

      <div className="md-search-area">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <input
            placeholder="Buscar servicio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              flex: isMobile ? "1" : "1",
              height: isMobile ? "44px" : "auto",
              fontSize: isMobile ? "1rem" : "auto",
            }}
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
          {isMobile && !soloLectura && (
            <button
              className="btn btn-primary"
              onClick={nuevo}
              style={{
                height: "44px",
                padding: "0.75rem 1.5rem",
                minWidth: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "600",
                }}
              >
                + Nuevo
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="md-list-area">
        {cargando ? (
          <p style={{ color: "#888", padding: "1rem" }}>Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p style={{ color: "#888", padding: "1rem" }}>No hay servicios</p>
        ) : (
          <>
            {/* Desktop view */}
            {!isMobile && (
              <table style={{ tableLayout: "fixed", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "25%", textAlign: "left" }}>Nombre</th>
                    <th style={{ width: "50%" }}>Descripción</th>
                    <th style={{ width: "25%" }}>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((s) => (
                    <tr
                      key={s.id}
                      className={`${selId === s.id ? "seleccionado" : ""} ${!s.is_active ? "eliminado" : ""}`}
                      onClick={() => seleccionar(s)}
                      style={
                        !s.is_active
                          ? {
                              color: "#999",
                              textDecoration: "line-through",
                              opacity: 0.7,
                            }
                          : {}
                      }
                    >
                      <td style={{ textAlign: "left" }}>
                        <span>{s.nombre}</span>
                        {!s.is_active && (
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
                      <td style={{ color: "#888" }}>{s.descripcion || "—"}</td>
                      <td
                        style={{ textAlign: "right", fontFamily: "monospace" }}
                      >
                        ${parseFloat(s.precio).toLocaleString("es-AR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Mobile view */}
            {isMobile && (
              <div style={{ padding: "0.5rem" }}>
                {filtrados.map((s) => (
                  <MobileServiceRow key={s.id} servicio={s} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {confirmEliminar && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¿Eliminar servicio?</h3>
            <p
              style={{
                color: "#888",
                fontSize: "0.9rem",
                margin: "0.5rem 0 1rem",
              }}
            >
              El servicio será archivado y no aparecerá en los listados. Podrás
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

      {/* Kebab Menu */}
      {kebabMenu && (
        <KebabMenu
          servicioId={kebabMenu}
          isVisible={true}
          onClose={() => {
            setKebabMenu(null);
            setKebabPosition(null);
          }}
          onEdit={handleEditServicio}
          onDelete={handleDeleteServicio}
          isEliminado={!servicios.find((s) => s.id === kebabMenu)?.is_active}
          position={kebabPosition}
        />
      )}
    </div>
  );
}
