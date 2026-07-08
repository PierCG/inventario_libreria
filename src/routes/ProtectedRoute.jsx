import { usePermissions } from "../hooks/usePermissions";

export default function ProtectedRoute({
  children,
  fallback = null,
  moduleName,
}) {
  const { canAccess } = usePermissions();

  if (!moduleName || canAccess(moduleName)) {
    return children;
  }

  return fallback;
}
