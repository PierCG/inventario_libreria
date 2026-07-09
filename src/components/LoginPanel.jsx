import { useState } from "react";
import { supabase } from "../supabaseClient";
import { getUserDisplayName, getUserInitials } from "../utils/userDisplay";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPanel({ session, onMessage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    const cleanEmail = email.trim();

    if (!isValidEmail(cleanEmail)) {
      onMessage("error", "Ingresa un correo válido.");
      return;
    }

    if (!password) {
      onMessage("error", "Ingresa la contraseña.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      setPassword("");
      onMessage("success", "Sesión iniciada correctamente.");
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      onMessage("error", error.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onMessage("success", "Sesión cerrada.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      onMessage("error", error.message || "No se pudo cerrar sesión.");
    } finally {
      setLoading(false);
    }
  };

  if (session?.user) {
    const displayName = getUserDisplayName(session.user);

    return (
      <div className="login-panel signed-in">
        <span className="user-avatar" aria-hidden="true">
          {getUserInitials(session.user)}
        </span>
        <span className="user-summary">
          <strong>{displayName}</strong>
          <small>{session.user.email}</small>
        </span>
        <button
          className="secondary-button"
          disabled={loading}
          type="button"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <form className="login-panel" onSubmit={handleLogin}>
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        placeholder="Contraseña"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button className="primary-button" disabled={loading} type="submit">
        {loading ? "Ingresando..." : "Entrar"}
      </button>
    </form>
  );
}
