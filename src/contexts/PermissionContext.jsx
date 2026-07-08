import { useMemo } from "react";
import { ROLE_PERMISSIONS, ROLES } from "../constants/permissions";
import { PermissionContext } from "./permissionContextValue";

function resolveRole(session) {
  return (
    session?.user?.app_metadata?.rol ||
    session?.user?.app_metadata?.role ||
    ROLES.ADMINISTRADOR
  );
}

export function PermissionProvider({ children, session }) {
  const value = useMemo(() => {
    const role = resolveRole(session);
    const permissions = ROLE_PERMISSIONS[role] ?? [];

    return {
      canAccess: (moduleName) => permissions.includes(moduleName),
      permissions,
      role,
    };
  }, [session]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}
