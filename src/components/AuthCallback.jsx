import { useEffect } from "react";
import { supabase } from "../supabase";

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("=== Auth Callback Debug ===");
        console.log("URL actual:", window.location.href);
        console.log("Origin:", window.location.origin);

        // Obtener los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("access_token");
        const refreshToken = urlParams.get("refresh_token");
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");
        const code = urlParams.get("code");

        console.log("Parámetros recibidos:", {
          accessToken: accessToken ? "present" : "missing",
          refreshToken: refreshToken ? "present" : "missing",
          error: error || "none",
          errorDescription: errorDescription || "none",
          code: code ? "present" : "missing",
        });

        // Obtener el origin guardado (priorizar localStorage)
        const savedOrigin =
          localStorage.getItem("auth_origin") ||
          sessionStorage.getItem("auth_origin");
        console.log(
          "Origin guardado en localStorage:",
          localStorage.getItem("auth_origin"),
        );
        console.log(
          "Origin guardado en sessionStorage:",
          sessionStorage.getItem("auth_origin"),
        );
        console.log("Origin final a usar:", savedOrigin);

        if (error) {
          console.error("Error en OAuth:", error, errorDescription);
          // Redirigir al login con el error
          window.location.href = `/?error=${encodeURIComponent(errorDescription || error)}`;
          return;
        }

        if (accessToken && refreshToken) {
          console.log("Procesando tokens...");

          // Establecer la sesión usando los tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Error estableciendo sesión:", sessionError);
            window.location.href = "/?error=Error estableciendo sesión";
            return;
          }

          console.log("Sesión establecida exitosamente");

          // FORZAR redirección al origin guardado, ignorando cualquier otra cosa
          const targetUrl = savedOrigin || window.location.origin;
          console.log("🔥 FORZANDO redirección a:", targetUrl);
          console.log("🔥 Ignorando cualquier redirección de Supabase");

          // Limpiar el origin guardado
          localStorage.removeItem("auth_origin");
          sessionStorage.removeItem("auth_origin");

          // Redirigir FORZADAMENTE al origin correcto
          console.log("🚀 Redirigiendo a:", targetUrl);
          window.location.replace(targetUrl); // Usar replace para evitar historial
          return; // Detener ejecución
        } else if (code) {
          console.log("Procesando authorization code...");

          // Intentar intercambiar el code por tokens
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error(
              "Error intercambiando code por session:",
              exchangeError,
            );
            window.location.href = "/?error=Error intercambiando código";
            return;
          }

          console.log("Code intercambiado exitosamente");

          // FORZAR redirección al origin guardado
          const targetUrl = savedOrigin || window.location.origin;
          console.log("🔥 FORZANDO redirección a:", targetUrl);
          localStorage.removeItem("auth_origin");
          sessionStorage.removeItem("auth_origin");
          window.location.replace(targetUrl); // Usar replace para evitar historial
          return; // Detener ejecución
        } else {
          console.log(
            "No se encontraron tokens ni code, intentando getSession...",
          );

          // Si no hay tokens, intentar obtener la sesión actual
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error("Error en callback de auth:", error);
            window.location.href = "/?error=Error de autenticación";
            return;
          }

          console.log("Sesión obtenida:", data.session ? "present" : "null");

          // FORZAR redirección al origin guardado
          const targetUrl = savedOrigin || window.location.origin;
          console.log("🔥 FORZANDO redirección a:", targetUrl);
          localStorage.removeItem("auth_origin");
          sessionStorage.removeItem("auth_origin");
          window.location.replace(targetUrl); // Usar replace para evitar historial
          return; // Detener ejecución
        }
      } catch (err) {
        console.error("Error inesperado en auth callback:", err);
        window.location.href = "/?error=Error inesperado en autenticación";
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ color: "#888", marginBottom: "1rem" }}>
        Procesando autenticación...
      </div>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #333",
          borderTop: "3px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
