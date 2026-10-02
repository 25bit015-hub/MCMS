import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Pencil,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

export default function UserProfile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:8080/api/users/${id}`
      );

      setUser(response.data);
    } catch (err) {
      console.error(err);
      setError("Imeshindikana kupata taarifa za user.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name = "") => {
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const getProfilePhotoUrl = (photo) => {
    if (!photo) return null;

    if (photo.startsWith("http")) {
      return photo;
    }

    return `http://localhost:8080${photo}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm font-medium text-slate-500">
          Loading user information...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Back to Users
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-5">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Back to Users
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          User not found.
        </div>
      </div>
    );
  }

  const photoUrl = getProfilePhotoUrl(user.profilePhoto);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/users"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft size={17} />
            Back to Users
          </Link>

          <h1 className="text-2xl font-bold text-slate-800">
            User Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Taarifa kamili za mtumiaji.
          </p>
        </div>

        <Link
          to={`/users/${user.id}/edit`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Pencil size={17} />
          Edit User
        </Link>
      </div>

      {/* Profile Header */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* Profile Photo */}
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-md">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={user.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-blue-600">
                    {getInitials(user.fullName)}
                  </span>
                )}
              </div>

              <div className="pb-1">
                <h2 className="text-2xl font-bold text-slate-800">
                  {user.fullName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  @{user.username}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                <ShieldCheck size={16} />
                {user.role}
              </span>

              {user.active ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Taarifa za msingi za mtumiaji.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InfoItem
            icon={<User size={18} />}
            label="Full Name"
            value={user.fullName}
          />

          <InfoItem
            icon={<User size={18} />}
            label="Username"
            value={user.username}
          />

          <InfoItem
            icon={<Mail size={18} />}
            label="Email"
            value={user.email}
          />

          <InfoItem
            icon={<Phone size={18} />}
            label="Phone"
            value={user.phone || "-"}
          />
        </div>
      </div>

      {/* Account Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Account Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Taarifa za akaunti na mfumo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <InfoItem
            icon={<ShieldCheck size={18} />}
            label="Role"
            value={user.role}
          />

          <InfoItem
            icon={<ShieldCheck size={18} />}
            label="Account Status"
            value={user.active ? "Active" : "Inactive"}
          />

          <InfoItem
            icon={<CalendarDays size={18} />}
            label="Created Date"
            value={formatDate(user.createdAt)}
          />

          <InfoItem
            icon={<Clock3 size={18} />}
            label="Last Updated"
            value={formatDateTime(user.updatedAt)}
          />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}