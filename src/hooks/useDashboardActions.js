import { useCallback, useEffect } from "react";

export function useDashboardActions({
  canWrite,
  invalidateAll,
  openAddProduct,
  openMovement,
  showMessage,
}) {
  const refreshData = useCallback(() => {
    invalidateAll();
    showMessage("success", "Datos actualizados.");
  }, [invalidateAll, showMessage]);

  const requireSession = useCallback(() => {
    if (canWrite) return true;
    showMessage("error", "Inicia sesión para modificar el inventario.");
    return false;
  }, [canWrite, showMessage]);

  const requestAddProduct = useCallback(() => {
    if (requireSession()) openAddProduct();
  }, [openAddProduct, requireSession]);

  const requestMovement = useCallback(
    (producto, type) => {
      if (requireSession()) openMovement(producto, type);
    },
    [openMovement, requireSession],
  );

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        requestAddProduct();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [requestAddProduct]);

  return {
    refreshData,
    requestAddProduct,
    requestMovement,
  };
}
