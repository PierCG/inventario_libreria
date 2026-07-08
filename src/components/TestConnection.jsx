import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function TestConnection() {
  const [status, setStatus] = useState("Probando...");
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    async function testConnection() {
      try {
        const { error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .limit(100);
        if (error) throw error;

        setProductos(data ?? []);
        setStatus(`Conectado. Productos encontrados: ${data?.length ?? 0}`);
      } catch (error) {
        console.error("Error de conexión:", error);
        setStatus(`Error: ${error.message}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#252d3d",
        borderRadius: "8px",
        margin: "20px",
      }}
    >
      <h3>Estado de conexión</h3>
      <p>{status}</p>

      {productos.length > 0 && (
        <table style={{ width: "100%", color: "#fff", marginTop: "10px" }}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Stock</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.codigo}</td>
                <td>{producto.nombre}</td>
                <td>{producto.stock_actual}</td>
                <td>S/ {producto.precio_venta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
