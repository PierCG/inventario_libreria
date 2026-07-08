import { useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function InventoryMovementModal({
  producto,
  type,
  session,
  onClose,
  onSaved,
  onMessage,
}) {
  const currentStock = toNumber(producto.stock_actual);
  const [cantidad, setCantidad] = useState(() =>
    type === "salida" && currentStock <= 0 ? "0" : "1",
  );
  const [motivo, setMotivo] = useState(type === "entrada" ? "Compra" : "Venta");
  const [saving, setSaving] = useState(false);

  const movementLabel =
    type === "entrada" ? "Entrada de stock" : "Salida de stock";
  const amount = Number(cantidad);
  const isValidAmount = Number.isInteger(amount) && amount > 0;
  const stockExhausted = type === "salida" && currentStock <= 0;
  const stockInsufficient = type === "salida" && amount > currentStock;
  const submitDisabled =
    saving ||
    stockExhausted ||
    stockInsufficient ||
    !isValidAmount ||
    !motivo.trim();
  const nextStock = useMemo(() => {
    const amount = toNumber(cantidad);
    return type === "entrada" ? currentStock + amount : currentStock - amount;
  }, [cantidad, currentStock, type]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanReason = motivo.trim();

    if (!session?.user) {
      onMessage("error", "Inicia sesión para registrar movimientos.");
      return;
    }

    if (!isValidAmount) {
      onMessage("error", "La cantidad debe ser un entero mayor a 0.");
      return;
    }

    if (stockExhausted) {
      onMessage(
        "error",
        "No se puede vender este producto porque no tiene stock disponible.",
      );
      return;
    }

    if (stockInsufficient) {
      onMessage("error", "No hay stock suficiente para esta salida.");
      return;
    }

    if (!cleanReason) {
      onMessage("error", "Escribe el motivo del movimiento.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.rpc("registrar_movimiento", {
        p_cantidad: amount,
        p_motivo: cleanReason,
        p_producto_id: producto.id,
        p_tipo: type,
      });

      if (error) throw error;

      onMessage("success", `${movementLabel} registrada correctamente.`);
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      onMessage(
        "error",
        error.message || "No se pudo registrar el movimiento.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={movementLabel}
    >
      <form className="modal-card movement-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>{movementLabel}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            X
          </button>
        </div>

        <div className="movement-summary">
          <strong>{producto.nombre}</strong>
          <span>{producto.codigo}</span>
          <dl>
            <div>
              <dt>Stock actual</dt>
              <dd>{currentStock}</dd>
            </div>
            <div>
              <dt>Stock final</dt>
              <dd className={nextStock < 0 ? "danger-text" : ""}>
                {nextStock}
              </dd>
            </div>
          </dl>
        </div>

        <div className="form-grid movement-form">
          <label>
            Cantidad
            <input
              disabled={stockExhausted}
              max={type === "salida" ? currentStock : undefined}
              min={type === "salida" && stockExhausted ? "0" : "1"}
              required
              step="1"
              type="number"
              value={cantidad}
              onChange={(event) => setCantidad(event.target.value)}
            />
            {stockExhausted && (
              <small className="danger-text">
                Este producto no tiene stock disponible para vender.
              </small>
            )}
            {!stockExhausted && stockInsufficient && (
              <small className="danger-text">
                La cantidad supera el stock disponible.
              </small>
            )}
          </label>
          <label>
            Motivo
            <input
              required
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="primary-button"
            disabled={submitDisabled}
            type="submit"
          >
            {saving ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
