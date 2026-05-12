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

// Hook para detectar el tamaño de pantalla y configurar el grid con máxima densidad
function useGridConfig() {
  const [gridConfig, setGridConfig] = useState({
    columns: 3, // Reducido a 3 columnas
    isTablet: false,
    isMobile: false,
  });

  useEffect(() => {
    function updateGridConfig() {
      const width = window.innerWidth;
      if (width <= 640) {
        // Móvil pequeño - 1 columna
        setGridConfig({ columns: 1, isTablet: false, isMobile: true });
      } else if (width <= 768) {
        // Móvil grande - 1 columna para evitar corte
        setGridConfig({ columns: 1, isTablet: false, isMobile: true });
      } else if (width <= 1024) {
        setGridConfig({ columns: 2, isTablet: true, isMobile: false }); // Reducido de 3 a 2
      } else if (width <= 1280) {
        setGridConfig({ columns: 2, isTablet: false, isMobile: false }); // Reducido de 3 a 2
      } else if (width <= 1600) {
        setGridConfig({ columns: 2, isTablet: false, isMobile: false }); // Reducido de 3 a 2
      } else {
        setGridConfig({ columns: 3, isTablet: false, isMobile: false }); // Reducido de 4 a 3
      }
    }

    updateGridConfig();
    window.addEventListener("resize", updateGridConfig);
    return () => window.removeEventListener("resize", updateGridConfig);
  }, []);

  return gridConfig;
}

// Toggle ultra-compacto estilo SaaS Premium
function ModernToggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      className={`modern-toggle ${checked ? "toggle-on" : "toggle-off"} ${disabled ? "toggle-disabled" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        position: "relative",
        width: "26px",
        height: "14px",
        backgroundColor: checked ? "#059669" : "#475569",
        border: "none",
        borderRadius: "7px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        outline: "none",
        boxShadow: checked
          ? "0 0 0 1px rgba(5, 150, 105, 0.2)"
          : "inset 0 1px 1px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "1px",
          left: checked ? "12px" : "1px",
          width: "12px",
          height: "12px",
          backgroundColor: "#ffffff",
          borderRadius: "50%",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
        }}
      />
    </button>
  );
}

// Tarjeta simple sin expansión ni botones extra
function RubroCard({ rubro, activo, onToggle, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="rubro-card"
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: activo ? "#1f2937" : "#111827",
        border: `1px solid ${activo ? "#059669" : "#374151"}`,
        borderRadius: "8px",
        padding: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: isHovered
          ? "0 4px 6px rgba(0, 0, 0, 0.1)"
          : "0 2px 4px rgba(0, 0, 0, 0.05)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        opacity: activo ? 1 : 0.8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {/* Icono */}
        <div
          style={{
            fontSize: "20px",
            width: "32px",
            height: "32px",
            backgroundColor: activo
              ? "rgba(5, 150, 105, 0.2)"
              : "rgba(55, 65, 81, 0.3)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {rubro.icono}
        </div>

        {/* Nombre */}
        <div
          style={{
            color: activo ? "#f3f4f6" : "#9ca3af",
            fontSize: "14px",
            fontWeight: "500",
            flex: 1,
            textAlign: "left",
          }}
        >
          {rubro.nombre}
        </div>

        {/* Toggle */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ flexShrink: 0, marginRight: "8px" }}
        >
          <ModernToggle checked={activo} onChange={onToggle} disabled={false} />
        </div>

        {/* Icono de configuración */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          style={{
            fontSize: "18px",
            color: isHovered ? "#6b7280" : "#9ca3af",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "4px",
            opacity: isHovered ? 1 : 0.6,
            transition: "all 0.2s ease",
            flexShrink: 0,
            border: isHovered ? `1px solid #00CED1` : "1px solid transparent",
          }}
          title="Configurar rubro"
        >
          <svg width="20" height="16" viewBox="0 0 16 12" fill="currentColor">
            {/* Primera línea con punto a la izquierda */}
            <line
              x1="0"
              y1="2"
              x2="14"
              y2="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="2" cy="2" r="1.5" fill="#00CED1" />

            {/* Segunda línea con punto a la derecha */}
            <line
              x1="0"
              y1="6"
              x2="14"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="12" cy="6" r="1.5" fill="#00CED1" />

            {/* Tercera línea con punto casi a la izquierda */}
            <line
              x1="0"
              y1="10"
              x2="14"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="3" cy="10" r="1.5" fill="#00CED1" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Vista detallada del rubro con tree-view
