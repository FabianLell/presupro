import { useState } from "react";
import { supabase } from "../supabase";

export default function ForgotPassword({ onBack, onEmailSent }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSendReset() {
    setError("");
    setOk("");
    if (!email.trim()) return setError("Ingresá tu email");

    setCargando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}`,
    });
    if (error) {
      setError("No se pudo enviar el email de recuperación");
    } else {
      setOk("Te enviamos un código al email. Ingresalo para cambiar tu contraseña");
      setTimeout(() => onEmailSent(email.trim()), 2000);
    }
    setCargando(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "12px",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "380px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img
            src="/logo-app.png"
            alt="PresuPro"
            style={{
              height: "122px",
              objectFit: "contain",
              marginBottom: "0.75rem",
            }}
          />
          <h2 style={{ margin: "0 0 0.5rem 0", color: "#f0f0f0" }}>
            Recuperar contraseña
          </h2>
          <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>
            Ingresá tu email para recibir instrucciones
          </p>
        </div>

        {error && <p className="msg-error">{error}</p>}
        {ok && <p className="msg-ok">{ok}</p>}

        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendReset()}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#222",
            color: "#f0f0f0",
            fontSize: "0.95rem",
            marginBottom: "1rem",
            boxSizing: "border-box",
          }}
        />

        <button
          className="btn btn-primary"
          onClick={handleSendReset}
          disabled={cargando}
          style={{
            width: "100%",
            padding: "0.75rem",
            fontSize: "1rem",
            marginTop: "0.5rem",
          }}
        >
          {cargando ? "Enviando..." : "Enviar instrucciones"}
        </button>

        <button
          className="btn btn-secondary"
          onClick={onBack}
          style={{
            width: "100%",
            padding: "0.75rem",
            fontSize: "1rem",
            marginTop: "0.6rem",
          }}
        >
          Volver al login
        </button>
      </div>
    </div>
  );
}
