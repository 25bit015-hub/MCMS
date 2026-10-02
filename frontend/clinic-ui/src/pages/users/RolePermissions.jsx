import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, Save } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadPermissions(selectedRole);
    }
  }, [selectedRole]);

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      const [rolesResponse, modulesResponse] = await Promise.all([
  api.get("/roles"),
  api.get("/modules"),
]);

const rolesData = rolesResponse.data;
const modulesData = modulesResponse.data;

      setRoles(rolesData);
      setModules(modulesData);

      if (rolesData.length > 0) {
        setSelectedRole(String(rolesData[0].id));
      }
    } catch (err) {
      setError(err.message || "Failed to load permission data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPermissions(roleId) {
    try {
      setError("");
      setMessage("");

      const response = await api.get(
  `/role-modules/role/${roleId}`
);

const data = response.data;

      const permissionMap = {};

      data.forEach((item) => {
        permissionMap[item.module.id] = item.allowed;
      });

      setPermissions(permissionMap);
    } catch (err) {
      setError(err.message || "Failed to load permissions.");
      setPermissions({});
    }
  }

  function handlePermissionChange(moduleId) {
    setPermissions((current) => ({
      ...current,
      [moduleId]: !current[moduleId],
    }));
  }

  async function savePermissions() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      for (const module of modules) {
        const allowed = Boolean(permissions[module.id]);

        await api.post(
  `/role-modules?roleId=${selectedRole}&moduleId=${module.id}&allowed=${allowed}`
);
      }

      setMessage("Permissions saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  }

  const selectedRoleData = roles.find(
    (role) => String(role.id) === String(selectedRole)
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading permissions...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-3">
          <Link
            to="/users"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Role Permissions
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage module access for each system role.
            </p>
          </div>
        </div>

        <button
          onClick={savePermissions}
          disabled={saving || !selectedRole}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />

          {saving ? "Saving..." : "Save Permissions"}
        </button>
      </div>

      {/* Role Selection */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Select Role
            </h2>

            <p className="text-sm text-gray-500">
              Choose a role to manage its module permissions.
            </p>
          </div>
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:max-w-md"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Permissions */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-semibold text-gray-900">
            Module Access
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {selectedRoleData
              ? `Permissions for ${selectedRoleData.name}`
              : "Select a role"}
          </p>
        </div>

        <div className="divide-y divide-gray-100">

          {modules.map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {module.displayName}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {module.path}
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={Boolean(permissions[module.id])}
                  onChange={() =>
                    handlePermissionChange(module.id)
                  }
                  className="peer sr-only"
                />

                <div className="relative h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-blue-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100">
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          ))}

        </div>

        {modules.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No modules found.
          </div>
        )}
      </div>

    </div>
  );
}