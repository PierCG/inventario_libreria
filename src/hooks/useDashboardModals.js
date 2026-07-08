import { useCallback, useState } from "react";

export function useDashboardModals() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [movementModal, setMovementModal] = useState(null);

  const openAddProduct = useCallback(() => setIsAddOpen(true), []);
  const closeAddProduct = useCallback(() => setIsAddOpen(false), []);
  const closeEditProduct = useCallback(() => setEditingProduct(null), []);
  const closeDeleteProduct = useCallback(() => setDeletingProduct(null), []);
  const closeViewProduct = useCallback(() => setViewingProduct(null), []);
  const closeMovement = useCallback(() => setMovementModal(null), []);

  const openMovement = useCallback((producto, type) => {
    setMovementModal({ producto, type });
  }, []);

  return {
    closeAddProduct,
    closeDeleteProduct,
    closeEditProduct,
    closeMovement,
    closeViewProduct,
    deletingProduct,
    editingProduct,
    isAddOpen,
    movementModal,
    openAddProduct,
    openMovement,
    setDeletingProduct,
    setEditingProduct,
    setViewingProduct,
    viewingProduct,
  };
}
