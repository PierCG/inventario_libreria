import { useState } from "react";
import { useReports } from "../hooks/useReports";

export default function ReportsPanel({ productos, movimientos }) {
  const [movementDate, setMovementDate] = useState("");
  const {
    formattedInventoryValue,
    handleExport,
    inventoryRows,
    lowStockProducts,
    lowStockRows,
    movementRows,
    movementSummary,
  } = useReports({ movementDate, movimientos, productos });

  return (
    <section className="panel reports-panel" id="reportes">
      <div className="panel-title">
        <span>Reportes</span>
      </div>

      <div className="reports-grid">
        <article className="report-block">
          <div>
            <span className="stat-label">Productos con bajo stock</span>
            <strong className="stat-value">{lowStockProducts.length}</strong>
          </div>
          <div className="report-actions">
            <button
              type="button"
              onClick={() => handleExport("bajo stock", lowStockRows, "csv")}
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport("bajo stock", lowStockRows, "excel")}
            >
              Excel
            </button>
          </div>
        </article>

        <article className="report-block">
          <div>
            <span className="stat-label">Valor total inventario</span>
            <strong className="stat-value">{formattedInventoryValue}</strong>
          </div>
          <div className="report-actions">
            <button
              type="button"
              onClick={() =>
                handleExport("valor inventario", inventoryRows, "csv")
              }
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() =>
                handleExport("valor inventario", inventoryRows, "excel")
              }
            >
              Excel
            </button>
          </div>
        </article>

        <article className="report-block report-wide">
          <div className="report-date-row">
            <div>
              <span className="stat-label">Movimientos por fecha</span>
              <strong className="stat-value">{movementSummary.length}</strong>
            </div>
            <label>
              Fecha
              <input
                type="date"
                value={movementDate}
                onChange={(event) => setMovementDate(event.target.value)}
              />
            </label>
          </div>
          <div className="report-actions">
            <button type="button" onClick={() => setMovementDate("")}>
              Todas
            </button>
            <button
              type="button"
              onClick={() =>
                handleExport("movimientos por fecha", movementRows, "csv")
              }
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() =>
                handleExport("movimientos por fecha", movementRows, "excel")
              }
            >
              Excel
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
