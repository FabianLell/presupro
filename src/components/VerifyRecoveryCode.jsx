import { useState } from "react";
import { supabase } from "../supabase";

export default function VerifyRecoveryCode({ email, onBack, onSuccess }) {
  const [step, setStep] = useState("code"); // "code" o "password"
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleVerifyCode() {
    setError("");
    setOk("");

    if (!code.trim()) return setError("Ingresá el código que recibiste");

    setCargando(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "recovery",
    });

    setCargando(false);

    if (error) {
      return setError("Código inválido o expirado");
    }

    setOk("Código verificado correctamente");
    setTimeout(() => setStep("password"), 1000);
  }

  async function handleSetPassword() {
    setError("");
    setOk("");

    if (!password || !confirmar) return setError("Completá todos los campos");
    if (password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres");
    if (password !== confirmar) return setError("Las contraseñas no coinciden");

    setCargando(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setCargando(false);

    if (error) {
      return setError("Error al actualizar la contraseña");
    }

    setOk("Contraseña actualizada correctamente");
    setTimeout(() => onSuccess(), 1500);
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
          {step === "code" && (
            <>
              <h2 style={{ margin: "0 0 0.5rem 0", color: "#f0f0f0" }}>
                Verificar código
              </h2>
              <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>
                Usá el código que recibiste en tu email
              </p>
            </>
          )}
          {step === "password" && (
            <>
              <h2 style={{ margin: "0 0 0.5rem 0", color: "#f0f0f0" }}>
                Nueva contraseña
              </h2>
              <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>
                Ingresá tu nueva contraseña
              </p>
            </>
          )}
        </div>

        {error && <p className="msg-error">{error}</p>}
        {ok && <p className="msg-ok">{ok}</p>}

        {step === "code" && (
          <>
            <input
              type="text"
              placeholder="Código de recuperación"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
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
                letterSpacing: "2px",
                textAlign: "center",
              }}
            />

            <button
              className="btn btn-primary"
              onClick={handleVerifyCode}
              disabled={cargando}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                marginTop: "0.5rem",
              }}
            >
              {cargando ? "Verificando..." : "Verificar código"}
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
          </>
        )}

        {step === "password" && (
          <>
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
              onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
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
              onClick={handleSetPassword}
              disabled={cargando}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                marginTop: "0.5rem",
              }}
            >
              {cargando ? "Guardando..." : "Cambiar contraseña"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setStep("code");
                setPassword("");
                setConfirmar("");
                setError("");
                setOk("");
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                marginTop: "0.6rem",
              }}
            >
              Volver
            </button>
          </>
        )}
      </div>
    </div>
  );
}
