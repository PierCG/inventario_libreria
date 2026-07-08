import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useRealtimeInventory({
  invalidateCategorias,
  invalidateMovimientos,
  invalidateProductos,
}) {
  useEffect(() => {
    const channel = supabase
      .channel("inventario-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "productos" },
        () => {
          invalidateProductos();
          invalidateMovimientos();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categorias" },
        () => {
          invalidateCategorias();
          invalidateProductos();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "movimientos_inventario" },
        () => {
          invalidateMovimientos();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invalidateCategorias, invalidateMovimientos, invalidateProductos]);
}
