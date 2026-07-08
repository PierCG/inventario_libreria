export default function SearchAndFilter({
  categorias,
  filters,
  onFiltersChange,
  onAddProduct,
  canWrite,
}) {
  const updateFilter = (field, value) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  return (
    <section className="panel search-panel">
      <div className="search-header">
        <div>
          <p className="eyebrow">Búsqueda</p>
          <h2>Productos</h2>
        </div>
        <button
          className="primary-button"
          disabled={!canWrite}
          type="button"
          onClick={onAddProduct}
        >
          Nuevo producto
        </button>
      </div>

      <div className="toolbar">
        <label className="search-box">
          Buscar
          <input
            placeholder="Código, nombre o descripción"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
          />
        </label>

        <label>
          Categoría
          <select
            value={filters.categoryId}
            onChange={(event) => updateFilter("categoryId", event.target.value)}
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
            value={filters.stockStatus}
            onChange={(event) =>
              updateFilter("stockStatus", event.target.value)
            }
          >
            <option value="todos">Todos</option>
            <option value="bajo">Bajo</option>
            <option value="normal">Normal</option>
          </select>
        </label>

        <label>
          Precio min.
          <input
            min="0"
            placeholder="S/ 0.00"
            step="0.01"
            type="number"
            value={filters.minPrice}
            onChange={(event) => updateFilter("minPrice", event.target.value)}
          />
        </label>

        <label>
          Precio max.
          <input
            min="0"
            placeholder="Sin limite"
            step="0.01"
            type="number"
            value={filters.maxPrice}
            onChange={(event) => updateFilter("maxPrice", event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
