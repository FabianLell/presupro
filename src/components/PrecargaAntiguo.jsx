import { useState, useEffect } from "react";
import { supabase, getUserId } from "../supabase";
import { useDirtyForm } from "../hooks/useDirtyForm";

// Hook para detectar mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

// Componente Switch personalizado
function Switch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      className={`switch ${checked ? "switch-on" : "switch-off"} ${disabled ? "switch-disabled" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        position: "relative",
        width: "44px",
        height: "24px",
        backgroundColor: checked ? "#2563eb" : "#374151",
        border: "none",
        borderRadius: "12px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color 0.2s",
        outline: "none",
      }}
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
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

// Componente de icono de configuración
function IconoConfig() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 8.96l4.24 4.24m12.44 0l4.24 4.24M1.54 15.04l4.24-4.24" />
    </svg>
  );
}

// Modal de personalización de rubro
function ModalPersonalizacion({ rubro, isOpen, onClose, onSave }) {
  const [categorias, setCategorias] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [categoriasExpandidas, setCategoriasExpandidas] = useState({});
  const [cargando, setCargando] = useState(false);
  const isMobile = useIsMobile();

  async function cargarDatosRubro() {
    setCargando(true);
    try {
      // Cargar categorías del rubro
      const { data: cats } = await supabase
        .from("rubro_categorias")
        .select(
          `
          categoria_id,
          categorias!inner(id, nombre, icono)
        `,
        )
        .eq("rubro_id", rubro.id);

      // Cargar materiales del rubro
      const { data: mats } = await supabase
        .from("rubro_materiales")
        .select(
          `
          material_id,
          categoria_id,
          materiales!inner(id, nombre, descripcion, unidad, precio_unitario)
        `,
        )
        .eq("rubro_id", rubro.id);

      // Obtener categorías y materiales del usuario para ver estado
      const userId = await getUserId();
      const { data: userCats } = await supabase
        .from("categorias")
        .select("id, deleted_at")
        .eq("user_id", userId)
        .in("id", cats?.map((c) => c.categoria_id) || []);

      const { data: userMats } = await supabase
        .from("materiales")
        .select("id, deleted_at")
        .eq("user_id", userId)
        .in("id", mats?.map((m) => m.material_id) || []);

      // Combinar datos
      const categoriasConEstado =
        cats?.map((cat) => ({
          ...cat.categorias,
          activa: !userCats?.find((uc) => uc.id === cat.categoria_id)
            ?.deleted_at,
        })) || [];

      const materialesConEstado =
        mats?.map((mat) => ({
          ...mat.materiales,
          categoria_id: mat.categoria_id,
          activo: !userMats?.find((um) => um.id === mat.material_id)
            ?.deleted_at,
        })) || [];

      setCategorias(categoriasConEstado);
      setMateriales(materialesConEstado);

      // Expandir primera categoría por defecto
      if (categoriasConEstado.length > 0) {
        setCategoriasExpandidas({ [categoriasConEstado[0].id]: true });
      }
    } catch (error) {
      console.error("Error al cargar datos del rubro:", error);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (isOpen && rubro) {
      cargarDatosRubro();
    }
  }, [isOpen, rubro]);

  function toggleCategoria(categoriaId) {
    setCategoriasExpandidas((prev) => ({
      ...prev,
      [categoriaId]: !prev[categoriaId],
    }));
  }

  function toggleMaterial(materialId) {
    setMateriales((prev) =>
      prev.map((mat) =>
        mat.id === materialId ? { ...mat, activo: !mat.activo } : mat,
      ),
    );
  }

  function toggleCategoriaActiva(categoriaId) {
    setCategorias((prev) =>
      prev.map((cat) =>
        cat.id === categoriaId ? { ...cat, activa: !cat.activa } : cat,
      ),
    );

    // También activar/desactivar todos los materiales de la categoría
    setMateriales((prev) =>
      prev.map((mat) =>
        mat.categoria_id === categoriaId
          ? { ...mat, activo: !mat.activo }
          : mat,
      ),
    );
  }

  async function handleGuardar() {
    const userId = await getUserId();

    try {
      // Actualizar categorías
      for (const categoria of categorias) {
        if (categoria.activa) {
          // Restaurar si estaba eliminada
          await supabase
            .from("categorias")
            .update({ deleted_at: null })
            .eq("id", categoria.id)
            .eq("user_id", userId);
        } else {
          // Soft delete
          await supabase
            .from("categorias")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", categoria.id)
            .eq("user_id", userId);
        }
      }

      // Actualizar materiales
      for (const material of materiales) {
        if (material.activo) {
          // Restaurar si estaba eliminado
          await supabase
            .from("materiales")
            .update({ deleted_at: null })
            .eq("id", material.id)
            .eq("user_id", userId);
        } else {
          // Soft delete
          await supabase
            .from("materiales")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", material.id)
            .eq("user_id", userId);
        }
      }

      onSave();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className={`modal ${isMobile ? "modal-mobile" : ""}`}
        style={{ maxWidth: isMobile ? "95vw" : "800px", width: "100%" }}
      >
        <div className="modal-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>{rubro.icono}</span>
            Personalizar {rubro.nombre}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div
          className="modal-body"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          {cargando ? (
            <div
              style={{ textAlign: "center", padding: "2rem", color: "#888" }}
            >
              Cargando...
            </div>
          ) : (
            <div>
              {/* Lista de categorías con tree-view */}
              {categorias.map((categoria) => (
                <div key={categoria.id} style={{ marginBottom: "1rem" }}>
                  {/* Header de categoría */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem",
                      backgroundColor: "#1a1a1a",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleCategoria(categoria.id)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>
                        {categoria.icono}
                      </span>
                      <span>{categoria.nombre}</span>
                      <span style={{ color: "#888", fontSize: "0.9rem" }}>
                        (
                        {
                          materiales.filter(
                            (m) => m.categoria_id === categoria.id,
                          ).length
                        }{" "}
                        materiales)
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Switch
                        checked={categoria.activa}
                        onChange={() => toggleCategoriaActiva(categoria.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span style={{ color: "#666", fontSize: "0.8rem" }}>
                        {categoriasExpandidas[categoria.id] ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>

                  {/* Materiales de la categoría (expandido) */}
                  {categoriasExpandidas[categoria.id] && (
                    <div style={{ marginLeft: "2rem", marginTop: "0.5rem" }}>
                      {materiales
                        .filter((m) => m.categoria_id === categoria.id)
                        .map((material) => (
                          <div
                            key={material.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0.5rem",
                              borderBottom: "1px solid #2a2a2a",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500 }}>
                                {material.nombre}
                              </div>
                              {!isMobile && (
                                <div
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "#888",
                                    marginTop: "0.2rem",
                                  }}
                                >
                                  {material.descripcion} • {material.unidad} • $
                                  {material.precio_unitario}
                                </div>
                              )}
                              {isMobile && (
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#888",
                                    marginTop: "0.1rem",
                                  }}
                                >
                                  {material.unidad} • $
                                  {material.precio_unitario}
                                </div>
                              )}
                            </div>
                            <Switch
                              checked={material.activo}
                              onChange={() => toggleMaterial(material.id)}
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleGuardar}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Precarga() {
  const [rubros, setRubros] = useState([]);
  const [rubrosSeleccionados, setRubrosSeleccionados] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalRubro, setModalRubro] = useState(null);
  const isMobile = useIsMobile();

  const { isDirty, setDirty, markAsClean } = useDirtyForm();

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      // Cargar perfil
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: perfilData } = await supabase
        .from("perfil")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setPerfil(perfilData);

      // Cargar todos los rubros
      const { data: rubrosData } = await supabase
        .from("rubros")
        .select("*")
        .order("nombre");

      setRubros(rubrosData || []);

      // Establecer rubros seleccionados actuales
      const seleccionados = perfilData?.rubros_seleccionados || [];
      setRubrosSeleccionados(seleccionados);
      markAsClean();
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setCargando(false);
    }
  }

  function toggleRubro(rubroId) {
    const nuevosSeleccionados = rubrosSeleccionados.includes(rubroId)
      ? rubrosSeleccionados.filter((id) => id !== rubroId)
      : [...rubrosSeleccionados, rubroId];

    setRubrosSeleccionados(nuevosSeleccionados);
    setDirty();
  }

  function abrirModalRubro(rubro) {
    setModalRubro(rubro);
  }

  function cerrarModalRubro() {
    if (isDirty) {
      if (
        confirm(
          "¿Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?",
        )
      ) {
        setModalRubro(null);
        markAsClean();
      }
    } else {
      setModalRubro(null);
    }
  }

  async function guardarCambios() {
    if (!perfil) return;

    setGuardando(true);
    try {
      // Actualizar perfil con nuevos rubros seleccionados
      const { error } = await supabase
        .from("perfil")
        .update({ rubros_seleccionados: rubrosSeleccionados })
        .eq("user_id", perfil.user_id);

      if (error) throw error;

      markAsClean();
      // Recargar datos para sincronizar
      await cargarDatos();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarCambiosModal() {
    setModalRubro(null);
    markAsClean();
    // Recargar para actualizar estado
    await cargarDatos();
  }

  const rubrosActivos = rubros.filter((r) =>
    rubrosSeleccionados.includes(r.id),
  );

  return (
    <div style={{ padding: isMobile ? "0.8rem" : "1.2rem" }}>
      <div style={{ marginBottom: "0.6rem" }}>
        <p style={{ color: "#888", fontSize: "0.75rem", lineHeight: 1.1 }}>
          Activa los rubros que necesites para tu negocio y personaliza las
          categorías y materiales disponibles.
        </p>
      </div>

      {cargando ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
          Cargando rubros disponibles...
        </div>
      ) : (
        <>
          {/* Resumen */}
          <div
            style={{
              backgroundColor: "#1a1a1a",
              padding: "0.8rem",
              borderRadius: "6px",
              marginBottom: "1.2rem",
              border: "1px solid #2a2a2a",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ color: "#fff", fontWeight: 600 }}>
                  {rubrosActivos.length} de {rubros.length} rubros activos
                </div>
                <div
                  style={{
                    color: "#888",
                    fontSize: "0.9rem",
                    marginTop: "0.2rem",
                  }}
                >
                  Los rubros activos estarán disponibles en tus presupuestos
                </div>
              </div>
              {isDirty && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#f59e0b", fontSize: "0.9rem" }}>
                    Hay cambios sin guardar
                  </span>
                  <button
                    className="btn btn-primary"
                    onClick={guardarCambios}
                    disabled={guardando}
                    style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
                  >
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grid de rubros */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "0.4rem",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "0.2rem",
            }}
          >
            {rubros.map((rubro) => {
              const activo = rubrosSeleccionados.includes(rubro.id);
              return (
                <div
                  key={rubro.id}
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: activo ? "2px solid #2563eb" : "1px solid #2a2a2a",
                    borderRadius: "4px",
                    padding: "0.6rem",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.3rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.2rem",
                          backgroundColor: activo ? "#2563eb" : "#374151",
                          width: "28px",
                          height: "28px",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {rubro.icono}
                      </div>
                      <div>
                        <h3
                          style={{
                            color: "#fff",
                            margin: 0,
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          {rubro.nombre}
                        </h3>
                        <p
                          style={{
                            color: "#888",
                            fontSize: "0.7rem",
                            margin: "0.1rem 0 0",
                            lineHeight: 1.2,
                          }}
                        >
                          {rubro.descripcion}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Switch
                      checked={activo}
                      onChange={() => toggleRubro(rubro.id)}
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={() => abrirModalRubro(rubro)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontSize: "0.7rem",
                        padding: "0.2rem 0.4rem",
                      }}
                    >
                      <IconoConfig />
                      Personalizar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal de personalización */}
      <ModalPersonalizacion
        rubro={modalRubro}
        isOpen={!!modalRubro}
        onClose={cerrarModalRubro}
        onSave={guardarCambiosModal}
      />
    </div>
  );
}
