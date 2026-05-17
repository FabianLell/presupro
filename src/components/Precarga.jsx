import { useState, useEffect } from "react";
import { supabase, getUserId } from "../supabase";

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
    columns: 3,
    isTablet: false,
    isMobile: false,
  });

  useEffect(() => {
    function updateGridConfig() {
      const width = window.innerWidth;
      if (width <= 640) {
        setGridConfig({ columns: 1, isTablet: false, isMobile: true });
      } else if (width <= 768) {
        setGridConfig({ columns: 1, isTablet: false, isMobile: true });
      } else if (width <= 1024) {
        setGridConfig({ columns: 2, isTablet: true, isMobile: false });
      } else if (width <= 1280) {
        setGridConfig({ columns: 2, isTablet: false, isMobile: false });
      } else if (width <= 1600) {
        setGridConfig({ columns: 2, isTablet: false, isMobile: false });
      } else {
        setGridConfig({ columns: 3, isTablet: false, isMobile: false });
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
function VistaDetalladaRubro({ rubro, onVolver, rubrosSeleccionados }) {
  const [categorias, setCategorias] = useState([]);
  const [materiales, setMateriales] = useState({});
  const [categoriasExpandidas, setCategoriasExpandidas] = useState({});
  const [categoriasActivadas, setCategoriasActivadas] = useState({});
  const [materialesActivados, setMaterialesActivados] = useState({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    let isMounted = true;

    async function cargarDatosRubro() {
      if (!isMounted) return;

      try {
        setCargando(true);

        // Cargar categorías del rubro
        const { data: cats } = await supabase
          .from("system_categorias")
          .select(
            `
            id,
            nombre,
            icono
          `,
          )
          .eq("system_rubro_id", rubro.id);

        // Cargar materiales del rubro
        const { data: mats } = await supabase
          .from("system_materiales")
          .select(
            `
            id,
            nombre,
            descripcion,
            unidad,
            precio_unitario,
            system_categoria_id
          `,
          )
          .in("system_categoria_id", cats?.map((c) => c.id) || []);

        if (!isMounted) return;

        // Organizar datos por categorías
        const materialesPorCategoria = {};
        mats?.forEach((mat) => {
          const catId = mat.system_categoria_id;
          if (!materialesPorCategoria[catId]) {
            materialesPorCategoria[catId] = [];
          }
          materialesPorCategoria[catId].push({
            id: mat.id,
            nombre: mat.nombre,
            descripcion: mat.descripcion,
            unidad: mat.unidad,
            precio: mat.precio_unitario,
          });
        });

        setCategorias(cats || []);
        setMateriales(materialesPorCategoria);

        // Cargar user_materiales del usuario para este rubro
        const userId = await getUserId();
        const { data: userCategorias } = await supabase
          .from("user_categorias")
          .select("id, system_categoria_id")
          .eq("user_id", userId);

        const userCategoriaIds = userCategorias?.map((uc) => uc.id) || [];

        const { data: userMateriales } = await supabase
          .from("user_materiales")
          .select("system_material_id, user_categoria_id, is_active")
          .eq("user_id", userId)
          .in("user_categoria_id", userCategoriaIds)
          .not("system_material_id", "is", null);

        if (!isMounted) return;

        // Mapear system_material_id a system_categoria_id
        const materialToCategoria = {};
        userCategorias?.forEach((uc) => {
          const matsInCat =
            userMateriales?.filter((um) => um.user_categoria_id === uc.id) ||
            [];
          matsInCat.forEach((um) => {
            if (um.system_material_id) {
              materialToCategoria[um.system_material_id] =
                uc.system_categoria_id;
            }
          });
        });

        // Marcar materiales activados según user_materiales
        const materialesActivadosState = {};
        const categoriasActivadasState = {};

        userMateriales?.forEach((um) => {
          if (um.system_material_id && um.is_active) {
            materialesActivadosState[um.system_material_id] = true;
            const catId = materialToCategoria[um.system_material_id];
            if (catId) {
              categoriasActivadasState[catId] = true;
            }
          }
        });

        setMaterialesActivados(materialesActivadosState);
        setCategoriasActivadas(categoriasActivadasState);

        // Si el rubro está seleccionado, activar todas sus categorías y materiales
        if (rubrosSeleccionados && rubrosSeleccionados.includes(rubro.id)) {
          const todasCategoriasActivadas = {};
          const todosMaterialesActivados = {};

          cats.forEach((cat) => {
            todasCategoriasActivadas[cat.id] = true;
            const materialesCat = materialesPorCategoria[cat.id] || [];
            materialesCat.forEach((mat) => {
              todosMaterialesActivados[mat.id] = true;
            });
          });

          setCategoriasActivadas(todasCategoriasActivadas);
          setMaterialesActivados({
            ...materialesActivadosState,
            ...todosMaterialesActivados,
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error al cargar datos del rubro:", error);
        }
      } finally {
        if (isMounted) {
          setCargando(false);
        }
      }
    }

    if (rubro) {
      cargarDatosRubro();
    }

    return () => {
      isMounted = false;
    };
  }, [rubro]);

  function toggleTodasCategorias(activar) {
    const nuevasActivaciones = {};
    const nuevasActivacionesMateriales = {};

    categorias.forEach((cat) => {
      nuevasActivaciones[cat.id] = activar;
      // Activar/desactivar todos los materiales de esta categoría
      const materialesCat = materiales[cat.id] || [];
      materialesCat.forEach((mat) => {
        nuevasActivacionesMateriales[mat.id] = activar;
      });
    });

    setCategoriasActivadas(nuevasActivaciones);
    setMaterialesActivados(nuevasActivacionesMateriales);
  }

  function toggleCategoriaConMateriales(catId) {
    const activar = !categoriasActivadas[catId];
    const nuevasActivaciones = { ...categoriasActivadas, [catId]: activar };
    const nuevasActivacionesMateriales = { ...materialesActivados };

    // Activar/desactivar todos los materiales de esta categoría
    const materialesCat = materiales[catId] || [];
    materialesCat.forEach((mat) => {
      nuevasActivacionesMateriales[mat.id] = activar;
    });

    setCategoriasActivadas(nuevasActivaciones);
    setMaterialesActivados(nuevasActivacionesMateriales);
  }

  function toggleMaterial(matId) {
    setMaterialesActivados((prev) => ({
      ...prev,
      [matId]: !prev[matId],
    }));
  }

  function toggleTodosMaterialesCategoria(activar) {
    const categoriaSeleccionada = categorias.find(
      (cat) => categoriasExpandidas[cat.id],
    );
    if (!categoriaSeleccionada) return;

    const materialesCat = materiales[categoriaSeleccionada.id] || [];
    const nuevasActivacionesMateriales = { ...materialesActivados };

    materialesCat.forEach((mat) => {
      nuevasActivacionesMateriales[mat.id] = activar;
    });

    setMaterialesActivados(nuevasActivacionesMateriales);
  }

  async function guardarCambiosMateriales() {
    try {
      const userId = await getUserId();

      console.log("=== DEBUG: Iniciando guardarCambiosMateriales ===");
      console.log("Categorías:", categorias);
      console.log("Materiales:", materiales);
      console.log("Materiales activados:", materialesActivados);

      // Obtener user_categorias existentes
      const { data: userCategorias } = await supabase
        .from("user_categorias")
        .select("id, system_categoria_id")
        .eq("user_id", userId);

      console.log("User categorías existentes:", userCategorias);

      const systemCatToUserCat = {};
      userCategorias?.forEach((uc) => {
        systemCatToUserCat[uc.system_categoria_id] = uc.id;
      });

      // Crear user_categorias para todas las categorías del rubro
      for (const cat of categorias) {
        if (!systemCatToUserCat[cat.id]) {
          console.log(`Creando user_categoria para ${cat.nombre} (${cat.id})`);
          const { data: newCat, error: catError } = await supabase
            .from("user_categorias")
            .insert({
              user_id: userId,
              system_categoria_id: cat.id,
              nombre: cat.nombre,
            })
            .select()
            .single();

          if (catError) {
            console.error("Error creando user_categoria:", catError);
          } else {
            console.log("User categoría creada:", newCat);
            systemCatToUserCat[cat.id] = newCat.id;
          }
        } else {
          console.log(
            `User categoría ya existe para ${cat.nombre}: ${systemCatToUserCat[cat.id]}`,
          );
        }
      }

      // Obtener todos los user_materiales existentes del usuario para este rubro
      const userCategoriaIds = Object.values(systemCatToUserCat);
      console.log("User categoria IDs:", userCategoriaIds);

      const { data: userMateriales } = await supabase
        .from("user_materiales")
        .select("id, system_material_id, is_active, user_categoria_id")
        .eq("user_id", userId)
        .in("user_categoria_id", userCategoriaIds)
        .not("system_material_id", "is", null);

      console.log("User materiales existentes:", userMateriales);

      const existingMaterials = {};
      userMateriales?.forEach((um) => {
        existingMaterials[um.system_material_id] = um;
      });

      // Procesar todas las categorías del rubro (no solo las que tienen materiales activados)
      for (const cat of categorias) {
        const userCatId = systemCatToUserCat[cat.id];
        if (!userCatId) {
          console.log(`No user_cat_id para categoría ${cat.nombre}, saltando`);
          continue;
        }

        const materialesCat = materiales[cat.id] || [];
        for (const mat of materialesCat) {
          const activado = materialesActivados[mat.id];
          const existing = existingMaterials[mat.id];

          console.log(
            `Material ${mat.nombre}: activado=${activado}, existing=${!!existing}`,
          );

          if (activado && !existing) {
            // Crear nuevo user_material
            console.log(`Creando user_material para ${mat.nombre}`);
            const { error: matError } = await supabase
              .from("user_materiales")
              .insert({
                user_id: userId,
                user_categoria_id: userCatId,
                system_material_id: mat.id,
                nombre: mat.nombre,
                descripcion: mat.descripcion,
                unidad: mat.unidad,
                precio_unitario: mat.precio,
                is_active: true,
              });
            if (matError) {
              console.error("Error creando user_material:", matError);
            } else {
              console.log(`User_material creado para ${mat.nombre}`);
            }
          } else if (activado && existing && !existing.is_active) {
            // Reactivar material (baja lógica revertida)
            console.log(`Reactivando user_material ${mat.nombre}`);
            await supabase
              .from("user_materiales")
              .update({ is_active: true })
              .eq("id", existing.id);
          } else if (!activado && existing && existing.is_active) {
            // Desactivar material (baja lógica)
            console.log(`Desactivando user_material ${mat.nombre}`);
            await supabase
              .from("user_materiales")
              .update({ is_active: false })
              .eq("id", existing.id);
          }
        }
      }

      alert("Cambios aplicados correctamente");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Error al aplicar los cambios");
    }
  }

  function seleccionarCategoriaParaConfigurar(cat) {
    setCategoriaSeleccionada(cat);
  }

  function volverACategorias() {
    setCategoriaSeleccionada(null);
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

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              fontSize: "24px",
              backgroundColor: "rgba(5, 150, 105, 0.2)",
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
          onClick={guardarCambiosMateriales}
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 1px 3px rgba(59, 130, 246, 0.2)",
          }}
          onMouseEnter={(e) => {
            e.target.style.background =
              "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)";
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 2px 4px rgba(59, 130, 246, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background =
              "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 1px 3px rgba(59, 130, 246, 0.2)";
          }}
        >
          Aplicar
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
        ) : isMobile ? (
          // Vista mobile: diseño actual de lista vertical
          <div>
            {categorias.map((cat) => {
              const expandida = categoriasExpandidas[cat.id];
              const materialesCat = materiales[cat.id] || [];
              const activada = categoriasActivadas[cat.id];

              return (
                <div key={cat.id} style={{ marginBottom: "16px" }}>
                  {/* Categoría */}
                  <div
                    style={{
                      backgroundColor: "#1e293b",
                      border: `1px solid ${activada ? "#059669" : "#374151"}`,
                      borderRadius: "8px",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "18px",
                          backgroundColor: activada
                            ? "rgba(5, 150, 105, 0.2)"
                            : "#10b981",
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {cat.icono}
                      </div>
                      <span
                        style={{
                          color: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
                        {cat.nombre}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {/* Switch de categoría */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <ModernToggle
                          checked={activada}
                          onChange={() => toggleCategoriaConMateriales(cat.id)}
                        />
                      </div>

                      {/* Botón de configuración (solo mobile) */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          seleccionarCategoriaParaConfigurar(cat);
                        }}
                        style={{
                          fontSize: "18px",
                          color: "#6b7280",
                          cursor: "pointer",
                          padding: "6px",
                          borderRadius: "4px",
                          border: "1px solid transparent",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#00CED1";
                          e.currentTarget.style.borderColor = "#00CED1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#6b7280";
                          e.currentTarget.style.borderColor = "transparent";
                        }}
                        title="Configurar materiales"
                      >
                        <svg
                          width="20"
                          height="16"
                          viewBox="0 0 16 12"
                          fill="currentColor"
                        >
                          <line
                            x1="0"
                            y1="2"
                            x2="14"
                            y2="2"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <circle cx="2" cy="2" r="1.5" fill="#00CED1" />
                          <line
                            x1="0"
                            y1="6"
                            x2="14"
                            y2="6"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <circle cx="12" cy="6" r="1.5" fill="#00CED1" />
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

                            {/* Detalles mobile: solo nombre con botón de expansión */}
                            <div
                              style={{
                                color: "#94a3b8",
                                fontSize: "13px",
                                lineHeight: "1.4",
                              }}
                            >
                              {material.descripcion}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Vista de selección de materiales por categoría (solo mobile) */}
            {categoriaSeleccionada && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "#0f172a",
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header de vista de materiales */}
                <div
                  style={{
                    backgroundColor: "#1e293b",
                    padding: "16px 20px",
                    borderBottom: "1px solid #334155",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={volverACategorias}
                    style={{
                      backgroundColor: "#374151",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 12px",
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
                    ←
                  </button>
                  <div
                    style={{
                      fontSize: "20px",
                      backgroundColor: "rgba(5, 150, 105, 0.2)",
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {categoriaSeleccionada.icono}
                  </div>
                  <div>
                    <h3
                      style={{
                        color: "#ffffff",
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      {categoriaSeleccionada.nombre}
                    </h3>
                    <p
                      style={{
                        color: "#94a3b8",
                        margin: "2px 0 0",
                        fontSize: "12px",
                      }}
                    >
                      Selecciona los materiales
                    </p>
                  </div>
                </div>

                {/* Lista de materiales */}
                <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
                  {(() => {
                    const materialesCat =
                      materiales[categoriaSeleccionada.id] || [];
                    if (materialesCat.length === 0) {
                      return (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#6b7280",
                            fontSize: "14px",
                            padding: "2rem",
                          }}
                        >
                          No hay materiales configurados para esta categoría
                        </div>
                      );
                    }

                    return materialesCat.map((material) => {
                      const activado = materialesActivados[material.id];
                      return (
                        <div
                          key={material.id}
                          style={{
                            backgroundColor: "#1e293b",
                            border: `1px solid ${activado ? "#059669" : "#374151"}`,
                            borderRadius: "8px",
                            padding: "12px 16px",
                            marginBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ flex: 1 }}>
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
                            <div
                              style={{
                                color: "#94a3b8",
                                fontSize: "13px",
                              }}
                            >
                              {material.descripcion}
                            </div>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <ModernToggle
                              checked={activado}
                              onChange={() => toggleMaterial(material.id)}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Vista PC: 2 columnas (categorías a la izquierda, materiales a la derecha)
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "20px",
              height: "calc(100vh - 160px)",
              maxHeight: "calc(100vh - 160px)",
            }}
          >
            {/* Columna 1: Categorías */}
            <div
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #374151",
                borderRadius: "8px",
                padding: "16px",
                overflowY: "auto",
                maxHeight: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  borderBottom: "1px solid #374151",
                  paddingBottom: "8px",
                }}
              >
                <h3
                  style={{
                    color: "#ffffff",
                    margin: "0",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Categorías
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    Todas
                  </span>
                  <ModernToggle
                    checked={categorias.every(
                      (cat) => categoriasActivadas[cat.id],
                    )}
                    onChange={(checked) => toggleTodasCategorias(checked)}
                  />
                </div>
              </div>
              {categorias.map((cat) => {
                const materialesCat = materiales[cat.id] || [];
                const seleccionada = categoriasExpandidas[cat.id];
                const activada = categoriasActivadas[cat.id];

                return (
                  <div
                    key={cat.id}
                    style={{
                      backgroundColor: seleccionada ? "#111827" : "transparent",
                      border: seleccionada
                        ? "1px solid #10b981"
                        : activada
                          ? "1px solid #059669"
                          : "1px solid transparent",
                      borderRadius: "6px",
                      padding: "12px",
                      marginBottom: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!seleccionada) {
                        e.currentTarget.style.backgroundColor = "#374151";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!seleccionada) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        backgroundColor: activada
                          ? "rgba(5, 150, 105, 0.2)"
                          : "rgba(55, 65, 81, 0.3)",
                        width: "28px",
                        height: "28px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {cat.icono}
                    </div>
                    <div
                      style={{ flex: 1 }}
                      onClick={() => {
                        // Al hacer clic, expandir esta categoría y colapsar las demás
                        const nuevasExpansiones = {};
                        categorias.forEach((c) => {
                          nuevasExpansiones[c.id] = c.id === cat.id;
                        });
                        setCategoriasExpandidas(nuevasExpansiones);
                      }}
                    >
                      <div
                        style={{
                          color: "#ffffff",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        {cat.nombre}
                      </div>
                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: "12px",
                        }}
                      >
                        {materialesCat.length} materiales
                      </div>
                    </div>
                    {/* Switch de categoría */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <ModernToggle
                        checked={activada}
                        onChange={() => toggleCategoriaConMateriales(cat.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Columna 2: Materiales de la categoría seleccionada */}
            <div
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #374151",
                borderRadius: "8px",
                padding: "16px",
                overflowY: "auto",
                maxHeight: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  borderBottom: "1px solid #374151",
                  paddingBottom: "8px",
                }}
              >
                <h3
                  style={{
                    color: "#ffffff",
                    margin: "0",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Materiales
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    Todos
                  </span>
                  <ModernToggle
                    checked={(() => {
                      const categoriaSeleccionada = categorias.find(
                        (cat) => categoriasExpandidas[cat.id],
                      );
                      if (!categoriaSeleccionada) return false;
                      const materialesCat =
                        materiales[categoriaSeleccionada.id] || [];
                      return materialesCat.every(
                        (mat) => materialesActivados[mat.id],
                      );
                    })()}
                    onChange={(checked) =>
                      toggleTodosMaterialesCategoria(checked)
                    }
                  />
                </div>
              </div>
              {(() => {
                const categoriaSeleccionada = categorias.find(
                  (cat) => categoriasExpandidas[cat.id],
                );
                const materialesCat = categoriaSeleccionada
                  ? materiales[categoriaSeleccionada.id] || []
                  : [];

                if (!categoriaSeleccionada) {
                  return (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#6b7280",
                        fontSize: "14px",
                        padding: "2rem",
                      }}
                    >
                      Selecciona una categoría para ver sus materiales
                    </div>
                  );
                }

                if (materialesCat.length === 0) {
                  return (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#6b7280",
                        fontSize: "14px",
                        padding: "2rem",
                      }}
                    >
                      No hay materiales configurados para esta categoría
                    </div>
                  );
                }

                return (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {materialesCat.map((material) => (
                      <div
                        key={material.id}
                        style={{
                          backgroundColor: "#111827",
                          border: `1px solid ${materialesActivados[material.id] ? "#059669" : "#374151"}`,
                          borderRadius: "6px",
                          padding: "12px 16px",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#1f2937";
                          e.currentTarget.style.borderColor = "#4b5563";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#111827";
                          e.currentTarget.style.borderColor =
                            materialesActivados[material.id]
                              ? "#059669"
                              : "#374151";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <div
                            style={{
                              color: "#ffffff",
                              fontSize: "15px",
                              fontWeight: "600",
                            }}
                          >
                            {material.nombre}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                            }}
                          >
                            <div
                              style={{
                                color: "#94a3b8",
                                fontSize: "13px",
                              }}
                            >
                              {material.unidad}
                            </div>
                            <div
                              style={{
                                color: "#10b981",
                                fontSize: "14px",
                                fontWeight: "600",
                              }}
                            >
                              ${material.precio || "N/A"}
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <ModernToggle
                                checked={materialesActivados[material.id]}
                                onChange={() => toggleMaterial(material.id)}
                              />
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            color: "#94a3b8",
                            fontSize: "13px",
                            lineHeight: "1.4",
                          }}
                        >
                          {material.descripcion}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Precarga() {
  const [rubros, setRubros] = useState([]);
  const [rubrosSeleccionados, setRubrosSeleccionados] = useState([]);
  const [rubrosSeleccionadosIniciales, setRubrosSeleccionadosIniciales] =
    useState([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const gridConfig = useGridConfig();

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para comparar arrays de UUIDs sin importar orden
  function arraysIguales(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }

  // Verificar si hay cambios pendientes
  const hayCambiosPendientes = !arraysIguales(
    rubrosSeleccionados,
    rubrosSeleccionadosIniciales,
  );

  // Protección de navegación al salir de la sección Precarga
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hayCambiosPendientes) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hayCambiosPendientes]);

  async function cargarDatos() {
    setCargando(true);
    try {
      const userId = await getUserId();

      // Cargar perfil
      const { data: perfilData } = await supabase
        .from("perfil")
        .select("rubros_seleccionados")
        .eq("user_id", userId)
        .maybeSingle();

      // Cargar rubros
      const { data: rubrosData } = await supabase
        .from("system_rubros")
        .select("*")
        .order("nombre");

      setRubros(rubrosData || []);

      // Establecer rubros seleccionados actuales
      const seleccionados = perfilData?.rubros_seleccionados || [];
      setRubrosSeleccionados(seleccionados);
      setRubrosSeleccionadosIniciales([...seleccionados]);
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

      // Actualizar estado inicial
      setRubrosSeleccionadosIniciales([...rubrosSeleccionados]);

      // Mostrar feedback de sincronización
      setSincronizando(true);
      setTimeout(() => setSincronizando(false), 2000);

      // Recargar datos para sincronizar
      await cargarDatos();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  }

  function confirmarSalidaSinGuardar() {
    setMostrarConfirmacion(false);
    if (accionPendiente) {
      accionPendiente();
      setAccionPendiente(null);
    }
    // Restaurar estado inicial
    setRubrosSeleccionados([...rubrosSeleccionadosIniciales]);
  }

  function cancelarSalida() {
    setMostrarConfirmacion(false);
    setAccionPendiente(null);
  }

  function seleccionarRubro(rubro) {
    // No preguntar al entrar a la vista detallada, es solo visualización de la Fuente Maestra
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
        rubrosSeleccionados={rubrosSeleccionados}
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

          {/* Botón de guardar siempre visible */}
          <button
            onClick={guardarCambios}
            disabled={guardando || !hayCambiosPendientes}
            style={{
              background: hayCambiosPendientes
                ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "6px 16px",
              fontSize: "13px",
              fontWeight: "600",
              cursor:
                guardando || !hayCambiosPendientes ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: hayCambiosPendientes
                ? "0 1px 3px rgba(245, 158, 11, 0.2)"
                : "0 1px 3px rgba(0, 0, 0, 0.1)",
              opacity: guardando ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!guardando && hayCambiosPendientes) {
                e.target.style.background =
                  "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 2px 4px rgba(245, 158, 11, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!guardando && hayCambiosPendientes) {
                e.target.style.background =
                  "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 1px 3px rgba(245, 158, 11, 0.2)";
              }
            }}
          >
            {guardando
              ? "Guardando..."
              : sincronizando
                ? "Sincronizando..."
                : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* Contenido principal con grid responsivo y scroll */}
      <div
        style={{
          padding: "16px 24px 32px 24px",
          maxWidth: "1400px",
          margin: "0 auto",
          overflowY: "visible",
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
                  gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(200px, 1fr))`,
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

        {/* Modal de confirmación para salir sin guardar */}
        {mostrarConfirmacion && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #374151",
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "400px",
                width: "90%",
              }}
            >
              <h3
                style={{
                  color: "#ffffff",
                  margin: "0 0 12px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                ¿Deseas salir sin guardar?
              </h3>
              <p
                style={{
                  color: "#94a3b8",
                  margin: "0 0 24px 0",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                Tienes cambios pendientes que se perderán si continúas.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={cancelarSalida}
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
                  Cancelar
                </button>
                <button
                  onClick={confirmarSalidaSinGuardar}
                  style={{
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#b91c1c";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#dc2626";
                  }}
                >
                  Salir sin guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
