import { useState } from "react";
import { supabase } from "../supabase";

export default function VerifyRecoveryCode({ email, onBack, onSuccess }) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleVerifyAndReset() {
    setError("");
    setOk("");

    if (!code.trim()) return setError("Ingresá el código que recibiste");
    if (!password || !confirmar) return setError("Completá todos los campos");
    if (password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres");
    if (password !== confirmar) return setError("Las contraseñas no coinciden");

    setCargando(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "recovery",
    });

    if (error) {
      setCargando(false);
      return setError("Código inválido o expirado");
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setCargando(false);
      return setError("Error al actualizar la contraseña");
    }

    setOk("Contraseña actualizada correctamente");
    setTimeout(() => onSuccess(), 2000);
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
            Cambiar contraseña
          </h2>
          <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>
            Usá el código que recibiste en tu email
          </p>
        </div>

        {error && <p className="msg-error">{error}</p>}
        {ok && <p className="msg-ok">{ok}</p>}

        <input
          type="text"
          placeholder="Código de recuperación"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#222",
            color: "#f0f0f0",
            fontSize: "0.95rem",
            marginBottom: "0.75rem",
            boxSizing: "border-box",
            letterSpacing: "2px",
            textAlign: "center",
          }}
        />

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#222",
            color: "#f0f0f0",
            fontSize: "0.95rem",
            marginBottom: "0.75rem",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Repetir contraseña"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleVerifyAndReset()}
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
          onClick={handleVerifyAndReset}
          disabled={cargando}
          style={{
            width: "100%",
            padding: "0.75rem",
            fontSize: "1rem",
            marginTop: "0.5rem",
          }}
        >
          {cargando ? "Verificando..." : "Cambiar contraseña"}
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
          Volver
        </button>
      </div>
    </div>
  );
}
