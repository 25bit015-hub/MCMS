import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Camera,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [userResponse, rolesResponse] = await Promise.all([
        axios.get(`http://localhost:8080/api/users/${id}`),
        axios.get("http://localhost:8080/api/roles"),
      ]);

      const user = userResponse.data;

      setFormData({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        password: "",
        phone: user.phone || "",
        roleId: user.roleId ? String(user.roleId) : "",
        active: user.active,
      });

      setRoles(rolesResponse.data);

      if (user.profilePhoto) {
        if (user.profilePhoto.startsWith("http")) {
          setCurrentPhoto(user.profilePhoto);
        } else {
          setCurrentPhoto(
            `http://localhost:8080${user.profilePhoto}`
          );
        }
      } else {
        setCurrentPhoto(null);
      }
    } catch (err) {
      console.error(err);
      setError("Imeshindikana kupata taarifa za user.");
    } finally {
      setLoading(false);
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

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Tafadhali chagua picha halali.");
      return;
    }

    setError("");

    setNewPhoto(file);

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
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

    if (!formData.roleId) {
      setError("Tafadhali chagua role.");
      return;
    }

    try {
      setSaving(true);

      // 1. Update taarifa za user
      await axios.put(
        `http://localhost:8080/api/users/${id}`,
        {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          roleId: Number(formData.roleId),
          active: formData.active,
        }
      );

      // 2. Upload picha mpya kama user amechagua
      if (newPhoto) {
        const photoData = new FormData();
        photoData.append("file", newPhoto);

        await axios.post(
          `http://localhost:8080/api/users/${id}/profile-photo`,
          photoData
        );
      }

      alert("Taarifa za user zimebadilishwa kwa mafanikio.");

      navigate(`/users/${id}`);
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Imeshindikana kubadilisha taarifa za user.";

      setError(
        typeof message === "string"
          ? message
          : "Imeshindikana kubadilisha taarifa za user."
      );
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to={`/users/${id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={17} />
          Back to User Profile
        </Link>

        <h1 className="text-2xl font-bold text-slate-800">
          Edit User
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Badilisha taarifa za mtumiaji kwenye mfumo.
        </p>
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
                Badilisha picha ya profile ya mtumiaji.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-100 bg-slate-50">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="New profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt={formData.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-blue-600">
                    {getInitials(formData.fullName)}
                  </span>
                )}
              </div>

              <label className="mt-5 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <Camera size={17} />
                Change Photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {newPhoto && (
                <p className="mt-3 max-w-full truncate text-xs font-medium text-blue-600">
                  {newPhoto.name}
                </p>
              )}

              <p className="mt-2 text-center text-xs text-slate-400">
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
                Sasisha taarifa za msingi za mtumiaji.
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
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  New Password
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
                    placeholder="Acha wazi kama hutaki kubadilisha"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Jaza tu kama unataka kubadilisha password.
                </p>
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
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  >
                    <option value="">Chagua role</option>

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
                    User akiwa inactive hataweza ku-login kwenye mfumo.
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
            to={`/users/${id}`}
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

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}