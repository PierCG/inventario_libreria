import { useCallback, useState } from "react";

const initialFilters = {
  search: "",
  categoryId: "todas",
  stockStatus: "todos",
  minPrice: "",
  maxPrice: "",
};

export function useDashboardState() {
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [activeView, setActiveView] = useState("todos");

  const showMessage = useCallback((type, text) => {
    setToasts((current) => [
      ...current.slice(-3),
      { id: `${Date.now()}-${Math.random()}`, type, text },
    ]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setFilters((current) => ({ ...current, categoryId }));
    setActiveView(categoryId === "todas" ? "todos" : "categoria");
  }, []);

  return {
    activeView,
    dismissToast,
    filters,
    handleCategoryChange,
    setActiveView,
    setFilters,
    showMessage,
    toasts,
  };
}
