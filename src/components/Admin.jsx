import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { calcularEstadoCuenta } from "../supabase";

export default function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [perfiles, setPerfiles] = useState({});
  const [cantPresupuestos, setCantPresupuestos] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [ultimoEstado, setUltimoEstado] = useState("ok");
  const [activando, setActivando] = useState(null);

  useEffect(() => {
    cargarTodo();
  }, []);

  function formatearError(detalle) {
    const texto = String(detalle || "").toLowerCase();
    if (texto.includes("401") || texto.includes("unauthorized"))
      return "Tu sesión no es válida para acceder al panel admin. Cerrá sesión y volvé a ingresar.";
    if (texto.includes("403") || texto.includes("forbidden"))
      return "Tu cuenta no tiene permisos para ver usuarios registrados.";
    if (texto.includes("missing required env vars"))
      return "La función admin-list-users no está configurada correctamente en Supabase Secrets.";
    if (texto.includes("failed to fetch") || texto.includes("network"))
      return "No se pudo conectar con Supabase Edge Functions. Verificá conexión y deploy.";
    return "No se pudo cargar la lista de usuarios. Verificá la configuración de admin-list-users.";
  }

  async function cargarTodo() {
    setCargando(true);
    setError("");
    setUltimoEstado("ok");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        setError("No hay sesión activa para consultar admin-list-users.");
        setCargando(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "admin-list-users",
        {
          method: "POST",
          body: {},
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (error) {
        let detalle = error.message || "Error al consultar admin-list-users";
        if (error.context) {
          const body = await error.context.json().catch(() => null);
          if (body?.error)
            detalle = `${body.error}${body?.details ? ` (${body.details})` : ""}`;
          else if (error.context.status)
            detalle = `Error ${error.context.status} al consultar admin-list-users`;
        }
        setError(formatearError(detalle));
        setUltimoEstado("error");
        setCargando(false);
        return;
      }

      if (data?.error) {
        setError(
          formatearError(
            `${data.error}${data?.details ? ` (${data.details})` : ""}`,
          ),
        );
        setUltimoEstado("error");
        setCargando(false);
        return;
      }

      const listaUsuarios = Array.isArray(data?.users) ? data.users : [];
      setUsuarios(listaUsuarios);

      // Cargar perfiles y cantidad de presupuestos
      const ids = listaUsuarios.map((u) => u.id);
      if (ids.length > 0) {
        const { data: perfilesData } = await supabase
          .from("perfil")
          .select("*")
          .in("user_id", ids);

        const mapaPerfiles = {};
        (perfilesData || []).forEach((p) => {
          mapaPerfiles[p.user_id] = p;
        });
        setPerfiles(mapaPerfiles);

        // Contar presupuestos por usuario
        const { data: presData } = await supabase
          .from("presupuestos")
          .select("user_id");

        const mapaCant = {};
        (presData || []).forEach((p) => {
          mapaCant[p.user_id] = (mapaCant[p.user_id] || 0) + 1;
        });
        setCantPresupuestos(mapaCant);
      }

      setUltimaActualizacion(new Date());
      setUltimoEstado("ok");
    } catch (e) {
      setError(
        "No se pudo cargar el panel de administración. Reintentá en unos segundos.",
      );
      setUltimoEstado("error");
      console.error("admin-list-users unexpected error:", e);
    }
    setCargando(false);
  }

  async function toggleActivar(userId, valorActual) {
    setActivando(userId);
    await supabase
      .from("perfil")
      .update({ activo: !valorActual })
      .eq("user_id", userId);
    setPerfiles((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], activo: !valorActual },
    }));
    setActivando(null);
  }

  function badgeEstadoCuenta(userId) {
    const perfil = perfiles[userId];
    const cant = cantPresupuestos[userId] || 0;
    const estado = calcularEstadoCuenta(perfil, cant);

    if (estado.activo) {
      return (
        <span
          className="badge"
          style={{ background: "#14532d", color: "#4ade80" }}
        >
          Activo
        </span>
      );
    }
    if (estado.soloLectura) {
      return (
        <span
          className="badge"
          style={{ background: "#450a0a", color: "#f87171" }}
        >
          Vencido
        </span>
      );
    }
    return (
      <span
        className="badge"
        style={{ background: "#1e3a5f", color: "#60a5fa" }}
      >
        Prueba {estado.diasRestantes}d / {estado.presupuestosRestantes}p
      </span>
    );
  }

  return (
    <>
      <h1>🛡️ Panel Admin</h1>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Usuarios registrados</h2>
            {ultimaActualizacion && (
              <p
                style={{
                  margin: "0.3rem 0 0",
                  color: ultimoEstado === "error" ? "#f59e0b" : "#888",
                  fontSize: "0.82rem",
                }}
              >
                Última actualización:{" "}
                {ultimaActualizacion.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
                {ultimoEstado === "error" ? " (último intento con error)" : ""}
              </p>
            )}
          </div>
          <button className="btn btn-secondary" onClick={cargarTodo}>
            Actualizar
          </button>
        </div>

        {error && <p className="msg-error">{error}</p>}

        {cargando ? (
          <p style={{ color: "#888" }}>Cargando usuarios...</p>
        ) : usuarios.length === 0 ? (
          <p style={{ color: "#888" }}>No hay usuarios para mostrar</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Negocio</th>
                <th>Registro</th>
                <th>Último acceso</th>
                <th>Presup.</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const perfil = perfiles[u.id];
                const cant = cantPresupuestos[u.id] || 0;
                const estado = calcularEstadoCuenta(perfil, cant);
                return (
                  <tr key={u.id}>
                    <td>{u.email || "—"}</td>
                    <td>{perfil?.nombre_negocio || u.nombre_negocio || "—"}</td>
                    <td style={{ fontSize: "0.82rem", color: "#888" }}>
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString("es-AR")
                        : "—"}
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "#888" }}>
                      {u.last_sign_in_at
                        ? new Date(u.last_sign_in_at).toLocaleDateString(
                            "es-AR",
                          )
                        : "—"}
                    </td>
                    <td style={{ textAlign: "center" }}>{cant}</td>
                    <td>{badgeEstadoCuenta(u.id)}</td>
                    <td>
                      <button
                        className={`btn ${estado.activo ? "btn-danger" : "btn-primary"}`}
                        style={{
                          fontSize: "0.78rem",
                          padding: "0.3rem 0.6rem",
                        }}
                        disabled={activando === u.id}
                        onClick={() =>
                          toggleActivar(u.id, perfil?.activo || false)
                        }
                      >
                        {activando === u.id
                          ? "..."
                          : estado.activo
                            ? "Desactivar"
                            : "Activar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
