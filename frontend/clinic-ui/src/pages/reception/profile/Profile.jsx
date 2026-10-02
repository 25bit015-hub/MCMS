import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  BriefcaseBusiness,
  ShieldCheck,
  CalendarDays,
  MapPin,
  Pencil,
  Lock,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import api from "../../../services/api";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // CHANGE PASSWORD STATES
  // =========================

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // =========================
  // PROFILE DATA
  // =========================

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    location: "",
    username: "",
    userId: "",
    profilePhoto: "",
    active: false,
    createdAt: "",
  });

  // =========================
  // LOAD CURRENT USER
  // =========================

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      setLoading(true);
      setError("");

      const savedUser = localStorage.getItem("clinic_user");

      if (!savedUser) {
        setError("Hakuna user aliyeingia kwenye mfumo.");
        setLoading(false);
        return;
      }

      const loggedInUser = JSON.parse(savedUser);

      const response = await api.get("/users/me");

      const user = response.data;

      const fullName = String(user.fullName || "").trim();

      const nameParts = fullName
        .split(/\s+/)
        .filter(Boolean);

      setFormData({
        firstName: nameParts[0] || "",

        middleName:
          nameParts.length > 2
            ? nameParts.slice(1, -1).join(" ")
            : "",

        lastName:
          nameParts.length > 1
            ? nameParts[nameParts.length - 1]
            : "",

        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        department: user.role || "",
        location: loggedInUser.location || "",
        username: user.username || "",
        userId: user.id || "",
        profilePhoto: user.profilePhoto || "",
        active: user.active,
        createdAt: user.createdAt || "",
      });

      // Update localStorage
      const updatedLocalUser = {
        ...loggedInUser,
        userId: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto,
        roleId: user.roleId,
      };

      localStorage.setItem(
        "clinic_user",
        JSON.stringify(updatedLocalUser)
      );

    } catch (error) {
      console.error("Failed to load profile:", error);

      if (error.response?.status === 404) {
        setError("User huyu hakupatikana kwenye database.");
      } else if (error.response?.status === 403) {
        setError("Huna ruhusa ya kuona profile hii.");
      } else {
        setError(
          error.response?.data?.message ||
          "Imeshindikana kupata taarifa za profile."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // PROFILE FIELD CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // SAVE PROFILE
  // =========================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      if (!formData.userId) {
        setError("User ID haipatikani.");
        return;
      }

      const fullName = [
        formData.firstName,
        formData.middleName,
        formData.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (!fullName) {
        setError("Jina la user linahitajika.");
        return;
      }

      const savedUser = localStorage.getItem("clinic_user");

      const currentUser = savedUser
        ? JSON.parse(savedUser)
        : {};

      /*
       * Tunatumia roleId iliyopo kwenye localStorage.
       * Kama haipo, tunachukua kutoka backend.
       */

      let roleId = getRoleIdFromLocalUser(currentUser);

      if (!roleId) {
        const currentUserResponse =
          await api.get("/users/me");

        roleId = currentUserResponse.data.roleId;
      }

      const payload = {
        fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        roleId,
        active: formData.active,
      };

      const response = await api.put(
        "/users/me",
        payload
      );

      const updatedUser = response.data;

      const updatedLocalUser = {
        ...currentUser,
        userId: updatedUser.id,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        roleId: updatedUser.roleId,
        profilePhoto: updatedUser.profilePhoto,
      };

      localStorage.setItem(
        "clinic_user",
        JSON.stringify(updatedLocalUser)
      );

      const updatedFullName =
        String(updatedUser.fullName || "").trim();

      const nameParts = updatedFullName
        .split(/\s+/)
        .filter(Boolean);

      setFormData((previous) => ({
        ...previous,

        firstName: nameParts[0] || "",

        middleName:
          nameParts.length > 2
            ? nameParts.slice(1, -1).join(" ")
            : "",

        lastName:
          nameParts.length > 1
            ? nameParts[nameParts.length - 1]
            : "",

        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        role: updatedUser.role || "",
        department: updatedUser.role || "",
        username: updatedUser.username || "",
        userId: updatedUser.id || "",
        profilePhoto: updatedUser.profilePhoto || "",
        active: updatedUser.active,
        createdAt: updatedUser.createdAt || "",
      }));

      setEditing(false);

      alert("Profile imehifadhiwa kwa mafanikio.");

    } catch (error) {
      console.error("Failed to save profile:", error);

      setError(
        error.response?.data?.message ||
        error.response?.data ||
        "Imeshindikana kuhifadhi profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // OPEN PASSWORD MODAL
  // =========================

  const openPasswordModal = () => {
    setPasswordError("");
    setPasswordSuccess("");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setShowPasswordModal(true);
  };

  // =========================
  // CLOSE PASSWORD MODAL
  // =========================

  const closePasswordModal = () => {
    if (changingPassword) {
      return;
    }

    setShowPasswordModal(false);

    setPasswordError("");
    setPasswordSuccess("");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // =========================
  // PASSWORD INPUT CHANGE
  // =========================

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });

    setPasswordError("");
    setPasswordSuccess("");
  };

  // =========================
  // CHANGE PASSWORD
  // =========================

  const handleChangePassword = async () => {
    try {
      setPasswordError("");
      setPasswordSuccess("");

      if (!passwordData.currentPassword) {
        setPasswordError(
          "Current password inahitajika."
        );
        return;
      }

      if (!passwordData.newPassword) {
        setPasswordError(
          "New password inahitajika."
        );
        return;
      }

      if (!passwordData.confirmPassword) {
        setPasswordError(
          "Confirm password inahitajika."
        );
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordError(
          "Password mpya lazima iwe na angalau characters 6."
        );
        return;
      }

      if (
        passwordData.newPassword !==
        passwordData.confirmPassword
      ) {
        setPasswordError(
          "New password na Confirm password hazifanani."
        );
        return;
      }

      setChangingPassword(true);

      await api.put(
        "/users/me/password",
        {
          currentPassword:
            passwordData.currentPassword,

          newPassword:
            passwordData.newPassword,

          confirmPassword:
            passwordData.confirmPassword,
        }
      );

      setPasswordSuccess(
        "Password imebadilishwa kwa mafanikio."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 1500);

    } catch (error) {
      console.error(
        "Failed to change password:",
        error
      );

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data;

      setPasswordError(
        typeof backendMessage === "string"
          ? backendMessage
          : "Imeshindikana kubadilisha password."
      );

    } finally {
      setChangingPassword(false);
    }
  };

  // =========================
  // DISPLAY DATA
  // =========================

  const fullName = [
    formData.firstName,
    formData.middleName,
    formData.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const initials = getInitials(fullName);

  const roleLabel = formatRole(formData.role);

  const memberSince = formatMemberSince(
    formData.createdAt
  );

  const profilePhotoUrl = getProfilePhotoUrl(
    formData.profilePhoto
  );

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">

          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-blue-100
              border-t-blue-600
            "
          />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading profile...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* =================================
          PAGE HEADER
      ================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <p className="text-sm font-medium text-blue-600">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-800">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your account information and preferences.
          </p>

        </div>

        <div className="flex items-center gap-3">

          {editing ? (
            <>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setEditing(false);
                  loadCurrentUser();
                }}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-600
                  shadow-sm
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-blue-600
                  to-blue-500
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-500/20
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <CheckCircle2 size={17} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setError("");
                setEditing(true);
              }}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-blue-500
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-blue-500/20
                transition
                hover:-translate-y-0.5
                hover:shadow-xl
              "
            >
              <Pencil size={17} />

              Edit Profile
            </button>
          )}

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* =================================
          PROFILE HERO
      ================================== */}

      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/70 shadow-[0_10px_35px_rgba(30,64,175,0.08)] backdrop-blur-xl">

        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative p-7 md:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            {/* USER */}

            <div className="flex items-center gap-5">

              {/* AVATAR */}

              <div className="relative">

                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={fullName || "Profile"}
                    className="
                      h-24
                      w-24
                      rounded-3xl
                      object-cover
                      shadow-xl
                      shadow-blue-500/20
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-3xl
                      bg-gradient-to-br
                      from-blue-400
                      to-blue-600
                      text-3xl
                      font-extrabold
                      text-white
                      shadow-xl
                      shadow-blue-500/20
                    "
                  >
                    {initials}
                  </div>
                )}

                <button
                  type="button"
                  className="
                    absolute
                    -bottom-2
                    -right-2
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border-4
                    border-white
                    bg-slate-800
                    text-white
                    shadow-lg
                    transition
                    hover:bg-blue-600
                  "
                >
                  <Camera size={15} />
                </button>

              </div>

              {/* NAME */}

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-2xl font-extrabold text-slate-800">
                    {fullName || "Current User"}
                  </h2>

                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-bold
                      ${
                        formData.active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }
                    `}
                  >

                    <span
                      className={`
                        h-1.5
                        w-1.5
                        rounded-full
                        ${
                          formData.active
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }
                      `}
                    />

                    {formData.active
                      ? "Active"
                      : "Inactive"}

                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {roleLabel}
                </p>

                <p className="mt-2 text-xs font-medium text-slate-400">
                  Username: {formData.username || "—"}
                </p>

              </div>

            </div>

            {/* ROLE BADGE */}

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-blue-100
                bg-blue-50/70
                px-5
                py-4
              "
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">

                <ShieldCheck
                  size={20}
                  className="text-blue-600"
                />

              </div>

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Role
                </p>

                <p className="text-sm font-bold text-slate-700">
                  {roleLabel || "—"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =================================
          CONTENT GRID
      ================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* PERSONAL INFORMATION */}

        <div className="xl:col-span-2">

          <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/70 shadow-[0_10px_35px_rgba(30,64,175,0.08)] backdrop-blur-xl">

            <div className="border-b border-slate-100 px-7 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                  <User
                    size={20}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <h3 className="font-bold text-slate-800">
                    Personal Information
                  </h3>

                  <p className="text-xs text-slate-400">
                    Your personal account information
                  </p>

                </div>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-5 p-7 md:grid-cols-3">

              <ProfileField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                editing={editing}
                onChange={handleChange}
              />

              <ProfileField
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                editing={editing}
                onChange={handleChange}
              />

              <ProfileField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                editing={editing}
                onChange={handleChange}
              />

              <ProfileField
                label="Email Address"
                name="email"
                value={formData.email}
                editing={editing}
                onChange={handleChange}
                icon={Mail}
                type="email"
              />

              <ProfileField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                editing={editing}
                onChange={handleChange}
                icon={Phone}
              />

              <ProfileField
                label="Department"
                name="department"
                value={roleLabel}
                editing={false}
                onChange={handleChange}
                icon={BriefcaseBusiness}
              />

              <ProfileField
                label="Location"
                name="location"
                value={formData.location}
                editing={editing}
                onChange={handleChange}
                icon={MapPin}
              />

              <ProfileField
                label="Username"
                name="username"
                value={formData.username}
                editing={false}
                onChange={handleChange}
              />

              <ProfileField
                label="User ID"
                name="userId"
                value={formData.userId}
                editing={false}
                onChange={handleChange}
              />

            </div>

          </div>

        </div>

        {/* ACCOUNT INFORMATION */}

        <div className="space-y-6">

          {/* ACCOUNT STATUS */}

          <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_10px_35px_rgba(30,64,175,0.08)] backdrop-blur-xl">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">

                <CheckCircle2
                  size={20}
                  className={
                    formData.active
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                />

              </div>

              <div>

                <h3 className="font-bold text-slate-800">
                  Account Status
                </h3>

                <p className="text-xs text-slate-400">
                  Current account state
                </p>

              </div>

            </div>

            <div
              className={`
                mt-6
                rounded-2xl
                p-4
                ${
                  formData.active
                    ? "bg-emerald-50/80"
                    : "bg-red-50/80"
                }
              `}
            >

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">

                  <CheckCircle2
                    size={19}
                    className={
                      formData.active
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  />

                </div>

                <div>

                  <p
                    className={`
                      text-sm
                      font-bold
                      ${
                        formData.active
                          ? "text-emerald-700"
                          : "text-red-700"
                      }
                    `}
                  >
                    {formData.active
                      ? "Active Account"
                      : "Inactive Account"}
                  </p>

                  <p
                    className={`
                      mt-0.5
                      text-xs
                      ${
                        formData.active
                          ? "text-emerald-600/70"
                          : "text-red-600/70"
                      }
                    `}
                  >
                    {formData.active
                      ? "Your account is active"
                      : "Your account is inactive"}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* SECURITY */}

          <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_10px_35px_rgba(30,64,175,0.08)] backdrop-blur-xl">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">

                <Lock
                  size={20}
                  className="text-purple-600"
                />

              </div>

              <div>

                <h3 className="font-bold text-slate-800">
                  Security
                </h3>

                <p className="text-xs text-slate-400">
                  Manage account security
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={openPasswordModal}
              className="
                mt-5
                flex
                w-full
                items-center
                justify-between
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                py-3.5
                text-left
                transition
                hover:border-purple-200
                hover:bg-purple-50/40
              "
            >

              <div className="flex items-center gap-3">

                <Lock
                  size={17}
                  className="text-slate-500"
                />

                <span className="text-sm font-semibold text-slate-700">
                  Change Password
                </span>

              </div>

              <span className="text-slate-400">
                →
              </span>

            </button>

          </div>

          {/* MEMBER SINCE */}

          <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_10px_35px_rgba(30,64,175,0.08)] backdrop-blur-xl">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">

                <CalendarDays
                  size={20}
                  className="text-orange-600"
                />

              </div>

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Member Since
                </p>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  {memberSince}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =================================
          CHANGE PASSWORD MODAL
      ================================== */}

      {showPasswordModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-900/50
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closePasswordModal();
            }
          }}
        >

          <div
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-3xl
              border
              border-white/80
              bg-white
              shadow-2xl
            "
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">

                  <Lock
                    size={20}
                    className="text-purple-600"
                  />

                </div>

                <div>

                  <h3 className="font-bold text-slate-800">
                    Change Password
                  </h3>

                  <p className="text-xs text-slate-400">
                    Update your account password
                  </p>

                </div>

              </div>

              <button
                type="button"
                disabled={changingPassword}
                onClick={closePasswordModal}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <X size={19} />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="space-y-5 p-6">

              {/* ERROR */}

              {passwordError && (
                <div
                  className="
                    rounded-2xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-red-600
                  "
                >
                  {passwordError}
                </div>
              )}

              {/* SUCCESS */}

              {passwordSuccess && (
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-emerald-200
                    bg-emerald-50
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-emerald-600
                  "
                >
                  <CheckCircle2 size={18} />

                  {passwordSuccess}
                </div>
              )}

              {/* CURRENT PASSWORD */}

              <PasswordField
                label="Current Password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                visible={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword(
                    !showCurrentPassword
                  )
                }
                disabled={changingPassword}
              />

              {/* NEW PASSWORD */}

              <PasswordField
                label="New Password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                visible={showNewPassword}
                onToggle={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }
                disabled={changingPassword}
              />

              {/* CONFIRM PASSWORD */}

              <PasswordField
                label="Confirm New Password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                visible={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                disabled={changingPassword}
              />

              <p className="text-xs text-slate-400">
                Password mpya lazima iwe na angalau
                characters 6.
              </p>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">

              <button
                type="button"
                disabled={changingPassword}
                onClick={closePasswordModal}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-slate-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={changingPassword}
                onClick={handleChangePassword}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-purple-600
                  to-purple-500
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-purple-500/20
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <Lock size={16} />

                {changingPassword
                  ? "Changing..."
                  : "Change Password"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =================================
   REUSABLE PROFILE FIELD
================================= */

function ProfileField({
  label,
  name,
  value,
  editing,
  onChange,
  icon: Icon,
  type = "text",
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </label>

      {editing ? (
        <div className="relative">

          {Icon && (
            <Icon
              size={17}
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />
          )}

          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              ${Icon ? "pl-10" : "px-4"}
              pr-4
              text-sm
              font-medium
              text-slate-700
              outline-none
              transition
              focus:border-blue-400
              focus:ring-4
              focus:ring-blue-500/10
            `}
          />

        </div>
      ) : (
        <div className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4">

          {Icon && (
            <Icon
              size={17}
              className="shrink-0 text-slate-400"
            />
          )}

          <span className="text-sm font-semibold text-slate-700">
            {value || "—"}
          </span>

        </div>
      )}

    </div>
  );
}

