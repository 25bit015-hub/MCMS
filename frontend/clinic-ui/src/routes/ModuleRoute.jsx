import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import api from "../services/api";

export default function ModuleRoute({
  moduleName,
  children,
}) {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    checkPermission();
  }, [moduleName]);

  async function checkPermission() {
    try {
      setLoading(true);

      const storedUser =
        localStorage.getItem("clinic_user");

      if (!storedUser) {
        setAllowed(false);
        return;
      }

      const user = JSON.parse(storedUser);

      const roleName = String(
        user.role || ""
      )
        .trim()
        .toUpperCase();

      if (!roleName) {
        setAllowed(false);
        return;
      }

      /* =========================
         ADMIN
      ========================== */

      if (roleName === "ADMIN") {
        setAllowed(true);
        return;
      }

      /* =========================
         GET ROLES
      ========================== */

      const rolesResponse =
        await api.get("/roles");

      const roles = Array.isArray(
        rolesResponse.data
      )
        ? rolesResponse.data
        : [];

      const currentRole = roles.find(
        (role) =>
          String(role.name || "")
            .trim()
            .toUpperCase() === roleName
      );

      if (!currentRole) {
        setAllowed(false);
        return;
      }

      /* =========================
         GET ROLE MODULE PERMISSIONS
      ========================== */

      const permissionsResponse =
        await api.get(
          `/role-modules/role/${currentRole.id}`
        );

      const permissions =
        Array.isArray(
          permissionsResponse.data
        )
          ? permissionsResponse.data
          : [];

      const hasPermission =
        permissions.some(
          (permission) =>
            permission.allowed === true &&
            permission.module &&
            String(
              permission.module.name || ""
            )
              .trim()
              .toUpperCase() ===
              String(moduleName || "")
                .trim()
                .toUpperCase()
        );

      setAllowed(hasPermission);

    } catch (error) {
      console.error(
        "Failed to check module permission:",
        error
      );

      setAllowed(false);

    } finally {
      setLoading(false);
    }
  }

  /* =========================
     LOADING
  ========================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-500">
          Checking permissions...
        </div>
      </div>
    );
  }

  /* =========================
     NOT ALLOWED
  ========================== */

  if (!allowed) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          from: location.pathname,
          message:
            "Huna ruhusa ya kufungua ukurasa huu.",
        }}
      />
    );
  }

  /* =========================
     ALLOWED
  ========================== */

  return children;
}