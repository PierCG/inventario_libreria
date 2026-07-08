import { useMemo } from "react";

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateKey(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toISOString().slice(0, 10);
}

function escapeCell(value) {
  const text = String(value ?? "");
  if (!/[",\n;]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  return rows.map((row) => row.map(escapeCell).join(";")).join("\n");
}

function toExcelHtml(title, rows) {
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td>${String(cell ?? "")
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  return `<html><head><meta charset="utf-8" /></head><body><h1>${title}</h1><table>${tableRows}</table></body></html>`;
}

export function useReports({ movementDate, movimientos, productos }) {
  const lowStockProducts = useMemo(
    () =>
      productos.filter(
        (producto) =>
          toNumber(producto.stock_actual) < toNumber(producto.stock_minimo),
      ),
    [productos],
  );

  const inventoryValue = useMemo(() => {
    return productos.reduce(
      (total, producto) =>
        total +
        toNumber(producto.stock_actual) * toNumber(producto.precio_venta),
      0,
    );
  }, [productos]);

  const movementSummary = useMemo(() => {
    const totalsByDate = new Map();

    movimientos.forEach((movimiento) => {
      const dateKey = toDateKey(movimiento.created_at);
      if (movementDate && dateKey !== movementDate) return;

      const current = totalsByDate.get(dateKey) ?? {
        date: dateKey,
        entradas: 0,
        salidas: 0,
      };
      if (movimiento.tipo === "entrada") {
        current.entradas += toNumber(movimiento.cantidad);
      } else if (movimiento.tipo === "salida") {
        current.salidas += toNumber(movimiento.cantidad);
      }
      totalsByDate.set(dateKey, current);
    });

    return Array.from(totalsByDate.values()).sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }, [movementDate, movimientos]);

  const lowStockRows = [
    ["Código", "Producto", "Stock actual", "Stock mínimo", "Precio venta"],
    ...lowStockProducts.map((producto) => [
      producto.codigo,
      producto.nombre,
      toNumber(producto.stock_actual),
      toNumber(producto.stock_minimo),
      toNumber(producto.precio_venta),
    ]),
  ];

  const inventoryRows = [
    [
      "Código",
      "Producto",
      "Stock actual",
      "Precio venta",
      "Valor del inventario",
    ],
    ...productos.map((producto) => {
      const stock = toNumber(producto.stock_actual);
      const price = toNumber(producto.precio_venta);
      return [producto.codigo, producto.nombre, stock, price, stock * price];
    }),
    ["TOTAL", "", "", "", inventoryValue],
  ];

  const movementRows = [
    ["Fecha", "Entradas", "Salidas", "Saldo"],
    ...movementSummary.map((row) => [
      row.date,
      row.entradas,
      row.salidas,
      row.entradas - row.salidas,
    ]),
  ];

  const handleExport = (title, rows, format) => {
    const slug = title.toLowerCase().replaceAll(" ", "-");
    if (format === "excel") {
      downloadFile(
        `${slug}.xls`,
        toExcelHtml(title, rows),
        "application/vnd.ms-excel;charset=utf-8",
      );
      return;
    }

    downloadFile(
      `${slug}.csv`,
      `\uFEFF${toCsv(rows)}`,
      "text/csv;charset=utf-8",
    );
  };

  return {
    formattedInventoryValue: moneyFormatter.format(inventoryValue),
    handleExport,
    inventoryRows,
    lowStockProducts,
    lowStockRows,
    movementRows,
    movementSummary,
  };
}
