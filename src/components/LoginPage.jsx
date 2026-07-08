import { useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAuthErrorMessage(error) {
  const message = error?.message ?? "";
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("already registered")) {
    return "Ya existe una cuenta con ese correo.";
  }

  if (normalizedMessage.includes("password")) {
    return "La contraseña no cumple los requisitos.";
  }

  return message || "No se pudo completar la operación.";
}

export default function LoginPage() {
  const rememberedEmail = useMemo(
    () => localStorage.getItem("inventario_user_email") ?? "",
    [],
  );
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(Boolean(rememberedEmail));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const cleanEmail = email.trim();
  const isRegisterMode = mode === "registro";
  const emailIsReady = cleanEmail === "" || isValidEmail(cleanEmail);
  const passwordIsReady = password === "" || password.length >= 6;
  const confirmationIsReady =
    !isRegisterMode || confirmPassword === "" || password === confirmPassword;

  const resetFormState = () => {
    setPassword("");
    setConfirmPassword("");
    setMessage(null);
    setShowPassword(false);
  };

  const switchMode = () => {
    setMode((current) => (current === "login" ? "registro" : "login"));
    resetFormState();
  };

  const validateCredentials = () => {
    if (!isValidEmail(cleanEmail)) {
      return "Ingresa un correo válido.";
    }

    if (!password) {
      return "Ingresa la contraseña.";
    }

    if (isRegisterMode && password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    if (isRegisterMode && password !== confirmPassword) {
      return "Las contraseñas no coinciden.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateCredentials();

    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isRegisterMode) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        localStorage.setItem("inventario_user_email", cleanEmail);

        if (data.session) {
          return;
        }

        setMessage({
          type: "success",
          text: "Cuenta creada. Revisa tu correo para confirmar el acceso.",
        });
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      if (remember) {
        localStorage.setItem("inventario_user_email", cleanEmail);
      } else {
        localStorage.removeItem("inventario_user_email");
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
      setMessage({
        type: "error",
        text: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!isValidEmail(cleanEmail)) {
      setMessage({
        type: "error",
        text: "Escribe tu correo para recuperar la contraseña.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setMessage({
        type: "success",
        text: "Te enviamos un correo de recuperación.",
      });
    } catch (error) {
      console.error("Error al recuperar contraseña:", error);
      setMessage({
        type: "error",
        text: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label="Autenticación">
        <div className="auth-brand">
          <span className="auth-logo" aria-hidden="true">
            📚
          </span>
          <small>Versión 1.0</small>
        </div>

        <div className="auth-heading">
          <h1>Sistema Integral de Gestión para Librerías</h1>
          <p>Inventario · Ventas · Reportes · Compras</p>
        </div>

        <form onSubmit={handleSubmit}>
          <h2>{isRegisterMode ? "Crear cuenta" : "Iniciar sesión"}</h2>

          {message && (
            <div className={`auth-message ${message.type}`} role="status">
              {message.text}
            </div>
          )}

          <label className={`auth-field ${emailIsReady ? "" : "invalid"}`}>
            <span>Correo</span>
            <input
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {!emailIsReady && <small>Formato de correo no válido.</small>}
          </label>

          <label className={`auth-field ${passwordIsReady ? "" : "invalid"}`}>
            <span>Contraseña</span>
            <div className="auth-password-control">
              <input
                autoComplete={
                  isRegisterMode ? "new-password" : "current-password"
                }
                placeholder="contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {!passwordIsReady && <small>Mínimo 6 caracteres.</small>}
          </label>

          {isRegisterMode && (
            <label
              className={`auth-field ${confirmationIsReady ? "" : "invalid"}`}
            >
              <span>Confirmar contraseña</span>
              <input
                autoComplete="new-password"
                placeholder="confirmar contraseña"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              {!confirmationIsReady && (
                <small>Las contraseñas no coinciden.</small>
              )}
            </label>
          )}

          {!isRegisterMode && (
            <div className="auth-row">
              <label className="auth-check">
                <input
                  checked={remember}
                  type="checkbox"
                  onChange={(event) => setRemember(event.target.checked)}
                />
                recordarme
              </label>
              <button
                className="auth-link"
                disabled={loading}
                type="button"
                onClick={handlePasswordReset}
              >
                recuperar contraseña
              </button>
            </div>
          )}

          <button className="auth-submit" disabled={loading} type="submit">
            {loading
              ? isRegisterMode
                ? "creando..."
                : "ingresando..."
              : isRegisterMode
                ? "crear cuenta"
                : "ingresar"}
          </button>

          <p className="auth-register">
            {isRegisterMode
              ? "¿Ya tienes una cuenta?"
              : "¿No tienes una cuenta?"}
            <button
              className="auth-inline-action"
              disabled={loading}
              type="button"
              onClick={switchMode}
            >
              {isRegisterMode ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
