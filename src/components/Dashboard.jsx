import { MODULES } from "../constants/permissions";
import { usePermissions } from "../hooks/usePermissions";
import { useDashboardActions } from "../hooks/useDashboardActions";
import { useDashboardModals } from "../hooks/useDashboardModals";
import { useDashboardState } from "../hooks/useDashboardState";
import {
  useInventoryData,
  useInvalidateInventory,
} from "../hooks/useInventoryData";
import { useProductFilters } from "../hooks/useProductFilters";
import { useRealtimeInventory } from "../hooks/useRealtimeInventory";
import AddProductModal from "./AddProductModal";
import CategoriesPanel from "./CategoriesPanel";
import DeleteProductModal from "./DeleteProductModal";
import EditProductModal from "./EditProductModal";
import InventoryMovementModal from "./InventoryMovementModal";
import LoginPanel from "./LoginPanel";
import MovementsHistory from "./MovementsHistory";
import ProductDetailsModal from "./ProductDetailsModal";
import ProductsTable from "./ProductsTable";
import ReportsPanel from "./ReportsPanel";
import SearchAndFilter from "./SearchAndFilter";
import StatsCards from "./StatsCards";
import ToastStack from "./ToastStack";

export default function Dashboard({ session }) {
  const { productos, categorias, movimientos, isLoading, isFetching, error } =
    useInventoryData();
  const {
    invalidateAll,
    invalidateProductos,
    invalidateCategorias,
    invalidateMovimientos,
  } = useInvalidateInventory();
  const { canAccess, role } = usePermissions();
  const {
    activeView,
    dismissToast,
    filters,
    handleCategoryChange,
    setActiveView,
    setFilters,
    showMessage,
    toasts,
  } = useDashboardState();
  const modals = useDashboardModals();
  const canWrite = Boolean(session?.user);

  useRealtimeInventory({
    invalidateCategorias,
    invalidateMovimientos,
    invalidateProductos,
  });

  const { categorySummary, lowStockProducts, visibleProducts } =
    useProductFilters({
      activeView,
      categorias,
      filters,
      productos,
    });

  const { refreshData, requestAddProduct, requestMovement } =
    useDashboardActions({
      canWrite,
      invalidateAll,
      openAddProduct: modals.openAddProduct,
      openMovement: modals.openMovement,
      showMessage,
    });

  const showProductsModule = canAccess(MODULES.PRODUCTOS);
  const showMovementsModule = canAccess(MODULES.MOVIMIENTOS);
  const showReportsModule = canAccess(MODULES.REPORTES);

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">LI</span>
          <strong>Inventario</strong>
        </div>

        <nav className="side-menu" aria-label="Menu principal">
          <a className="active" href="#dashboard">
            <span>D</span>
            Panel
          </a>
          {showProductsModule && (
            <a href="#productos" onClick={() => setActiveView("todos")}>
              <span>P</span>
              Productos
              <b>v</b>
            </a>
          )}
          {showProductsModule && (
            <a href="#categorias" onClick={() => setActiveView("categoria")}>
              <span>C</span>
              Categorías
              <b>v</b>
            </a>
          )}
          {showMovementsModule && (
            <a href="#movimientos" onClick={() => setActiveView("movimientos")}>
              <span>M</span>
              Movimientos
              <b>v</b>
            </a>
          )}
          {showReportsModule && (
            <a href="#reportes">
              <span>R</span>
              Reportes
            </a>
          )}
        </nav>
      </aside>

      <section className="admin-main">
        <header className="topbar">
          <div className="topbar-logo">
            <span className="topbar-mark">LI</span>
            <div>
              <strong>Librería Inventario</strong>
              <small>Panel operativo · rol {role}</small>
            </div>
          </div>
          <label className="topbar-search">
            <span>Buscar</span>
            <input
              placeholder="Código, nombre o descripción"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
            />
          </label>
          <LoginPanel session={session} onMessage={showMessage} />
        </header>

        <section className="dashboard-heading" id="dashboard">
          <div className="heading-icon">D</div>
          <div>
            <h1>PANEL</h1>
            <p>
              Control general del inventario de librería: productos, categorías,
              unidades disponibles y alertas de stock mínimo.
            </p>
          </div>
          <button
            className="secondary-button refresh-button"
            type="button"
            onClick={refreshData}
          >
            {isFetching ? "Actualizando..." : "Actualizar"}
          </button>
        </section>

        <ToastStack toasts={toasts} onDismiss={dismissToast} />

        {error && (
          <div className="query-error" role="alert">
            {error.message || "No se pudo cargar la información."}
          </div>
        )}

        {isFetching && !isLoading && (
          <div className="sync-indicator">
            <span className="mini-spinner" />
            Sincronizando caché
          </div>
        )}

        <StatsCards productos={productos} />

        {!canWrite && (
          <div className="auth-notice">
            Inicia sesión para crear productos, categorías y movimientos de
            inventario.
          </div>
        )}

        {showProductsModule && (
          <section className="workspace-grid" id="productos">
            <aside className="left-workspace" id="categorias">
              <CategoriesPanel
                categorias={categorias}
                selectedCategory={filters.categoryId}
                onCategoryChange={handleCategoryChange}
                onCategoryCreated={invalidateCategorias}
                onMessage={showMessage}
                canWrite={canWrite}
              />
            </aside>

            <section className="main-workspace">
              <div className="view-tabs" aria-label="Vistas de inventario">
                <button
                  className={activeView === "todos" ? "active" : ""}
                  type="button"
                  onClick={() => setActiveView("todos")}
                >
                  Todos
                </button>
                <button
                  className={activeView === "categoria" ? "active" : ""}
                  type="button"
                  onClick={() => setActiveView("categoria")}
                >
                  Por categoría
                </button>
                <button
                  className={activeView === "bajo-stock" ? "active" : ""}
                  type="button"
                  onClick={() => setActiveView("bajo-stock")}
                >
                  Bajo stock
                </button>
                {showMovementsModule && (
                  <button
                    className={activeView === "movimientos" ? "active" : ""}
                    type="button"
                    onClick={() => setActiveView("movimientos")}
                  >
                    Movimientos
                  </button>
                )}
              </div>

              {activeView === "categoria" && (
                <section
                  className="category-overview"
                  aria-label="Resumen por categoría"
                >
                  {categorySummary.map((categoria) => (
                    <button
                      className={
                        String(filters.categoryId) === String(categoria.id)
                          ? "category-card active"
                          : "category-card"
                      }
                      key={categoria.id}
                      type="button"
                      onClick={() => handleCategoryChange(String(categoria.id))}
                    >
                      <strong>{categoria.nombre}</strong>
                      <span>{categoria.count} productos</span>
                      <small>{categoria.lowStock} con bajo stock</small>
                    </button>
                  ))}
                </section>
              )}

              {activeView === "bajo-stock" && (
                <section
                  className="low-stock-alert"
                  aria-label="Alertas de bajo stock"
                >
                  <strong>
                    {lowStockProducts.length} productos con bajo stock
                  </strong>
                  <span>
                    Revisa la reposición antes de registrar nuevas salidas.
                  </span>
                </section>
              )}

              <SearchAndFilter
                categorias={categorias}
                filters={filters}
                onFiltersChange={setFilters}
                onAddProduct={requestAddProduct}
                canWrite={canWrite}
              />

              {activeView === "movimientos" && showMovementsModule ? (
                <MovementsHistory movimientos={movimientos} />
              ) : (
                <ProductsTable
                  productos={visibleProducts}
                  loading={isLoading}
                  isFetching={isFetching}
                  viewMode={activeView}
                  onEdit={modals.setEditingProduct}
                  onDelete={modals.setDeletingProduct}
                  onView={modals.setViewingProduct}
                  onMovement={requestMovement}
                  canWrite={canWrite}
                />
              )}
            </section>
          </section>
        )}

        <section className="secondary-grid">
          {showMovementsModule && activeView !== "movimientos" && (
            <MovementsHistory movimientos={movimientos} />
          )}
          {showReportsModule && (
            <ReportsPanel productos={productos} movimientos={movimientos} />
          )}
        </section>

        {modals.isAddOpen && (
          <AddProductModal
            categorias={categorias}
            onClose={modals.closeAddProduct}
            onSaved={invalidateProductos}
            onMessage={showMessage}
          />
        )}

        {modals.editingProduct && (
          <EditProductModal
            key={modals.editingProduct.id}
            producto={modals.editingProduct}
            categorias={categorias}
            onClose={modals.closeEditProduct}
            onSaved={invalidateProductos}
            onMessage={showMessage}
          />
        )}

        {modals.deletingProduct && (
          <DeleteProductModal
            producto={modals.deletingProduct}
            onClose={modals.closeDeleteProduct}
            onDeleted={invalidateProductos}
            onMessage={showMessage}
          />
        )}

        {modals.movementModal && (
          <InventoryMovementModal
            producto={modals.movementModal.producto}
            type={modals.movementModal.type}
            session={session}
            onClose={modals.closeMovement}
            onSaved={invalidateAll}
            onMessage={showMessage}
          />
        )}

        {modals.viewingProduct && (
          <ProductDetailsModal
            producto={modals.viewingProduct}
            onClose={modals.closeViewProduct}
          />
        )}
      </section>
    </main>
  );
}
