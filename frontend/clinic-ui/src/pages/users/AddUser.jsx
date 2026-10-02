import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  UserPlus,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Camera,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AddUser() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    roleId: "",
    active: true,
  });

  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);

      const response = await api.get("/roles");

setRoles(response.data);
    } catch (err) {
      console.error(err);
      setError("Imeshindikana kupata roles.");
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setProfilePhoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.fullName.trim()) {
      setError("Full Name inahitajika.");
      return;
    }

    if (!formData.username.trim()) {
      setError("Username inahitajika.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email inahitajika.");
      return;
    }

    if (!formData.password.trim()) {
      setError("Password inahitajika.");
      return;
    }

    if (!formData.roleId) {
      setError("Tafadhali chagua role.");
      return;
    }

    try {
      setSaving(true);

      const userResponse = await api.post("/users", {
  fullName: formData.fullName,
  username: formData.username,
  email: formData.email,
  password: formData.password,
  phone: formData.phone,
  roleId: Number(formData.roleId),
  active: formData.active,
});

      const createdUser = userResponse.data;

      // Upload profile photo baada ya user kutengenezwa
      if (profilePhoto && createdUser?.id) {
        const photoData = new FormData();
        photoData.append("file", profilePhoto);

        await api.post(
  `/users/${createdUser.id}/profile-photo`,
  photoData
);
      }

      alert("User ameongezwa kwa mafanikio.");

      navigate("/users");
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Imeshindikana kuongeza user.";

      setError(
        typeof message === "string"
          ? message
          : "Imeshindikana kuongeza user."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to="/users"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Add User
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Ongeza mtumiaji mpya kwenye mfumo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Profile Photo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                Profile Photo
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Weka picha ya profile ya mtumiaji.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50">
                {profilePhoto ? (
                  <img
                    src={URL.createObjectURL(profilePhoto)}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-slate-300" />
                )}
              </div>

              <label className="mt-5 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <Camera size={17} />
                Choose Photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              <p className="mt-3 text-center text-xs text-slate-400">
                JPG, PNG au JPEG
              </p>
            </div>
          </div>

          {/* User Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-800">
                User Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ingiza taarifa za msingi za mtumiaji.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Mfano: Naa Mussa Haji"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Username <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <UserPlus
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Mfano: naa"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Mfano: user@clinic.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+255..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Weka password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Role <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <ShieldCheck
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    disabled={loadingRoles}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {loadingRoles
                        ? "Loading roles..."
                        : "Chagua role"}
                    </option>

                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Account Status
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    User akiwa active ataweza ku-login kwenye mfumo.
                  </p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="peer sr-only"
                  />

                  <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/users"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />

            {saving ? "Saving..." : "Save User"}
          </button>
        </div>
      </form>
    </div>
  );
}