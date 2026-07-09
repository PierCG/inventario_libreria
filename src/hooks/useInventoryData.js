import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";

export const inventoryKeys = {
  all: ["inventory"],
  productos: ["inventory", "productos"],
  categorias: ["inventory", "categorias"],
  movimientos: ["inventory", "movimientos"],
};

async function fetchProductos() {
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias(id, nombre)")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function fetchCategorias() {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function fetchMovimientos() {
  const { data, error } = await supabase
    .from("movimientos_inventario")
    .select("*, productos(id, codigo, nombre)")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) throw error;

  const movimientos = data ?? [];
  const userIds = [
    ...new Set(
      movimientos.map((movimiento) => movimiento.usuario_id).filter(Boolean),
    ),
  ];

  if (userIds.length === 0) {
    return movimientos;
  }

  const { data: usuarios, error: usuariosError } = await supabase
    .from("usuarios")
    .select("id, nombre, email")
    .in("id", userIds);

  if (usuariosError) {
    console.warn(
      "No se pudieron cargar nombres de usuario:",
      usuariosError.message,
    );
    return movimientos;
  }

  const usuariosPorId = new Map(
    (usuarios ?? []).map((usuario) => [usuario.id, usuario]),
  );

  return movimientos.map((movimiento) => {
    const usuario = usuariosPorId.get(movimiento.usuario_id);
    return {
      ...movimiento,
      usuario_nombre:
        usuario?.nombre ||
        usuario?.email?.split("@")[0] ||
        "Usuario del sistema",
    };
  });
}

export function useInventoryData() {
  const productosQuery = useQuery({
    queryKey: inventoryKeys.productos,
    queryFn: fetchProductos,
  });

  const categoriasQuery = useQuery({
    queryKey: inventoryKeys.categorias,
    queryFn: fetchCategorias,
  });

  const movimientosQuery = useQuery({
    queryKey: inventoryKeys.movimientos,
    queryFn: fetchMovimientos,
  });

  return {
    productos: productosQuery.data ?? [],
    categorias: categoriasQuery.data ?? [],
    movimientos: movimientosQuery.data ?? [],
    isLoading:
      productosQuery.isLoading ||
      categoriasQuery.isLoading ||
      movimientosQuery.isLoading,
    isFetching:
      productosQuery.isFetching ||
      categoriasQuery.isFetching ||
      movimientosQuery.isFetching,
    error:
      productosQuery.error || categoriasQuery.error || movimientosQuery.error,
  };
}

export function useInvalidateInventory() {
  const queryClient = useQueryClient();
  const invalidateAll = useCallback(
    () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
    [queryClient],
  );
  const invalidateProductos = useCallback(
    () => queryClient.invalidateQueries({ queryKey: inventoryKeys.productos }),
    [queryClient],
  );
  const invalidateCategorias = useCallback(
    () => queryClient.invalidateQueries({ queryKey: inventoryKeys.categorias }),
    [queryClient],
  );
  const invalidateMovimientos = useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movimientos }),
    [queryClient],
  );

  return {
    invalidateAll,
    invalidateProductos,
    invalidateCategorias,
    invalidateMovimientos,
  };
}
