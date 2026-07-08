import { useDeferredValue, useMemo } from "react";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useProductFilters({
  activeView,
  categorias,
  filters,
  productos,
}) {
  const deferredSearch = useDeferredValue(filters.search);

  const searchableProducts = useMemo(() => {
    return productos.map((producto) => ({
      ...producto,
      searchText: [
        producto.codigo,
        producto.nombre,
        producto.descripcion,
        producto.isbn,
        producto.autor,
        producto.editorial,
        producto.categorias?.nombre,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }));
  }, [productos]);

  const filteredProducts = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);

    return searchableProducts.filter((producto) => {
      const price = toNumber(producto.precio_venta);
      const matchesSearch = !term || producto.searchText.includes(term);

      const matchesCategory =
        filters.categoryId === "todas" ||
        String(producto.categoria_id) === String(filters.categoryId);

      const lowStock =
        toNumber(producto.stock_actual) < toNumber(producto.stock_minimo);
      const matchesStock =
        filters.stockStatus === "todos" ||
        (filters.stockStatus === "bajo" && lowStock) ||
        (filters.stockStatus === "normal" && !lowStock);

      const matchesMinPrice =
        minPrice === null || !Number.isFinite(minPrice) || price >= minPrice;
      const matchesMaxPrice =
        maxPrice === null || !Number.isFinite(maxPrice) || price <= maxPrice;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [deferredSearch, filters, searchableProducts]);

  const lowStockProducts = useMemo(
    () =>
      filteredProducts.filter(
        (producto) =>
          toNumber(producto.stock_actual) < toNumber(producto.stock_minimo),
      ),
    [filteredProducts],
  );

  const visibleProducts =
    activeView === "bajo-stock" ? lowStockProducts : filteredProducts;

  const categorySummary = useMemo(() => {
    return categorias.map((categoria) => {
      const items = productos.filter(
        (producto) => String(producto.categoria_id) === String(categoria.id),
      );
      const lowStock = items.filter(
        (producto) =>
          toNumber(producto.stock_actual) < toNumber(producto.stock_minimo),
      ).length;

      return {
        ...categoria,
        count: items.length,
        lowStock,
      };
    });
  }, [categorias, productos]);

  return {
    categorySummary,
    filteredProducts,
    lowStockProducts,
    visibleProducts,
  };
}
