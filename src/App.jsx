import { useState, useEffect, useRef } from "react";
import { supabase, calcularEstadoCuenta } from "./supabase";
import "./App.css";
import Login from "./components/Login";
import Registro from "./components/Registro";
import ResetPassword from "./components/ResetPassword";
import Materiales from "./components/Materiales";
import Servicios from "./components/Servicios";
import Clientes from "./components/Clientes";
import Presupuestos from "./components/Presupuestos";
import Admin from "./components/Admin";
import Perfil from "./components/Perfil";
import Onboarding from "./components/Onboarding";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL || "")
  .split(",")
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean);

const SECCIONES = [
  { id: "presupuestos", label: "Presupuestos", icono: "📋" },
  { id: "clientes", label: "Clientes", icono: "👤" },
  { id: "materiales", label: "Materiales", icono: "🔩" },
  { id: "servicios", label: "Servicios", icono: "🔧" },
  { id: "perfil", label: "Editar perfil", icono: "⚙️" },
];

const TITULO_SECCION = {
  presupuestos: "Presupuestos",
  clientes: "Clientes",
  materiales: "Materiales",
  servicios: "Servicios",
  perfil: "Editar perfil",
  admin: "Panel Admin",
};

export default function App() {
  const [seccion, setSeccion] = useState("presupuestos");
  const [session, setSession] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [resetMode, setResetMode] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [onboarding, setOnboarding] = useState(false);
  const [estadoCuenta, setEstadoCuenta] = useState({
    soloLectura: false,
    mensaje: "",
  });
  const [cantPresupuestos, setCantPresupuestos] = useState(0);

  const [abierto, setAbierto] = useState(false);
  const [pinned, setPinned] = useState(
    () => localStorage.getItem("sidebarPinned") === "true",
  );

  const sidebarRef = useRef(null);

  // Cerrar sidebar al hacer click fuera (solo en modo temporal)
  useEffect(() => {
    if (pinned || !abierto) return;
    function handleClick(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [abierto, pinned]);

  function togglePin() {
    const nuevo = !pinned;
    setPinned(nuevo);
    localStorage.setItem("sidebarPinned", String(nuevo));
    if (!nuevo) setAbierto(false);
  }

  function navegarA(id) {
    setSeccion(id);
    if (!pinned) setTimeout(() => setAbierto(false), 150);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCargando(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "PASSWORD_RECOVERY") setResetMode(true);
      if (event === "SIGNED_IN") setMostrarRegistro(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) cargarPerfil();
    else setPerfil(null);
  }, [session]);

  async function cargarPerfil() {
    const { data } = await supabase
      .from("perfil")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    let perfilData = data;

    if (!data) {
      const nombreNegocio =
        session.user.user_metadata?.nombre_negocio ||
        session.user.user_metadata?.full_name ||
        session.user.email?.split("@")[0] ||
        "Mi negocio";

      const { data: nuevoPerfil } = await supabase
        .from("perfil")
        .insert([
          {
            user_id: session.user.id,
            nombre_negocio: nombreNegocio,
            email_contacto: session.user.email || null,
            estado: "prueba",
            rubros_seleccionados: null,
            fecha_inicio_prueba: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      perfilData = nuevoPerfil;
    }

    setPerfil(perfilData || null);

    if (!perfilData || perfilData.rubros_seleccionados === null) {
      setOnboarding(true);
      return;
    }

    setOnboarding(false);

    const { count } = await supabase
      .from("presupuestos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    const cant = count || 0;
    setCantPresupuestos(cant);
    setEstadoCuenta(calcularEstadoCuenta(perfilData, cant));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (cargando)
    return (
      <div
        style={{
          height: "100vh",
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#888" }}>Cargando...</p>
      </div>
    );

  if (resetMode) return <ResetPassword onDone={() => setResetMode(false)} />;
  if (session && onboarding)
    return (
      <Onboarding
        onComplete={() => {
          setOnboarding(false);
          cargarPerfil();
        }}
      />
    );
  if (!session) {
    if (mostrarRegistro)
      return <Registro onBackToLogin={() => setMostrarRegistro(false)} />;
    return <Login onShowRegistro={() => setMostrarRegistro(true)} />;
  }

  const sessionEmail = (session?.user?.email || "").trim().toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(sessionEmail);
  const nombreNegocio =
    perfil?.nombre_negocio ||
    session?.user?.user_metadata?.nombre_negocio ||
    "Mi negocio";

  function LogoNegocio({ size = 40 }) {
    if (perfil?.logo_url)
      return (
        <img
          src={perfil.logo_url}
          alt="Logo"
          style={{
            width: size,
            height: size,
            objectFit: "contain",
            borderRadius: "6px",
            background: "#222",
            padding: "2px",
          }}
        />
      );
    const palabras = nombreNegocio.trim().split(" ");
    const iniciales =
      palabras.length >= 2
        ? palabras[0][0] + palabras[1][0]
        : palabras[0].slice(0, 2);
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.38 + "px",
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {iniciales.toUpperCase()}
      </div>
    );
  }

  const colapsado = !abierto && !pinned;

  return (
    <div className="app">
      {/* ── SIDEBAR ── */}
      <nav
        ref={sidebarRef}
        className={`sidebar ${colapsado ? "colapsado" : ""}`}
      >
        {/* Toggle + Pin */}
        <div className="sidebar-toggle">
          {!colapsado && (
            <button
              onClick={togglePin}
              title={pinned ? "Desfijar sidebar" : "Fijar sidebar"}
              style={{ color: pinned ? "#2563eb" : "#888" }}
            >
              📌
            </button>
          )}
          <button
            onClick={() => setAbierto(!abierto)}
            title={colapsado ? "Abrir menú" : "Cerrar menú"}
          >
            {colapsado ? "☰" : "✕"}
          </button>
        </div>

        {/* Perfil del negocio */}
        <div className="sidebar-perfil">
          <LogoNegocio size={colapsado ? 32 : 44} />
          {!colapsado && (
            <span className="sidebar-perfil-nombre">{nombreNegocio}</span>
          )}
        </div>

        {/* Navegación */}
        <div className="sidebar-nav">
          <button
            className={`sidebar-btn ${seccion === "perfil" ? "active" : ""}`}
            onClick={() => navegarA("perfil")}
            data-tooltip="Editar perfil"
          >
            <span className="btn-icon">⚙️</span>
            <span className="btn-label">Editar perfil</span>
          </button>

          <div className="sidebar-separator" />

          {SECCIONES.map((s) => (
            <button
              key={s.id}
              className={`sidebar-btn ${seccion === s.id ? "active" : ""}`}
              onClick={() => navegarA(s.id)}
              data-tooltip={s.label}
            >
              <span className="btn-icon">{s.icono}</span>
              <span className="btn-label">{s.label}</span>
            </button>
          ))}

          {isAdmin && (
            <button
              className={`sidebar-btn ${seccion === "admin" ? "active" : ""}`}
              onClick={() => navegarA("admin")}
              data-tooltip="Admin"
            >
              <span className="btn-icon">🛡️</span>
              <span className="btn-label">Admin</span>
            </button>
          )}

          {!estadoCuenta.soloLectura &&
            estadoCuenta.diasRestantes !== undefined && (
              <div
                className="prueba-aviso"
                style={{
                  background:
                    estadoCuenta.diasRestantes <= 5 ||
                    estadoCuenta.presupuestosRestantes <= 5
                      ? "#450a0a"
                      : "#1a1a1a",
                  border: `1px solid ${estadoCuenta.diasRestantes <= 5 || estadoCuenta.presupuestosRestantes <= 5 ? "#dc2626" : "#2a2a2a"}`,
                  color:
                    estadoCuenta.diasRestantes <= 5 ||
                    estadoCuenta.presupuestosRestantes <= 5
                      ? "#f87171"
                      : "#888",
                  marginTop: "0.5rem",
                }}
              >
                <div>⏱ {estadoCuenta.diasRestantes} días restantes</div>
                <div>
                  📋 {estadoCuenta.presupuestosRestantes} presupuestos restantes
                </div>
              </div>
            )}

          {estadoCuenta.soloLectura && (
            <div
              className="prueba-aviso"
              style={{
                background: "#450a0a",
                border: "1px solid #dc2626",
                color: "#f87171",
                marginTop: "0.5rem",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                ⛔ Acceso limitado
              </div>
              <div style={{ color: "#fca5a5", fontSize: "0.72rem" }}>
                {estadoCuenta.mensaje}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-btn danger"
            onClick={handleLogout}
            data-tooltip="Cerrar sesión"
          >
            <span className="btn-icon">🚪</span>
            <span className="btn-label">Cerrar sesión</span>
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="main-header">
          <div className="header-left">
            <img
              src="/logo-app.png"
              alt="PresuPro"
              style={{ height: "36px", objectFit: "contain" }}
            />
          </div>
          <div className="header-titulo">
            {SECCIONES.find((s) => s.id === seccion)?.icono && (
              <span>{SECCIONES.find((s) => s.id === seccion)?.icono}</span>
            )}
            {TITULO_SECCION[seccion] || ""}
          </div>
          <div className="header-right">
            <LogoNegocio size={36} />
            <span
              className="header-negocio-nombre"
              style={{ fontSize: "1rem", fontWeight: 600, color: "#f0f0f0" }}
            >
              {nombreNegocio}
            </span>
          </div>
        </header>

        {/* Contenido */}
        <div
          className={`main-content ${seccion === "perfil" || seccion === "presupuestos" ? "con-scroll" : ""}`}
        >
          {seccion === "presupuestos" && (
            <Presupuestos
              perfil={perfil}
              soloLectura={estadoCuenta.soloLectura}
            />
          )}
          {seccion === "materiales" && (
            <Materiales soloLectura={estadoCuenta.soloLectura} />
          )}
          {seccion === "servicios" && (
            <Servicios soloLectura={estadoCuenta.soloLectura} />
          )}
          {seccion === "clientes" && (
            <Clientes soloLectura={estadoCuenta.soloLectura} />
          )}
          {seccion === "perfil" && (
            <Perfil onPerfilActualizado={cargarPerfil} />
          )}
          {isAdmin && seccion === "admin" && <Admin />}
        </div>
      </div>
    </div>
  );
}
