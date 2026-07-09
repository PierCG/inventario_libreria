export function getUserDisplayName(user) {
  const metadata = user?.user_metadata ?? {};
  const name =
    metadata.nombre ||
    metadata.name ||
    metadata.full_name ||
    user?.email?.split("@")[0];

  return name || "Usuario";
}

export function getUserInitials(user) {
  const displayName = getUserDisplayName(user);
  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
}
