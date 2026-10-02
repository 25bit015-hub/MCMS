import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  ClipboardList,
  Users,
  CalendarDays,
  Stethoscope,
  Syringe,
  FlaskConical,
  Pill,
  CalendarClock,
  BarChart3,
  HeartPulse,
  User,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import api from "../../services/api";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    end: true,
    moduleName: "DASHBOARD",
  },

  {
    label: "Reception",
    icon: ClipboardList,
    path: "/reception",
    moduleName: "RECEPTION",
  },

  {
    label: "Patients",
    icon: Users,
    path: "/reception/patients",
    moduleName: "RECEPTION",
  },

  {
    label: "Patient Queue",
    icon: ClipboardList,
    path: "/reception/queue",
    moduleName: "RECEPTION",
  },

  {
    label: "Nurse",
    icon: Syringe,
    path: "/nurse",
    moduleName: "NURSE",
  },

  {
    label: "Doctor",
    icon: Stethoscope,
    path: "/doctor",
    moduleName: "DOCTOR",
  },

  {
    label: "Appointments",
    icon: CalendarDays,
    path: "/appointments",
    adminOnly: true,
  },

  {
    label: "Laboratory",
    icon: FlaskConical,
    path: "/laboratory",
    moduleName: "LABORATORY",
  },

  {
    label: "Pharmacy",
    icon: Pill,
    path: "/pharmacy",
    moduleName: "PHARMACY",
  },

  {
    label: "Expiry Management",
    icon: CalendarClock,
    path: "/pharmacy/expiry",
    moduleName: "PHARMACY",
  },

  {
    label: "Maternity",
    icon: Pill,
    path: "/maternity",
    adminOnly: true,
  },

  {
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
    adminOnly: true,
  },

  {
    label: "Users",
    icon: User,
    path: "/users",
    moduleName: "USERS",
  },
];

export default function Sidebar() {
  const [allowedModules, setAllowedModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD ROLE PERMISSIONS
  // =========================================================

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      setLoading(true);

      const storedUser =
        localStorage.getItem("clinic_user");

      if (!storedUser) {
        setAllowedModules([]);
        return;
      }

      const user = JSON.parse(storedUser);

      const roleName = String(
        user.role || ""
      )
        .trim()
        .toUpperCase();

      if (!roleName) {
        setAllowedModules([]);
        return;
      }

      // =====================================================
      // GET ALL ROLES
      // =====================================================

      const rolesResponse =
        await api.get("/roles");

      const roles = Array.isArray(
        rolesResponse.data
      )
        ? rolesResponse.data
        : [];

      // =====================================================
      // FIND CURRENT USER ROLE
      // =====================================================

      const currentRole = roles.find(
        (role) =>
          String(role.name || "")
            .trim()
            .toUpperCase() === roleName
      );

      if (!currentRole) {
        console.error(
          "Role not found:",
          roleName
        );

        setAllowedModules([]);
        return;
      }

      // =====================================================
      // GET ROLE MODULE PERMISSIONS
      // =====================================================

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

      // =====================================================
      // ONLY ALLOWED MODULES
      // =====================================================

      const modules = permissions
        .filter(
          (permission) =>
            permission.allowed === true &&
            permission.module
        )
        .map(
          (permission) =>
            String(
              permission.module.name || ""
            ).toUpperCase()
        );

      setAllowedModules(modules);

    } catch (error) {
      console.error(
        "Failed to load sidebar permissions:",
        error
      );

      setAllowedModules([]);

    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // CHECK WHETHER MENU ITEM IS ALLOWED
  // =========================================================

  function canShowMenu(item) {
    /*
     * Appointments, Maternity and Reports
     * are not yet part of the database modules.
     *
     * For now they remain ADMIN-only.
     */
    if (item.adminOnly) {
      const storedUser =
        localStorage.getItem("clinic_user");

      if (!storedUser) {
        return false;
      }

      try {
        const user = JSON.parse(
          storedUser
        );

        return (
          String(user.role || "")
            .trim()
            .toUpperCase() === "ADMIN"
        );

      } catch {
        return false;
      }
    }

    if (!item.moduleName) {
      return false;
    }

    return allowedModules.includes(
      item.moduleName
    );
  }

  // =========================================================
  // FILTER MENU
  // =========================================================

  const visibleMenuItems =
    menuItems.filter(
      canShowMenu
    );

  // =========================================================
  // LOADING SIDEBAR
  // =========================================================

  if (loading) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 overflow-y-auto bg-gradient-to-b from-[#142746] via-[#10213d] to-[#0b1930] text-white shadow-2xl">

        {/* Logo */}
        <div className="flex h-[88px] items-center gap-3 border-b border-white/10 px-6">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30">
            <HeartPulse size={27} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wide">
              Magirisi Clinic
            </h1>

            <p className="text-[11px] text-blue-200">
              Management System
            </p>
          </div>

        </div>

        {/* Loading */}
        <div className="px-3 py-6">

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-blue-200/70">
            Main Menu
          </p>

          <div className="px-3 py-4 text-xs text-blue-200/60">
            Loading menu...
          </div>

        </div>

      </aside>
    );
  }

  // =========================================================
  // SIDEBAR
  // =========================================================

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 overflow-y-auto bg-gradient-to-b from-[#142746] via-[#10213d] to-[#0b1930] text-white shadow-2xl">

      {/* Logo */}
      <div className="flex h-[88px] items-center gap-3 border-b border-white/10 px-6">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30">
          <HeartPulse size={27} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-wide">
            Magirisi Clinic
          </h1>

          <p className="text-[11px] text-blue-200">
            Management System
          </p>
        </div>

      </div>

      {/* Menu */}
      <div className="px-3 py-6">

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-blue-200/70">
          Main Menu
        </p>

        <nav className="space-y-1.5">

          {visibleMenuItems.map(
            (item) => {

              const Icon =
                item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.end}
                  className={({
                    isActive,
                  }) =>
                    `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                        : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >

                  <Icon
                    size={19}
                    strokeWidth={1.9}
                    className="shrink-0"
                  />

                  <span>
                    {item.label}
                  </span>

                </NavLink>
              );
            }
          )}

        </nav>

      </div>

    </aside>
  );
}