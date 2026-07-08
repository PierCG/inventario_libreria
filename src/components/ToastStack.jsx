import { useEffect } from "react";

export default function ToastStack({ toasts, onDismiss }) {
  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => onDismiss(toast.id), 4200),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [onDismiss, toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div className={`toast ${toast.type}`} role="status" key={toast.id}>
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar mensaje"
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
}
