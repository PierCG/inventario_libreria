export const ROLES = {
  ADMINISTRADOR: "administrador",
  ALMACEN: "almacen",
  CAJERO: "cajero",
  SUPERVISOR: "supervisor",
};

export const MODULES = {
  CLIENTES: "clientes",
  COMPRAS: "compras",
  DASHBOARD: "dashboard",
  INVENTARIO: "inventario",
  MOVIMIENTOS: "movimientos",
  PRODUCTOS: "productos",
  REPORTES: "reportes",
  USUARIOS: "usuarios",
  VENTAS: "ventas",
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMINISTRADOR]: Object.values(MODULES),
  [ROLES.CAJERO]: [MODULES.VENTAS, MODULES.CLIENTES, MODULES.PRODUCTOS],
  [ROLES.ALMACEN]: [MODULES.PRODUCTOS, MODULES.INVENTARIO, MODULES.MOVIMIENTOS],
  [ROLES.SUPERVISOR]: [MODULES.DASHBOARD, MODULES.REPORTES],
};
