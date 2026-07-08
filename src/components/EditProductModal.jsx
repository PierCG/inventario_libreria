import { useState } from "react";
import { supabase } from "../supabaseClient";

function productToForm(producto) {
  return {
    codigo: producto.codigo ?? "",
    nombre: producto.nombre ?? "",
    categoria_id: producto.categoria_id ?? "",
    precio_costo: producto.precio_costo ?? "",
    precio_venta: producto.precio_venta ?? "",
    stock_actual: producto.stock_actual ?? "0",
    stock_minimo: producto.stock_minimo ?? "10",
    imagen_url: producto.imagen_url ?? "",
    descripcion: producto.descripcion ?? "",
  };
}

function toPayload(form) {
  return {
    codigo: form.codigo.trim(),
    nombre: form.nombre.trim(),
    categoria_id: form.categoria_id || null,
    precio_costo: Number(form.precio_costo || 0),
    precio_venta: Number(form.precio_venta),
    stock_actual: Number(form.stock_actual || 0),
    stock_minimo: Number(form.stock_minimo || 0),
    imagen_url: form.imagen_url.trim() || null,
    descripcion: form.descripcion.trim() || null,
  };
}

function validate(payload) {
  if (!payload.codigo) return "El código es obligatorio.";
  if (!payload.nombre) return "El nombre es obligatorio.";
  if (!Number.isFinite(payload.precio_costo) || payload.precio_costo < 0) {
    return "El precio de costo debe ser un número válido y no negativo.";
  }
  if (!Number.isFinite(payload.precio_venta) || payload.precio_venta <= 0) {
    return "El precio de venta debe ser mayor a 0.";
  }
  if (
    !Number.isInteger(payload.stock_actual) ||
    !Number.isInteger(payload.stock_minimo) ||
    payload.stock_actual < 0 ||
    payload.stock_minimo < 0
  ) {
    return "El stock debe ser un número entero no negativo.";
  }
  return "";
}

export default function EditProductModal({
  producto,
  categorias,
  onClose,
  onSaved,
  onMessage,
}) {
  const [form, setForm] = useState(() => productToForm(producto));
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = toPayload(form);
    const validationError = validate(payload);

    if (validationError) {
      onMessage("error", validationError);
      return;
    }

    setSaving(true);

    try {
      // Si cambia el código, se verifica que no lo use otro producto.
      const { data: existing, error: checkError } = await supabase
        .from("productos")
        .select("id")
        .eq("codigo", payload.codigo)
        .neq("id", producto.id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) {
        onMessage("error", "Ya existe otro producto con ese código.");
        return;
      }

      const { error } = await supabase
        .from("productos")
        .update(payload)
        .eq("id", producto.id)
        .select()
        .single();
      if (error) throw error;

      onMessage("success", "Producto actualizado correctamente.");
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error al editar producto:", error);
      onMessage("error", error.message || "No se pudo editar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Editar producto"
    >
      <form className="modal-card product-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Editar producto</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            X
          </button>
        </div>

        <div className="form-grid">
          <label>
            Código
            <input
              required
              value={form.codigo}
              onChange={(event) => updateField("codigo", event.target.value)}
            />
          </label>
          <label>
            Nombre
            <input
              required
              value={form.nombre}
              onChange={(event) => updateField("nombre", event.target.value)}
            />
          </label>
          <label>
            Categoría
            <select
              value={form.categoria_id}
              onChange={(event) =>
                updateField("categoria_id", event.target.value)
              }
            >
              <option value="">Sin categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Precio costo
            <input
              min="0"
              required
              step="0.01"
              type="number"
              value={form.precio_costo}
              onChange={(event) =>
                updateField("precio_costo", event.target.value)
              }
            />
          </label>
          <label>
            Precio venta
            <input
              min="0"
              required
              step="0.01"
              type="number"
              value={form.precio_venta}
              onChange={(event) =>
                updateField("precio_venta", event.target.value)
              }
            />
          </label>
          <label>
            Stock actual
            <input
              min="0"
              required
              step="1"
              type="number"
              value={form.stock_actual}
              onChange={(event) =>
                updateField("stock_actual", event.target.value)
              }
            />
          </label>
          <label>
            Stock mínimo
            <input
              min="0"
              required
              step="1"
              type="number"
              value={form.stock_minimo}
              onChange={(event) =>
                updateField("stock_minimo", event.target.value)
              }
            />
          </label>
          <label>
            Imagen URL
            <input
              value={form.imagen_url}
              onChange={(event) =>
                updateField("imagen_url", event.target.value)
              }
            />
          </label>
          <label className="span-2">
            Descripción
            <textarea
              value={form.descripcion}
              onChange={(event) =>
                updateField("descripcion", event.target.value)
              }
            />
          </label>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary-button" disabled={saving} type="submit">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
