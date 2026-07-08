import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

const initialForm = {
  codigo: "",
  nombre: "",
  categoria_id: "",
  precio_costo: "",
  precio_venta: "",
  stock_actual: "",
  stock_minimo: "",
  descripcion: "",
};

const money = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function productToForm(product) {
  if (!product) return initialForm;

  return {
    codigo: product.codigo ?? "",
    nombre: product.nombre ?? "",
    categoria_id: product.categoria_id ?? "",
    precio_costo: product.precio_costo ?? "",
    precio_venta: product.precio_venta ?? "",
    stock_actual: product.stock_actual ?? "",
    stock_minimo: product.stock_minimo ?? "",
    descripcion: product.descripcion ?? "",
  };
}

function ProductForm({ categorias, editingProduct, onCancel, onSaved }) {
  const [form, setForm] = useState(() => productToForm(editingProduct));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      categoria_id: form.categoria_id || null,
      precio_costo: toNumber(form.precio_costo),
      precio_venta: toNumber(form.precio_venta),
      stock_actual: toNumber(form.stock_actual),
      stock_minimo: toNumber(form.stock_minimo),
      descripcion: form.descripcion.trim() || null,
    };

    if (!payload.codigo || !payload.nombre) {
      setError("Código y nombre son obligatorios.");
      setSaving(false);
      return;
    }

    try {
      const query = editingProduct
        ? supabase
            .from("productos")
            .update(payload)
            .eq("id", editingProduct.id)
            .select()
            .single()
        : supabase.from("productos").insert(payload).select().single();

      const { error: saveError } = await query;
      if (saveError) throw saveError;

      setForm(initialForm);
      onSaved();
    } catch (saveError) {
      setError(saveError.message || "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="panel-title">
        <span>{editingProduct ? "Editar producto" : "Nuevo producto"}</span>
        {editingProduct && (
          <button className="ghost-button" type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      <label>
        Código
        <input
          value={form.codigo}
          onChange={(event) => updateField("codigo", event.target.value)}
        />
      </label>

      <label className="span-2">
        Nombre
        <input
          value={form.nombre}
          onChange={(event) => updateField("nombre", event.target.value)}
        />
      </label>

      <label>
        Categoría
        <select
          value={form.categoria_id}
          onChange={(event) => updateField("categoria_id", event.target.value)}
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
        Costo
        <input
          min="0"
          step="0.01"
          type="number"
          value={form.precio_costo}
          onChange={(event) => updateField("precio_costo", event.target.value)}
        />
      </label>

      <label>
        Venta
        <input
          min="0"
          step="0.01"
          type="number"
          value={form.precio_venta}
          onChange={(event) => updateField("precio_venta", event.target.value)}
        />
      </label>

      <label>
        Stock
        <input
          min="0"
          step="1"
          type="number"
          value={form.stock_actual}
          onChange={(event) => updateField("stock_actual", event.target.value)}
        />
      </label>

      <label>
        Mínimo
        <input
          min="0"
          step="1"
          type="number"
          value={form.stock_minimo}
          onChange={(event) => updateField("stock_minimo", event.target.value)}
        />
      </label>

      <label className="span-2">
        Descripción
        <textarea
          value={form.descripcion}
          onChange={(event) => updateField("descripcion", event.target.value)}
        />
      </label>

      <button className="primary-button span-2" disabled={saving} type="submit">
        {saving
          ? "Guardando..."
          : editingProduct
            ? "Guardar cambios"
            : "Agregar producto"}
      </button>
    </form>
  );
}

export default function ProductList() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [stockFilter, setStockFilter] = useState("todos");
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        { data: productsData, error: productsError },
        { data: categoriesData, error: categoriesError },
      ] = await Promise.all([
        supabase
          .from("productos")
          .select("*, categorias(id, nombre)")
          .order("nombre", { ascending: true }),
        supabase
          .from("categorias")
          .select("*")
          .order("nombre", { ascending: true }),
      ]);

      if (productsError) throw productsError;
      if (categoriesError) throw categoriesError;

      setProductos(productsData ?? []);
      setCategorias(categoriesData ?? []);
    } catch (fetchError) {
      setError(fetchError.message || "No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const totalProductos = productos.length;
    const totalUnidades = productos.reduce(
      (total, product) => total + toNumber(product.stock_actual),
      0,
    );
    const valorInventario = productos.reduce(
      (total, product) =>
        total + toNumber(product.stock_actual) * toNumber(product.precio_venta),
      0,
    );
    const bajoStock = productos.filter(
      (product) =>
        toNumber(product.stock_actual) <= toNumber(product.stock_minimo),
    ).length;

    return { totalProductos, totalUnidades, valorInventario, bajoStock };
  }, [productos]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return productos.filter((product) => {
      const matchesSearch =
        !term ||
        product.nombre?.toLowerCase().includes(term) ||
        product.codigo?.toLowerCase().includes(term) ||
        product.descripcion?.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === "todas" ||
        String(product.categoria_id) === categoryFilter;
      const isLowStock =
        toNumber(product.stock_actual) <= toNumber(product.stock_minimo);
      const isOut = toNumber(product.stock_actual) === 0;
      const matchesStock =
        stockFilter === "todos" ||
        (stockFilter === "bajo" && isLowStock) ||
        (stockFilter === "agotado" && isOut);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [categoryFilter, productos, search, stockFilter]);

  const handleDelete = async (product) => {
    const shouldDelete = window.confirm(`¿Eliminar ${product.nombre}?`);
    if (!shouldDelete) return;

    const { error: deleteError } = await supabase
      .from("productos")
      .delete()
      .eq("id", product.id);
    if (deleteError) {
      setError(deleteError.message || "No se pudo eliminar el producto.");
      return;
    }

    if (editingProduct?.id === product.id) setEditingProduct(null);
    fetchData();
  };

  const updateStock = async (product, amount, tipo) => {
    const nextStock = Math.max(0, toNumber(product.stock_actual) + amount);
    const { error: stockError } = await supabase
      .from("productos")
      .update({ stock_actual: nextStock })
      .eq("id", product.id);

    if (stockError) {
      setError(stockError.message || "No se pudo actualizar el stock.");
      return;
    }

    await supabase.from("movimientos_inventario").insert({
      producto_id: product.id,
      tipo,
      cantidad: Math.abs(amount),
      motivo:
        tipo === "entrada"
          ? "Ajuste rápido de entrada"
          : "Ajuste rápido de salida",
      usuario_id: null,
    });

    fetchData();
  };

  return (
    <main className="inventory-shell">
      <section className="hero-band">
        <div>
          <p className="eyebrow">Librería Inventario</p>
          <h1>Control diario para ventas, stock y reposición.</h1>
        </div>
        <button className="refresh-button" type="button" onClick={fetchData}>
          Actualizar
        </button>
      </section>

      <section className="stats-grid" aria-label="Resumen de inventario">
        <article>
          <span>Productos</span>
          <strong>{stats.totalProductos}</strong>
        </article>
        <article>
          <span>Unidades</span>
          <strong>{stats.totalUnidades}</strong>
        </article>
        <article>
          <span>Valor venta</span>
          <strong>{money.format(stats.valorInventario)}</strong>
        </article>
        <article className={stats.bajoStock > 0 ? "warning-stat" : ""}>
          <span>Bajo stock</span>
          <strong>{stats.bajoStock}</strong>
        </article>
      </section>

      <section className="workspace-grid">
        <aside className="side-panel">
          <ProductForm
            key={editingProduct?.id ?? "nuevo"}
            categorias={categorias}
            editingProduct={editingProduct}
            onCancel={() => setEditingProduct(null)}
            onSaved={() => {
              setEditingProduct(null);
              fetchData();
            }}
          />
        </aside>

        <section className="inventory-panel">
          <div className="toolbar">
            <label className="search-box">
              Buscar
              <input
                placeholder="Código, nombre o descripción"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label>
              Categoría
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="todas">Todas</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Stock
              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="bajo">Bajo mínimo</option>
                <option value="agotado">Agotado</option>
              </select>
            </label>
          </div>

          {error && <p className="app-error">{error}</p>}
          {loading ? (
            <div className="empty-state">Cargando inventario...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              No hay productos con esos filtros.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const isLowStock =
                      toNumber(product.stock_actual) <=
                      toNumber(product.stock_minimo);
                    return (
                      <tr key={product.id}>
                        <td className="code-cell">{product.codigo}</td>
                        <td>
                          <strong>{product.nombre}</strong>
                          <span>
                            {product.descripcion || "Sin descripción"}
                          </span>
                        </td>
                        <td>{product.categorias?.nombre || "Sin categoría"}</td>
                        <td>
                          <span
                            className={
                              isLowStock ? "stock-pill stock-low" : "stock-pill"
                            }
                          >
                            {product.stock_actual ?? 0} / mín.{" "}
                            {product.stock_minimo ?? 0}
                          </span>
                        </td>
                        <td>{money.format(toNumber(product.precio_venta))}</td>
                        <td className="action-cell">
                          <button
                            type="button"
                            title="Entrada rápida"
                            onClick={() => updateStock(product, 1, "entrada")}
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            title="Salida rápida"
                            onClick={() => updateStock(product, -1, "salida")}
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProduct(product)}
                          >
                            Editar
                          </button>
                          <button
                            className="danger-button"
                            type="button"
                            onClick={() => handleDelete(product)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
