const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useStatsCards(productos) {
  const totalProductos = productos.length;
  const totalUnidades = productos.reduce(
    (total, producto) => total + toNumber(producto.stock_actual),
    0,
  );
  const valorVenta = productos.reduce(
    (total, producto) =>
      total + toNumber(producto.stock_actual) * toNumber(producto.precio_venta),
    0,
  );
  const bajoStock = productos.filter(
    (producto) =>
      toNumber(producto.stock_actual) < toNumber(producto.stock_minimo),
  ).length;

  return [
    {
      label: "Total productos",
      value: totalProductos,
      change: "Activo",
      tone: "success",
    },
    {
      label: "Unidades en stock",
      value: totalUnidades,
      change: "Disponible",
      tone: "success",
    },
    {
      label: "Valor total venta",
      value: moneyFormatter.format(valorVenta),
      change: "Inventario",
      tone: "accent",
    },
    {
      label: "Productos bajo stock",
      value: bajoStock,
      change: bajoStock > 0 ? "Revisar" : "Normal",
      tone: bajoStock > 0 ? "danger" : "success",
    },
  ];
}
