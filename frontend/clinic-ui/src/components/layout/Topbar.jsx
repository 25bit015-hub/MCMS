import { useEffect, useRef, useState } from "react";

import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  LogOut,
  Settings,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

export default function Topbar() {
  const [openProfile, setOpenProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const profileRef = useRef(null);
  const navigate = useNavigate();

  // =========================================
  // LOAD CURRENT LOGGED-IN USER
  // =========================================
  useEffect(() => {
    loadCurrentUser();

    // Update user data if another part of the app
    // changes clinic_user.
    const handleStorageChange = () => {
      loadCurrentUser();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  function loadCurrentUser() {
    try {
      const savedUser =
        localStorage.getItem("clinic_user");

      if (!savedUser) {
        setCurrentUser(null);
        return;
      }

      const user = JSON.parse(savedUser);

      setCurrentUser(user);
    } catch (error) {
      console.error(
        "Failed to load current user:",
        error
      );

      setCurrentUser(null);
    }
  }

  // =========================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setOpenProfile(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================================
  // LOGOUT
  // =========================================
  const handleLogout = () => {
    localStorage.removeItem("clinic_token");
    localStorage.removeItem("clinic_user");

    setCurrentUser(null);
    setOpenProfile(false);

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================
  // USER DISPLAY DATA
  // =========================================
  const fullName =
    currentUser?.fullName ||
    currentUser?.username ||
    "User";

  const roleLabel = formatRole(
    currentUser?.role
  );

  const initials = getInitials(fullName);

  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-7">

        {/* =========================
            LEFT SIDE
        ========================== */}
        <div className="flex items-center gap-4">

          {/* Menu Button */}
          <button
            type="button"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              shadow-sm
              transition-all
              duration-200
              hover:bg-slate-50
              hover:text-blue-600
            "
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative hidden md:block">
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
              placeholder="Search patient by name, ID or phone..."
              className="
                h-11
                w-[430px]
                rounded-xl
                border
                border-slate-200
                bg-white/90
                pl-11
                pr-4
                text-sm
                text-slate-700
                outline-none
                transition-all
                duration-200
                placeholder:text-slate-400
                focus:border-blue-400
                focus:ring-4
                focus:ring-blue-500/10
              "
            />
          </div>
        </div>

        {/* =========================
            RIGHT SIDE
        ========================== */}
        <div className="flex items-center gap-5">

          {/* Notification */}
          <button
            type="button"
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-slate-600
              transition-all
              duration-200
              hover:bg-slate-100
              hover:text-blue-600
            "
          >
            <Bell size={20} />

            <span
              className="
                absolute
                right-2
                top-1.5
                h-2
                w-2
                rounded-full
                bg-red-500
                ring-2
                ring-white
              "
            />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200" />

          {/* =========================
              USER PROFILE BUTTON
          ========================== */}
          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setOpenProfile((prev) => !prev)
              }
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-2
                py-1.5
                transition-all
                duration-200
                hover:bg-slate-100
              "
            >

              {/* Avatar */}
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-blue-400
                  to-blue-600
                  text-sm
                  font-bold
                  text-white
                  shadow-md
                  shadow-blue-500/20
                "
              >
                {initials}
              </div>

              {/* User Info */}
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-slate-800">
                  {fullName}
                </p>

                <p className="text-xs text-slate-500">
                  {roleLabel || "User"}
                </p>
              </div>

              {/* Chevron */}
              <ChevronDown
                size={16}
                className={`
                  text-slate-500
                  transition-transform
                  duration-200
                  ${
                    openProfile
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* =========================
                PROFILE DROPDOWN
            ========================== */}
            {openProfile && (
              <div
                className="
                  absolute
                  right-0
                  top-[58px]
                  w-60
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200/80
                  bg-white/95
                  shadow-[0_20px_50px_rgba(15,23,42,0.15)]
                  backdrop-blur-xl
                "
              >

                {/* User Header */}
                <div
                  className="
                    border-b
                    border-slate-100
                    px-4
                    py-4
                  "
                >
                  <div className="flex items-center gap-3">

                    {/* Avatar */}
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        bg-gradient-to-br
                        from-blue-400
                        to-blue-600
                        text-sm
                        font-bold
                        text-white
                        shadow-md
                        shadow-blue-500/20
                      "
                    >
                      {initials}
                    </div>

                    {/* Name */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {fullName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {roleLabel || "User"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dropdown Items */}
                <div className="p-2">

                  {/* PROFILE */}
                  <Link
                    to="/profile"
                    onClick={() =>
                      setOpenProfile(false)
                    }
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-semibold
                      text-slate-700
                      transition-all
                      duration-200
                      hover:bg-blue-50
                      hover:text-blue-600
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        bg-blue-50
                      "
                    >
                      <User
                        size={18}
                        className="text-blue-600"
                      />
                    </div>

                    <span>
                      Profile
                    </span>
                  </Link>

                  {/* SETTINGS */}
                  <Link
                    to="/settings"
                    onClick={() =>
                      setOpenProfile(false)
                    }
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-semibold
                      text-slate-700
                      transition-all
                      duration-200
                      hover:bg-slate-50
                      hover:text-slate-900
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        bg-slate-100
                      "
                    >
                      <Settings
                        size={18}
                        className="text-slate-600"
                      />
                    </div>

                    <span>
                      Settings
                    </span>
                  </Link>

                  {/* Divider */}
                  <div className="my-2 border-t border-slate-100" />

                  {/* LOGOUT */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-left
                      text-sm
                      font-semibold
                      text-red-600
                      transition-all
                      duration-200
                      hover:bg-red-50
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        bg-red-50
                      "
                    >
                      <LogOut size={18} />
                    </div>

                    <span>
                      Logout
                    </span>
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


/* =================================
   HELPERS
================================= */

function getInitials(name) {
  const parts = String(name || "")
    .trim()
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