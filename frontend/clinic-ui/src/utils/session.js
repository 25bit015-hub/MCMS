export function getSessionToken() {
  return localStorage.getItem("clinic_token");
}

export function getSessionUser() {
  const user = localStorage.getItem("clinic_user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function hasSession() {
  const token = getSessionToken();
  const user = getSessionUser();

  return Boolean(token && user);
}

export function clearSession() {
  localStorage.removeItem("clinic_token");
  localStorage.removeItem("clinic_user");
}