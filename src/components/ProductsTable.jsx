import { useMemo, useState } from "react";

const PAGE_SIZE = 50;
const ROW_HEIGHT = 74;
const VIRTUAL_HEIGHT = 520;

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ProductsTable({
  productos,
  loading,
  isFetching,
  viewMode,
  onEdit,
  onDelete,
  onView,
  onMovement,
  canWrite,
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(productos.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const [scrollTop, setScrollTop] = useState(0);

  const pageProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return productos.slice(start, start + PAGE_SIZE);
  }, [currentPage, productos]);

  const virtualEnabled = pageProducts.length > 30;
  const visibleWindow = useMemo(() => {
    if (!virtualEnabled) {
      return {
        products: pageProducts,
        topSpacer: 0,
        bottomSpacer: 0,
      };
    }

    const overscan = 4;
    const visibleCount = Math.ceil(VIRTUAL_HEIGHT / ROW_HEIGHT) + overscan;
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / ROW_HEIGHT) - overscan,
    );
    const endIndex = Math.min(pageProducts.length, startIndex + visibleCount);

    return {
      products: pageProducts.slice(startIndex, endIndex),
      topSpacer: startIndex * ROW_HEIGHT,
      bottomSpacer: Math.max(0, (pageProducts.length - endIndex) * ROW_HEIGHT),
    };
  }, [pageProducts, scrollTop, virtualEnabled]);

  if (loading) {
    return (
      <div className="empty-state loading-state">Cargando productos...</div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="empty-state">No hay productos con esos filtros.</div>
    );
  }

  return (
    <section className="panel table-panel">
      <div className="table-status">
        <span>
          {productos.length} producto{productos.length === 1 ? "" : "s"}
          {viewMode === "bajo-stock" ? " en alerta" : ""}
        </span>
        {isFetching && (
          <span className="fetch-chip">
            <span className="mini-spinner" />
            Caché actualizándose
          </span>
        )}
      </div>

      <div
        className={
          virtualEnabled ? "table-wrap virtual-table-wrap" : "table-wrap"
        }
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Stock</th>
              <th>Precio venta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {virtualEnabled && visibleWindow.topSpacer > 0 && (
              <tr aria-hidden="true">
                <td
                  className="virtual-spacer"
                  colSpan="5"
                  style={{ height: visibleWindow.topSpacer }}
                />
              </tr>
            )}
            {visibleWindow.products.map((producto) => {
              const lowStock =
                toNumber(producto.stock_actual) <
                toNumber(producto.stock_minimo);

              return (
                <tr
                  className={lowStock ? "low-stock-row" : ""}
                  key={producto.id}
                >
                  <td className="code-cell">{producto.codigo}</td>
                  <td>
                    <strong>{producto.nombre}</strong>
                    <span>
                      {producto.categorias?.nombre || "Sin categoría"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        lowStock ? "stock-pill stock-low" : "stock-pill"
                      }
                    >
                      {toNumber(producto.stock_actual)} / mín.{" "}
                      {toNumber(producto.stock_minimo)}
                    </span>
                  </td>
                  <td>
                    {moneyFormatter.format(toNumber(producto.precio_venta))}
                  </td>
                  <td className="action-cell">
                    <button
                      disabled={!canWrite}
                      type="button"
                      onClick={() => onMovement(producto, "entrada")}
                    >
                      Entrada
                    </button>
                    <button
                      disabled={!canWrite}
                      type="button"
                      onClick={() => onMovement(producto, "salida")}
                    >
                      Salida
                    </button>
                    <button
                      disabled={!canWrite}
                      type="button"
                      onClick={() => onEdit(producto)}
                    >
                      Editar
                    </button>
                    <button
                      className="danger-button"
                      disabled={!canWrite}
                      type="button"
                      onClick={() => onDelete(producto)}
                    >
                      Eliminar
                    </button>
                    <button type="button" onClick={() => onView(producto)}>
                      Ver más
                    </button>
                  </td>
                </tr>
              );
            })}
            {virtualEnabled && visibleWindow.bottomSpacer > 0 && (
              <tr aria-hidden="true">
                <td
                  className="virtual-spacer"
                  colSpan="5"
                  style={{ height: visibleWindow.bottomSpacer }}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          type="button"
          onClick={() => setPage(currentPage - 1)}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          type="button"
          onClick={() => setPage(currentPage + 1)}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
