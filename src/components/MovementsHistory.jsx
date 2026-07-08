import { useMemo, useState } from "react";

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Sin fecha"
    : dateFormatter.format(date);
}

function isWithinRange(value, from, to) {
  if (!value) return true;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return true;

  if (from) {
    const fromTime = new Date(`${from}T00:00:00`).getTime();
    if (time < fromTime) return false;
  }

  if (to) {
    const toTime = new Date(`${to}T23:59:59`).getTime();
    if (time > toTime) return false;
  }

  return true;
}

export default function MovementsHistory({ movimientos }) {
  const [filters, setFilters] = useState({
    type: "todos",
    from: "",
    to: "",
  });

  const filteredMovements = useMemo(() => {
    return movimientos.filter((movimiento) => {
      const matchesType =
        filters.type === "todos" || movimiento.tipo === filters.type;
      const matchesDate = isWithinRange(
        movimiento.created_at,
        filters.from,
        filters.to,
      );

      return matchesType && matchesDate;
    });
  }, [filters, movimientos]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="panel movements-panel" id="movimientos">
      <div className="panel-title">
        <span>Historial de movimientos</span>
      </div>

      <div className="history-filters">
        <label>
          Tipo
          <select
            value={filters.type}
            onChange={(event) => updateFilter("type", event.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
          </select>
        </label>
        <label>
          Desde
          <input
            type="date"
            value={filters.from}
            onChange={(event) => updateFilter("from", event.target.value)}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            value={filters.to}
            onChange={(event) => updateFilter("to", event.target.value)}
          />
        </label>
      </div>

      {filteredMovements.length === 0 ? (
        <div className="compact-empty">
          No hay movimientos con esos filtros.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="movements-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Motivo</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((movimiento) => (
                <tr key={movimiento.id}>
                  <td>{formatDate(movimiento.created_at)}</td>
                  <td>
                    <strong>
                      {movimiento.productos?.nombre || "Producto no disponible"}
                    </strong>
                    <span>
                      {movimiento.productos?.codigo || movimiento.producto_id}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        movimiento.tipo === "entrada"
                          ? "stock-pill"
                          : "stock-pill stock-low"
                      }
                    >
                      {movimiento.tipo === "entrada" ? "Entrada" : "Salida"}
                    </span>
                  </td>
                  <td>{movimiento.cantidad}</td>
                  <td>{movimiento.motivo || "-"}</td>
                  <td>{movimiento.usuario_id || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