function VistaDetalladaRubro({ rubro, onVolver }) {
  const [categorias, setCategorias] = useState([]);
  const [materiales, setMateriales] = useState({});
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
          materiales!inner(id, nombre, descripcion, unidad, precio)
        `,
        )
        .eq("rubro_id", rubro.id);

      // Organizar datos por categorías
      const materialesPorCategoria = {};
      mats?.forEach((mat) => {
        const catId = mat.categoria_id;
        if (!materialesPorCategoria[catId]) {
          materialesPorCategoria[catId] = [];
        }
        materialesPorCategoria[catId].push({
          id: mat.material_id,
          nombre: mat.materiales.nombre,
          descripcion: mat.materiales.descripcion,
          unidad: mat.materiales.unidad,
          precio: mat.materiales.precio,
        });
      });

      setCategorias(cats || []);
      setMateriales(materialesPorCategoria);
    } catch (error) {
      console.error("Error al cargar datos del rubro:", error);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (rubro) {
      cargarDatosRubro();
    }
  }, [rubro]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleCategoria(catId) {
    setCategoriasExpandidas((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  }

  if (cargando) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem",
          color: "#888",
          backgroundColor: "#0f172a",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "18px" }}>Cargando detalles del rubro...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh" }}>
      {/* Header de vista detallada */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "16px 20px",
          borderBottom: "1px solid #334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              fontSize: "24px",
              backgroundColor: "#10b981",
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {rubro.icono}
          </div>
          <div>
            <h2
              style={{
                color: "#ffffff",
                margin: 0,
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              {rubro.nombre}
            </h2>
            <p
              style={{
                color: "#94a3b8",
                margin: "4px 0 0",
                fontSize: "14px",
              }}
            >
              {rubro.descripcion}
            </p>
          </div>
        </div>

        <button
          onClick={onVolver}
          style={{
            backgroundColor: "#374151",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#4b5563";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#374151";
          }}
        >
          ← Volver al Listado
        </button>
      </div>

      {/* Contenido del tree-view */}
      <div style={{ padding: "20px" }}>
        {categorias.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            No hay categorías configuradas para este rubro
          </div>
        ) : (
          <div>
            {categorias.map((cat) => {
              const expandida = categoriasExpandidas[cat.categoria_id];
              const materialesCat = materiales[cat.categoria_id] || [];

              return (
                <div key={cat.categoria_id} style={{ marginBottom: "16px" }}>
                  {/* Categoría */}
                  <div
                    onClick={() => toggleCategoria(cat.categoria_id)}
                    style={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#374151";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#1e293b";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "18px",
                          backgroundColor: "#10b981",
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {cat.categorias.icono}
                      </div>
                      <span
                        style={{
                          color: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
                        {cat.categorias.nombre}
                      </span>
                    </div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "20px",
                        transform: expandida ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      ▶
                    </div>
                  </div>

                  {/* Materiales (expandido) */}
                  {expandida && (
                    <div
                      style={{
                        backgroundColor: "#111827",
                        borderLeft: "2px solid #10b981",
                        marginLeft: "24px",
                        borderRadius: "0 0 8px 0",
                        padding: "16px",
                        marginTop: "8px",
                      }}
                    >
                      {materialesCat.length === 0 ? (
                        <div
                          style={{
                            color: "#6b7280",
                            fontSize: "14px",
                            fontStyle: "italic",
                          }}
                        >
                          No hay materiales configurados para esta categoría
                        </div>
                      ) : (
                        materialesCat.map((material) => (
                          <div
                            key={material.id}
                            style={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #374151",
                              borderRadius: "6px",
                              padding: "12px 16px",
                              marginBottom: "12px",
                            }}
                          >
                            <div
                              style={{
                                color: "#ffffff",
                                fontSize: "15px",
                                fontWeight: "500",
                                marginBottom: "4px",
                              }}
                            >
                              {material.nombre}
                            </div>

                            {/* Detalles responsive */}
                            {isMobile ? (
                              <div
                                style={{
                                  color: "#94a3b8",
                                  fontSize: "13px",
                                  lineHeight: "1.4",
                                }}
                              >
                                {material.descripcion}
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr 1fr",
                                  gap: "12px",
                                }}
                              >
                                <div>
                                  <span
                                    style={{
                                      color: "#6b7280",
                                      fontSize: "12px",
                                    }}
                                  >
                                    Descripción:
                                  </span>
                                  <div
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "13px",
                                    }}
                                  >
                                    {material.descripcion}
                                  </div>
                                </div>
                                <div>
                                  <span
                                    style={{
                                      color: "#6b7280",
                                      fontSize: "12px",
                                    }}
                                  >
                                    Unidad:
                                  </span>
                                  <div
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "13px",
                                    }}
                                  >
                                    {material.unidad}
                                  </div>
                                </div>
                                <div>
                                  <span
                                    style={{
                                      color: "#6b7280",
                                      fontSize: "12px",
                                    }}
                                  >
                                    Precio:
                                  </span>
                                  <div
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "13px",
                                    }}
                                  >
                                    ${material.precio || "N/A"}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Precarga() {
  const [rubros, setRubros] = useState([]);
  const [rubrosSeleccionados, setRubrosSeleccionados] = useState([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const gridConfig = useGridConfig();

  const { isDirty, markAsClean } = useDirtyForm();

  useEffect(() => {
    cargarDatos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function cargarDatos() {
    setCargando(true);
    try {
      const userId = await getUserId();

      // Cargar perfil
      const { data: perfilData } = await supabase
        .from("perfil")
        .select("rubros_seleccionados")
        .eq("user_id", userId)
        .single();

      // Cargar rubros
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
  }

  async function guardarCambios() {
    setGuardando(true);
    try {
      const userId = await getUserId();

      // Actualizar perfil con nuevos rubros seleccionados
      const { error } = await supabase
        .from("perfil")
        .update({ rubros_seleccionados: rubrosSeleccionados })
        .eq("user_id", userId);

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

  function seleccionarRubro(rubro) {
    setRubroSeleccionado(rubro);
  }

  function volverAlListado() {
    setRubroSeleccionado(null);
  }

  const rubrosActivos = rubros.filter((r) =>
    rubrosSeleccionados.includes(r.id),
  );

  // Si hay un rubro seleccionado, mostrar vista detallada
  if (rubroSeleccionado) {
    return (
      <VistaDetalladaRubro
        rubro={rubroSeleccionado}
        onVolver={volverAlListado}
      />
    );
  }

  // Vista principal de listado
  return (
    <div
      style={{ backgroundColor: "#0f172a", height: "100vh", overflowY: "auto" }}
    >
      {/* Banner de estado superior con diseño delgado */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          padding: "12px 24px",
          borderBottom: "1px solid #475569",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                backgroundColor: "rgba(5, 150, 105, 0.1)",
                color: "#059669",
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                border: "1px solid rgba(5, 150, 105, 0.2)",
              }}
            >
              {rubrosActivos.length} de {rubros.length} rubros activos
            </div>
            <div
              style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "400" }}
            >
              Los rubros activos estarán disponibles en tus presupuestos
            </div>
          </div>

          {isDirty && (
            <button
              onClick={guardarCambios}
              disabled={guardando}
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 16px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(245, 158, 11, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background =
                  "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 2px 4px rgba(245, 158, 11, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background =
                  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 1px 3px rgba(245, 158, 11, 0.2)";
              }}
            >
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal con grid responsivo y scroll */}
      <div
        style={{
          padding: "16px 24px 32px 24px",
          maxWidth: "1400px",
          margin: "0 auto",
          // Eliminadas todas las restricciones de altura
          overflowY: "visible", // Cambiado a visible para que no corte
          overflowX: "hidden",
        }}
      >
        {cargando ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              color: "#94a3b8",
              fontSize: "16px",
              backgroundColor: "#111827",
              borderRadius: "12px",
              border: "1px solid #1f2937",
            }}
          >
            <div style={{ fontSize: "18px", marginBottom: "8px" }}>
              Cargando rubros disponibles...
            </div>
            <div style={{ fontSize: "14px", opacity: 0.7 }}>
              Preparando tu catálogo personalizado
            </div>
          </div>
        ) : (
          <div>
            {rubros.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#94a3b8",
                  fontSize: "16px",
                  backgroundColor: "#111827",
                  borderRadius: "12px",
                  border: "1px solid #1f2937",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    marginBottom: "16px",
                    opacity: 0.5,
                  }}
                >
                  📦
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "500",
                    marginBottom: "8px",
                  }}
                >
                  No hay rubros configurados
                </div>
                <div style={{ fontSize: "14px", opacity: 0.7 }}>
                  Contacta al administrador para configurar tu catálogo
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(200px, 1fr))`, // Ancho mínimo de 200px
                  gap: "8px",
                  alignItems: "stretch",
                  paddingBottom: "40px",
                }}
              >
                {rubros.map((rubro) => {
                  const activo = rubrosSeleccionados.includes(rubro.id);
                  return (
                    <RubroCard
                      key={rubro.id}
                      rubro={rubro}
                      activo={activo}
                      onToggle={() => toggleRubro(rubro.id)}
                      onClick={() => seleccionarRubro(rubro)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
