import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function CategoriesPanel({
  categorias,
  selectedCategory,
  onCategoryChange,
  onCategoryCreated,
  onMessage,
  canWrite,
}) {
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanName = nombre.trim();

    if (!canWrite) {
      onMessage("error", "Inicia sesión para agregar categorías.");
      return;
    }

    if (!cleanName) {
      onMessage("error", "Escribe un nombre para la categoría.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("categorias")
        .insert({ nombre: cleanName });
      if (error) throw error;

      setNombre("");
      onMessage("success", "Categoría agregada correctamente.");
      onCategoryCreated();
    } catch (error) {
      console.error("Error al crear categoría:", error);
      onMessage("error", error.message || "No se pudo agregar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel categories-panel">
      <div className="panel-title">
        <span>Categorías</span>
      </div>

      <div className="category-list">
        <button
          className={
            selectedCategory === "todas"
              ? "category-option active"
              : "category-option"
          }
          type="button"
          onClick={() => onCategoryChange("todas")}
        >
          Todas las categorías
        </button>
        {categorias.map((categoria) => (
          <button
            className={
              String(selectedCategory) === String(categoria.id)
                ? "category-option active"
                : "category-option"
            }
            key={categoria.id}
            type="button"
            onClick={() => onCategoryChange(String(categoria.id))}
          >
            {categoria.nombre}
          </button>
        ))}
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <label>
          Nueva categoría
          <input
            disabled={!canWrite}
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
          />
        </label>
        <button
          className="secondary-button"
          disabled={saving || !canWrite}
          type="submit"
        >
          {saving ? "Agregando..." : "Agregar categoría"}
        </button>
      </form>
    </section>
  );
}
