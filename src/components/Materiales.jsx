import { useState, useEffect } from "react";
import { supabase, getUserId } from "../supabase";
import { useDirtyForm } from "../hooks/useDirtyForm";
import { useMobile } from "../hooks/use-mobile";

const UNIDADES = [
  "unidad",
  "metro",
  "metro²",
  "kilo",
  "barra",
  "chapa",
  "tubo",
  "litro",
];

const VACIO = {
  nombre: "",
  descripcion: "",
  unidad: "unidad",
  precio_unitario: "",
  user_categoria_id: "",
};

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

export default function Materiales({ soloLectura }) {
  const [materiales, setMateriales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
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

  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);
  const [errorCategoria, setErrorCategoria] = useState("");

  const [mostrarGestionCategorias, setMostrarGestionCategorias] =
    useState(false);
  const [editCategoria, setEditCategoria] = useState(null);
  const [formCategoria, setFormCategoria] = useState({ nombre: "" });
  const [okCategoria, setOkCategoria] = useState("");

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
    cargarCategorias();
    cargar();
  }, []);

  useEffect(() => {
    cargar();
  }, [mostrarEliminados]);

  async function cargar() {
    setCargando(true);

    const userId = await getUserId();

    let query = supabase
      .from("user_materiales")
      .select("*")
      .eq("user_id", userId)
      .order("nombre");

    // Filtrar por is_active según el toggle
    if (!mostrarEliminados) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      setError("Error al cargar materiales: " + error.message);
      setCargando(false);
    } else {
      const materialesConCategoria = (data || []).map((m) => ({
        ...m,
        user_categorias: m.user_categoria_id
          ? categorias.find((c) => c.id === m.user_categoria_id)
          : null,
      }));
      setMateriales(materialesConCategoria);
      setCargando(false);
    }
  }

  async function cargarCategorias() {
    setCargandoCategorias(true);

    const userId = await getUserId();

    const { data } = await supabase
      .from("user_categorias")
      .select("id, nombre")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("nombre");

    setCategorias(data || []);
    setCargandoCategorias(false);
  }

  function handleChange(e) {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    dirtyForm.updateData(newForm);
  }

  function seleccionar(m) {
    // Verificar si hay cambios sin guardar antes de seleccionar
    if (dirtyForm.isDirty && modoEdicion) {
      if (window.showDirtyFormModal) {
        window.showDirtyFormModal(
          async () => {
            await guardar();
            doSeleccionar(m);
          },
          () => {
            doSeleccionar(m);
          },
          () => {
            // Cancelar
          },
        );
      }
    } else {
      doSeleccionar(m);
    }
  }

  function doSeleccionar(m) {
    setSelId(m.id);
    const materialForm = {
      nombre: m.nombre,
      descripcion: m.descripcion || "",
      unidad: m.unidad,
      precio_unitario: m.precio_unitario || "",
      user_categoria_id: m.user_categoria_id || "",
    };
    setForm(materialForm);
    dirtyForm.updateData(materialForm);
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
      const m = materiales.find((x) => x.id === selId);
      if (m) seleccionar(m);
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
        unidad: dirtyForm.currentData.unidad || "",
        precio_unitario: dirtyForm.currentData.precio_unitario || "",
        user_categoria_id: dirtyForm.currentData.user_categoria_id || null,
      };
    }

    if (!currentForm.nombre.trim()) {
      setError("El nombre es obligatorio");
      throw new Error("El nombre es obligatorio");
    }
    if (!currentForm.precio_unitario || isNaN(currentForm.precio_unitario)) {
      setError("El precio debe ser un número");
      throw new Error("El precio debe ser un número");
    }

    const userId = await getUserId();

    const datos = {
      user_id: userId,
      nombre: currentForm.nombre.trim(),
      descripcion: currentForm.descripcion.trim(),
      unidad: currentForm.unidad,
      precio_unitario: parseFloat(currentForm.precio_unitario),
      user_categoria_id: currentForm.user_categoria_id || null,
    };

    if (!esNuevo && selId) {
      const { error } = await supabase
        .from("user_materiales")
        .update(datos)
        .eq("id", selId);

      if (error) {
        setError("Error al actualizar");
        throw new Error("Error al actualizar");
      }
      setOk("Material actualizado");
      setModoEdicion(false);
      dirtyForm.markAsClean();

      if (isMobile) {
        setShowMobileForm(false);
      }
    } else {
      const { data, error } = await supabase
        .from("user_materiales")
        .insert([datos])
        .select()
        .single();

      if (error) {
        setError("Error al guardar");
        throw new Error("Error al guardar");
      }
      setOk("Material agregado");
      setEsNuevo(false);
      setModoEdicion(false);
      setSelId(data.id);
      dirtyForm.markAsClean();

      if (isMobile) {
        setShowMobileForm(false);
      }
    }

    setForm(VACIO);
    setEditCategoria(null);
    cargar();
  }

  async function eliminar(id) {
    // Soft delete: actualizar is_active a false en lugar de borrar
    const { error } = await supabase
      .from("user_materiales")
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
      .from("user_materiales")
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

  async function crearCategoria() {
    if (!nuevaCategoria.trim()) return;
    setErrorCategoria("");
    setGuardandoCategoria(true);

    const userId = await getUserId();

    const { data, error } = await supabase
      .from("user_categorias")
      .insert([{ user_id: userId, nombre: nuevaCategoria.trim() }])
      .select()
      .single();

    setGuardandoCategoria(false);

    if (error) {
      if (error.code === "23505") {
        setErrorCategoria("Ya existe una categoría con ese nombre");
      } else {
        setErrorCategoria("Error al crear la categoría");
      }
      return;
    }

    setCategorias((prev) =>
      [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    );
    setForm((prev) => ({ ...prev, user_categoria_id: data.id }));
    setNuevaCategoria("");
    setErrorCategoria("");
    setMostrarModalCategoria(false);
  }

  async function guardarCategoria() {
    setErrorCategoria("");
    setOkCategoria("");
    if (!formCategoria.nombre.trim())
      return setErrorCategoria("El nombre es obligatorio");

    const userId = await getUserId();

    if (editCategoria) {
      const { error } = await supabase
        .from("user_categorias")
        .update({ nombre: formCategoria.nombre.trim(), user_id: userId })
        .eq("id", editCategoria.id);
      if (error) {
        if (error.code === "23505")
          setErrorCategoria("Ya existe una categoría con ese nombre");
        else setErrorCategoria("Error al actualizar");
        return;
      }
      setOkCategoria("Categoría actualizada");
    } else {
      const { data, error } = await supabase
        .from("user_categorias")
        .insert([{ user_id: userId, nombre: formCategoria.nombre.trim() }])
        .select()
        .single();
      if (error) {
        if (error.code === "23505")
          setErrorCategoria("Ya existe una categoría con ese nombre");
        else setErrorCategoria("Error al guardar");
        return;
      }
      setCategorias((prev) =>
        [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)),
      );
      setOkCategoria("Categoría agregada");
    }

    setFormCategoria({ nombre: "" });
    setEditCategoria(null);
    cargarCategorias();
  }

  function editarCategoria(c) {
    setEditCategoria(c);
    setFormCategoria({ nombre: c.nombre });
    setErrorCategoria("");
    setOkCategoria("");
  }

  async function eliminarCategoria(id) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    // Soft delete: actualizar is_active a false en lugar de borrar
    const { error } = await supabase
      .from("user_categorias")
      .update({ is_active: false })
      .eq("id", id);
    if (error) return setErrorCategoria("Error al eliminar");
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  }

  // Mobile-specific functions
  function toggleExpandedRow(materialId) {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedRows(newExpanded);
  }

  function handleKebabClick(materialId, e) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setKebabPosition({ x: rect.left, y: rect.bottom });
    setKebabMenu(kebabMenu === materialId ? null : materialId);
  }

  function handleEditMaterial(materialId) {
    const material = materiales.find((m) => m.id === materialId);
    if (material) {
      seleccionar(material);
      setModoEdicion(true);
      setShowMobileForm(true);
    }
  }

  function handleDeleteMaterial(materialId) {
    const material = materiales.find((m) => m.id === materialId);
    if (!material?.is_active) {
      restaurar(materialId);
    } else {
      setConfirmEliminar(materialId);
    }
  }

  const filtrados = materiales.filter((m) => {
    if (!busqueda) return true;
    const t = busqueda.toLowerCase();
    return (
      m.nombre?.toLowerCase().includes(t) ||
      m.descripcion?.toLowerCase().includes(t) ||
      m.unidad?.toLowerCase().includes(t) ||
      m.categorias?.nombre?.toLowerCase().includes(t)
    );
  });

  const formularioVacio = !selId && !esNuevo;

  // Mobile form visibility logic
  const shouldShowForm = !isMobile || (isMobile && showMobileForm);

  function KebabMenu({
    materialId,
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
                onEdit(materialId);
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
                onDelete(materialId);
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
                onDelete(materialId);
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

  function MobileMaterialRow({ material }) {
    const isExpanded = expandedRows.has(material.id);
    const isEliminado = !material.is_active;

    return (
      <div style={{ marginBottom: "0.5rem" }}>
        <div
          className={`mobile-material-item ${selId === material.id ? "seleccionado" : ""} ${isEliminado ? "eliminado" : ""}`}
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
          onClick={() => toggleExpandedRow(material.id)}
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
              {material.nombre}
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
              ${parseFloat(material.precio_unitario).toLocaleString("es-AR")}
            </div>
            <button
              className="btn btn-secondary"
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.8rem",
                minWidth: "auto",
              }}
              onClick={(e) => handleKebabClick(material.id, e)}
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
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#888",
                  marginBottom: "0.3rem",
                }}
              >
                Unidad: {material.unidad}
              </div>
              {material.user_categorias?.nombre && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#3b82f6",
                    marginBottom: "0.3rem",
                  }}
                >
                  Categoría: {material.user_categorias.nombre}
                </div>
              )}
              {material.descripcion && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#666",
                    marginBottom: "0.3rem",
                    wordWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {material.descripcion}
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
                ? "Nuevo material"
                : selId
                  ? "Datos del material"
                  : "Seleccioná un material"}
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
                !esNuevo &&
                !modoEdicion &&
                (() => {
                  const material = materiales.find((m) => m.id === selId);
                  const isEliminado = !material?.is_active;
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
                  const material = materiales.find((m) => m.id === selId);
                  const isEliminado = !material?.is_active;
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
              placeholder="Nombre (ej: Caño 40x20) *"
              value={form.nombre}
              onChange={handleChange}
              readOnly={!modoEdicion}
            />
            <select
              name="unidad"
              value={form.unidad}
              onChange={handleChange}
              disabled={!modoEdicion}
            >
              {UNIDADES.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="form-row" style={{ marginTop: "0.65rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <select
                name="user_categoria_id"
                value={form.user_categoria_id || ""}
                onChange={handleChange}
                disabled={!modoEdicion}
                style={{ width: "100%" }}
              >
                <option value="">
                  {cargandoCategorias ? "Cargando..." : "Sin categoría"}
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            {!soloLectura && modoEdicion && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ whiteSpace: "nowrap", padding: "0.6rem 1rem" }}
                onClick={() => setMostrarModalCategoria(true)}
              >
                + Nueva
              </button>
            )}
          </div>

          <input
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            readOnly={!modoEdicion}
            style={{ marginTop: "0.65rem" }}
          />

          <input
            name="precio_unitario"
            type="number"
            placeholder="Precio unitario ($) *"
            value={form.precio_unitario}
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

      {/* BUSCADOR */}
      <div className="md-search-area">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <input
            placeholder="Buscar material..."
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
          {!isMobile && !soloLectura && (
            <button
              className="btn btn-secondary"
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 0.75rem",
              }}
              onClick={() => {
                setMostrarGestionCategorias(true);
                setErrorCategoria("");
                setOkCategoria("");
                setFormCategoria({ nombre: "" });
                setEditCategoria(null);
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>🏷️</span>

              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: "1.1",
                }}
              >
                <span>Categorías</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <div className="md-list-area">
        {cargando ? (
          <p style={{ color: "#888", padding: "1rem" }}>Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p style={{ color: "#888", padding: "1rem" }}>No hay materiales</p>
        ) : (
          <>
            {/* Vista Desktop */}
            <div className="desktop-view">
              <table style={{ tableLayout: "fixed", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "45%", textAlign: "left" }}>Nombre</th>
                    <th style={{ width: "20%" }}>Categoría</th>
                    <th style={{ width: "10%" }}>Unidad</th>
                    <th style={{ width: "25%" }}>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((m) => (
                    <tr
                      key={m.id}
                      className={`${selId === m.id ? "seleccionado" : ""} ${!m.is_active ? "eliminado" : ""}`}
                      onClick={() => seleccionar(m)}
                      style={
                        !m.is_active
                          ? {
                              color: "#999",
                              textDecoration: "line-through",
                              opacity: 0.7,
                            }
                          : {}
                      }
                    >
                      <td style={{ textAlign: "left" }}>
                        <span>{m.nombre}</span>
                        {!m.is_active && (
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
                      <td>{m.user_categorias?.nombre || "—"}</td>
                      <td
                        style={{
                          textAlign: "center",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.unidad}
                      </td>
                      <td
                        style={{ textAlign: "right", fontFamily: "monospace" }}
                      >
                        ${parseFloat(m.precio_unitario).toLocaleString("es-AR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            {isMobile && (
              <div style={{ padding: "0.5rem" }}>
                {filtrados.map((m) => (
                  <MobileMaterialRow key={m.id} material={m} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL CONFIRMAR ELIMINAR */}
      {confirmEliminar && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¿Eliminar material?</h3>
            <p
              style={{
                color: "#888",
                fontSize: "0.9rem",
                margin: "0.5rem 0 1rem",
              }}
            >
              El material será archivado y no aparecerá en los listados. Podrás
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

      {/* MODAL NUEVA CATEGORÍA */}
      {mostrarModalCategoria && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Nueva categoría</h3>
            {errorCategoria && (
              <p className="msg-error" style={{ marginTop: "0.5rem" }}>
                {errorCategoria}
              </p>
            )}
            <input
              value={nuevaCategoria}
              onChange={(e) => {
                setNuevaCategoria(e.target.value);
                setErrorCategoria("");
              }}
              placeholder="Nombre"
              onKeyDown={(e) => e.key === "Enter" && crearCategoria()}
            />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button
                className="btn btn-primary"
                onClick={crearCategoria}
                disabled={guardandoCategoria}
              >
                {guardandoCategoria ? "Guardando..." : "Guardar"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setMostrarModalCategoria(false);
                  setErrorCategoria("");
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GESTIÓN CATEGORÍAS */}
      {mostrarGestionCategorias && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: "480px", maxWidth: "95%" }}>
            <h3 style={{ margin: 0, marginBottom: "1rem" }}>
              🏷️ Gestionar categorías
            </h3>

            {errorCategoria && <p className="msg-error">{errorCategoria}</p>}
            {okCategoria && <p className="msg-ok">{okCategoria}</p>}

            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
            >
              <input
                placeholder={
                  editCategoria ? "Editar nombre..." : "Nueva categoría..."
                }
                value={formCategoria.nombre}
                onChange={(e) => {
                  setFormCategoria({ nombre: e.target.value });
                  setErrorCategoria("");
                  setOkCategoria("");
                }}
                onKeyDown={(e) => e.key === "Enter" && guardarCategoria()}
                style={{ margin: 0 }}
              />
              <button
                className="btn btn-primary"
                onClick={guardarCategoria}
                style={{ whiteSpace: "nowrap" }}
              >
                {editCategoria ? "Guardar" : "+ Agregar"}
              </button>
              {editCategoria && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditCategoria(null);
                    setFormCategoria({ nombre: "" });
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {categorias.length === 0 ? (
              <p style={{ color: "#888", fontSize: "0.9rem" }}>
                No hay categorías todavía
              </p>
            ) : (
              <table>
                <tbody>
                  {categorias.map((c) => (
                    <tr key={c.id}>
                      <td
                        style={{
                          color:
                            editCategoria?.id === c.id ? "#60a5fa" : "#f0f0f0",
                        }}
                      >
                        {c.nombre}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button
                            className="btn btn-secondary"
                            title="Editar"
                            onClick={(e) => {
                              e.stopPropagation();
                              editarCategoria(c);
                            }}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn btn-danger"
                            title="Eliminar"
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarCategoria(c.id);
                            }}
                          >
                            <svg
                              width="13"
                              height="13"
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
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button
              className="btn btn-secondary"
              style={{ width: "100%", marginTop: "1rem" }}
              onClick={() => {
                setMostrarGestionCategorias(false);
                setEditCategoria(null);
                setFormCategoria({ nombre: "" });
                setErrorCategoria("");
                setOkCategoria("");
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Kebab Menu */}
      {kebabMenu && (
        <KebabMenu
          materialId={kebabMenu}
          isVisible={true}
          onClose={() => {
            setKebabMenu(null);
            setKebabPosition(null);
          }}
          onEdit={handleEditMaterial}
          onDelete={handleDeleteMaterial}
          isEliminado={!materiales.find((m) => m.id === kebabMenu)?.is_active}
          position={kebabPosition}
        />
      )}
    </div>
  );
}