/* =================================
   PASSWORD FIELD
================================= */

function PasswordField({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </label>

      <div className="relative">

        <Lock
          size={17}
          className="
            absolute
            left-3.5
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
        />

        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete="new-password"
          className="
            h-11
            w-full
            rounded-xl
            border
            border-slate-200
            bg-white
            pl-10
            pr-12
            text-sm
            font-medium
            text-slate-700
            outline-none
            transition
            focus:border-purple-400
            focus:ring-4
            focus:ring-purple-500/10
            disabled:cursor-not-allowed
            disabled:bg-slate-50
          "
        />

        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          className="
            absolute
            right-3
            top-1/2
            flex
            -translate-y-1/2
            items-center
            justify-center
            text-slate-400
            transition
            hover:text-purple-600
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {visible ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>

      </div>

    </div>
  );
}

/* =================================
   HELPERS
================================= */

function getInitials(name) {
  const parts = String(name || "")
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`
    .toUpperCase();
}

function formatRole(role) {
  const value = String(role || "")
    .replace(/^ROLE_/i, "")
    .trim();

  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function formatMemberSince(createdAt) {
  if (!createdAt) {
    return "—";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function getRoleIdFromLocalUser(user) {
  return (
    user?.roleId ||
    user?.roleID ||
    user?.role_id ||
    null
  );
}

function getProfilePhotoUrl(profilePhoto) {
  if (!profilePhoto) {
    return "";
  }

  if (
    profilePhoto.startsWith("http://") ||
    profilePhoto.startsWith("https://")
  ) {
    return profilePhoto;
  }

  return `http://localhost:8080${profilePhoto}`;
}