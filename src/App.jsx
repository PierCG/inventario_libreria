import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import { PermissionProvider } from "./contexts/PermissionContext";

function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error al leer sesión:", error);
      }

      setSession(data?.session ?? null);
      if (data?.session?.user?.email) {
        localStorage.setItem("inventario_user_email", data.session.user.email);
      }
      setLoadingSession(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoadingSession(false);
      if (nextSession?.user?.email) {
        localStorage.setItem("inventario_user_email", nextSession.user.email);
      } else {
        localStorage.removeItem("inventario_user_email");
      }
    });

    loadSession();

    return () => subscription.unsubscribe();
  }, []);

  if (loadingSession) {
    return (
      <main className="auth-page auth-loading">
        <div className="mini-spinner" />
      </main>
    );
  }

  if (!session?.user) {
    return <LoginPage />;
  }

  return (
    <PermissionProvider session={session}>
      <Dashboard session={session} />
    </PermissionProvider>
  );
}

export default App;
