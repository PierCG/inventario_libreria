const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ProductDetailsModal({ producto, onClose }) {
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Detalle de producto"
    >
      <div className="modal-card details-modal">
        <div className="modal-header">
          <h2>{producto.nombre}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            X
          </button>
        </div>

        {producto.imagen_url && (
          <img
            className="product-image"
            src={producto.imagen_url}
            alt={`Imagen de ${producto.nombre}`}
          />
        )}

        <dl className="details-grid">
          <div>
            <dt>Código</dt>
            <dd>{producto.codigo}</dd>
          </div>
          <div>
            <dt>Categoría</dt>
            <dd>{producto.categorias?.nombre || "Sin categoría"}</dd>
          </div>
          <div>
            <dt>Precio costo</dt>
            <dd>{moneyFormatter.format(toNumber(producto.precio_costo))}</dd>
          </div>
          <div>
            <dt>Precio venta</dt>
            <dd>{moneyFormatter.format(toNumber(producto.precio_venta))}</dd>
          </div>
          <div>
            <dt>Stock actual</dt>
            <dd>{toNumber(producto.stock_actual)}</dd>
          </div>
          <div>
            <dt>Stock mínimo</dt>
            <dd>{toNumber(producto.stock_minimo)}</dd>
          </div>
        </dl>

        <p className="detail-description">
          {producto.descripcion || "Sin descripción registrada."}
        </p>
      </div>
    </div>
  );
}
