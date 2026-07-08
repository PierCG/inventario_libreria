import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function DeleteProductModal({ producto, onClose, onDeleted, onMessage }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const { error } = await supabase.from('productos').delete().eq('id', producto.id)
      if (error) throw error

      onMessage('success', 'Producto eliminado correctamente.')
      onDeleted()
      onClose()
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      onMessage('error', error.message || 'No se pudo eliminar el producto.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Eliminar producto">
      <div className="modal-card confirm-modal">
        <div className="modal-header">
          <h2>Eliminar producto</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar">
            X
          </button>
        </div>

        <p>
          Confirma la eliminacion de <strong>{producto.nombre}</strong>. Esta accion no se puede deshacer.
        </p>

        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="danger-button" disabled={deleting} type="button" onClick={handleDelete}>
            {deleting ? 'Eliminando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
