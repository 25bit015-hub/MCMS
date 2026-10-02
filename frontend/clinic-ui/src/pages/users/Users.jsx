import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Eye,
  Pencil,
  Users as UsersIcon,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  Settings2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Imeshindikana kupata taarifa za users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.fullName?.toLowerCase().includes(keyword) ||
        user.username?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword);

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.active) ||
        (statusFilter === "INACTIVE" && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.active
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.active
  ).length;

  const roles = [
    "ADMIN",
    "RECEPTION",
    "NURSE",
    "DOCTOR",
    "LABORATORY",
    "PHARMACIST",
    "CASHIER",
  ];

  const getInitials = (fullName) => {
    if (!fullName) return "U";

    return fullName
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join("");
  };

  const getProfilePhotoUrl = (profilePhoto) => {
    if (!profilePhoto) return null;

    if (profilePhoto.startsWith("http")) {
      return profilePhoto;
    }

    return `http://localhost:8080${profilePhoto}`;
  };

  return (
    <div className="space-y-7">

      {/* =========================
          HEADER
      ========================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <UsersIcon
                size={25}
                className="text-blue-600"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Users Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Simamia users, roles na hali ya akaunti za mfumo.
              </p>
            </div>

          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchUsers}
            className="
              flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
            "
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          {/* Role & Permissions */}
          <Link
            to="/users/permissions"
            className="
              flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
            "
          >
            <Settings2 size={18} />
            Role & Permissions
          </Link>

          {/* Add User */}
          <Link
            to="/users/add"
            className="
              flex
              h-11
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              text-sm
              font-semibold
              text-white
              shadow-md
              shadow-blue-500/20
              transition
              hover:bg-blue-700
            "
          >
            <UserPlus size={18} />
            Add User
          </Link>

        </div>
      </div>


      {/* =========================
          STATISTICS
      ========================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {/* Total Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Users
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {totalUsers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <UsersIcon
                size={21}
                className="text-blue-600"
              />
            </div>

          </div>
        </div>


        {/* Active Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Users
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {activeUsers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <UserCheck
                size={21}
                className="text-emerald-600"
              />
            </div>

          </div>
        </div>


        {/* Inactive Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Inactive Users
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {inactiveUsers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <UserX
                size={21}
                className="text-red-600"
              />
            </div>

          </div>
        </div>

      </div>


      {/* =========================
          SEARCH & FILTERS
      ========================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Search */}
          <div className="relative">

            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-11
                pr-4
                text-sm
                text-slate-700
                outline-none
                transition
                focus:border-blue-400
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/10
              "
            />

          </div>


          {/* Role */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="
              h-11
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-4
              text-sm
              text-slate-700
              outline-none
              focus:border-blue-400
              focus:bg-white
              focus:ring-4
              focus:ring-blue-500/10
            "
          >
            <option value="ALL">
              All Roles
            </option>

            {roles.map((role) => (
              <option
                key={role}
                value={role}
              >
                {role}
              </option>
            ))}
          </select>


          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
              h-11
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-4
              text-sm
              text-slate-700
              outline-none
              focus:border-blue-400
              focus:bg-white
              focus:ring-4
              focus:ring-blue-500/10
            "
          >
            <option value="ALL">
              All Status
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>

        </div>
      </div>


      {/* =========================
          ERROR
      ========================== */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}


      {/* =========================
          LOADING
      ========================== */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Inapakia users...
          </p>

        </div>
      )}


      {/* =========================
          USERS LIST
      ========================== */}
      {!loading && !error && (
        <>
          {filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <UsersIcon
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-lg font-semibold text-slate-700">
                No users found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Hakuna user anayelingana na search au filters ulizochagua.
              </p>

            </div>
          ) : (

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* Table Header */}
              <div className="hidden border-b border-slate-200 bg-slate-50 px-6 py-4 lg:grid lg:grid-cols-[2.2fr_1.2fr_1.3fr_1.5fr_1fr_1.2fr] lg:items-center lg:gap-4">

                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  User
                </p>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Username
                </p>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Role
                </p>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Contact
                </p>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </p>

                <p className="text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Actions
                </p>

              </div>


              {/* User Rows */}
              <div className="divide-y divide-slate-100">

                {filteredUsers.map((user) => {

                  const photoUrl = getProfilePhotoUrl(
                    user.profilePhoto
                  );

                  return (
                    <div
                      key={user.id}
                      className="
                        px-5
                        py-5
                        transition
                        hover:bg-slate-50/70
                        lg:px-6
                      "
                    >

                      {/* Desktop */}
                      <div className="hidden lg:grid lg:grid-cols-[2.2fr_1.2fr_1.3fr_1.5fr_1fr_1.2fr] lg:items-center lg:gap-4">

                        {/* User */}
                        <div className="flex min-w-0 items-center gap-3">

                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={user.fullName}
                              className="
                                h-11
                                w-11
                                shrink-0
                                rounded-xl
                                object-cover
                                shadow-sm
                              "
                            />
                          ) : (
                            <div
                              className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-gradient-to-br
                                from-blue-400
                                to-blue-600
                                text-xs
                                font-bold
                                text-white
                                shadow-md
                                shadow-blue-500/20
                              "
                            >
                              {getInitials(user.fullName)}
                            </div>
                          )}

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-slate-800">
                              {user.fullName}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {user.email || "No email"}
                            </p>

                          </div>

                        </div>


                        {/* Username */}
                        <div className="min-w-0">

                          <p className="truncate text-sm font-medium text-slate-700">
                            @{user.username}
                          </p>

                        </div>


                        {/* Role */}
                        <div>

                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
                            <ShieldCheck size={14} />
                            {user.role}
                          </span>

                        </div>


                        {/* Contact */}
                        <div className="min-w-0">

                          <p className="truncate text-sm font-medium text-slate-700">
                            {user.phone || "-"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {user.email || "-"}
                          </p>

                        </div>


                        {/* Status */}
                        <div>

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${
                                user.active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }
                            `}
                          >

                            <span
                              className={`
                                h-1.5
                                w-1.5
                                rounded-full
                                ${
                                  user.active
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }
                              `}
                            />

                            {user.active
                              ? "Active"
                              : "Inactive"}

                          </span>

                        </div>


                        {/* Actions */}
                        <div className="flex justify-end gap-2">

                          <Link
                            to={`/users/${user.id}`}
                            title="View User"
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              text-slate-600
                              transition
                              hover:border-blue-200
                              hover:bg-blue-50
                              hover:text-blue-600
                            "
                          >
                            <Eye size={16} />
                          </Link>

                          <Link
                            to={`/users/${user.id}/edit`}
                            title="Edit User"
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              bg-slate-900
                              text-white
                              transition
                              hover:bg-slate-800
                            "
                          >
                            <Pencil size={16} />
                          </Link>

                        </div>

                      </div>


                      {/* Mobile */}
                      <div className="lg:hidden">

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-3">

                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={user.fullName}
                                className="
                                  h-12
                                  w-12
                                  shrink-0
                                  rounded-xl
                                  object-cover
                                "
                              />
                            ) : (
                              <div
                                className="
                                  flex
                                  h-12
                                  w-12
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-gradient-to-br
                                  from-blue-400
                                  to-blue-600
                                  text-xs
                                  font-bold
                                  text-white
                                "
                              >
                                {getInitials(user.fullName)}
                              </div>
                            )}

                            <div className="min-w-0">

                              <p className="truncate text-sm font-bold text-slate-800">
                                {user.fullName}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                @{user.username}
                              </p>

                            </div>

                          </div>


                          <span
                            className={`
                              inline-flex
                              shrink-0
                              items-center
                              gap-1.5
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${
                                user.active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }
                            `}
                          >

                            <span
                              className={`
                                h-1.5
                                w-1.5
                                rounded-full
                                ${
                                  user.active
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }
                              `}
                            />

                            {user.active
                              ? "Active"
                              : "Inactive"}

                          </span>

                        </div>


                        <div className="mt-4 grid grid-cols-2 gap-3">

                          <div>
                            <p className="text-xs text-slate-400">
                              Role
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {user.role}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Phone
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {user.phone || "-"}
                            </p>
                          </div>

                          <div className="col-span-2">
                            <p className="text-xs text-slate-400">
                              Email
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                              {user.email || "-"}
                            </p>
                          </div>

                        </div>


                        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">

                          <Link
                            to={`/users/${user.id}`}
                            className="
                              flex
                              flex-1
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              px-3
                              py-2.5
                              text-sm
                              font-semibold
                              text-slate-700
                              hover:bg-blue-50
                              hover:text-blue-600
                            "
                          >
                            <Eye size={16} />
                            View
                          </Link>

                          <Link
                            to={`/users/${user.id}/edit`}
                            className="
                              flex
                              flex-1
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              bg-slate-900
                              px-3
                              py-2.5
                              text-sm
                              font-semibold
                              text-white
                              hover:bg-slate-800
                            "
                          >
                            <Pencil size={16} />
                            Edit
                          </Link>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}