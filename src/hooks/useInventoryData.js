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
  return data ?? [];
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
