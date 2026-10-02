import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  ShieldCheck,
  Palette,
  Globe,
  Lock,
  Mail,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentAlerts: true,
    systemAlerts: true,
    twoFactor: false,
    compactMode: false,
    language: "English",
    timezone: "Africa/Dar_es_Salaam",
  });

  const handleToggle = (name) => {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));

    setSaved(false);
  };

  const handleChange = (e) => {
    setSettings((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-8">

      {/* =========================
          PAGE HEADER
      ========================== */}
      <div>
        <p className="text-sm font-medium text-blue-600">
          System
        </p>

        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-800">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account and system preferences.
        </p>
      </div>

      {/* =========================
          SETTINGS GRID
      ========================== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* =========================
            NOTIFICATIONS
        ========================== */}
        <SettingsCard
          icon={Bell}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          title="Notifications"
          description="Manage how you receive notifications."
        >
          <ToggleRow
            icon={Mail}
            title="Email Notifications"
            description="Receive important updates by email."
            enabled={settings.emailNotifications}
            onClick={() =>
              handleToggle("emailNotifications")
            }
          />

          <ToggleRow
            icon={Smartphone}
            title="SMS Notifications"
            description="Receive notifications through SMS."
            enabled={settings.smsNotifications}
            onClick={() =>
              handleToggle("smsNotifications")
            }
          />

          <ToggleRow
            icon={Bell}
            title="Appointment Alerts"
            description="Get notified about upcoming appointments."
            enabled={settings.appointmentAlerts}
            onClick={() =>
              handleToggle("appointmentAlerts")
            }
          />

          <ToggleRow
            icon={ShieldCheck}
            title="System Alerts"
            description="Receive important system notifications."
            enabled={settings.systemAlerts}
            onClick={() =>
              handleToggle("systemAlerts")
            }
          />
        </SettingsCard>

        {/* =========================
            SECURITY
        ========================== */}
        <SettingsCard
          icon={ShieldCheck}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          title="Security"
          description="Protect your account and manage security."
        >
          <ToggleRow
            icon={ShieldCheck}
            title="Two-Factor Authentication"
            description="Add an extra layer of account security."
            enabled={settings.twoFactor}
            onClick={() =>
              handleToggle("twoFactor")
            }
          />

          <button
            type="button"
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              text-left
              transition
              hover:border-purple-200
              hover:bg-purple-50/40
            "
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Lock
                  size={18}
                  className="text-slate-600"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700">
                  Change Password
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Update your account password
                </p>
              </div>
            </div>

            <span className="text-lg text-slate-400">
              →
            </span>
          </button>
        </SettingsCard>

        {/* =========================
            SYSTEM PREFERENCES
        ========================== */}
        <SettingsCard
          icon={SettingsIcon}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          title="System Preferences"
          description="Customize your system experience."
        >
          {/* Language */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <Globe
                  size={18}
                  className="text-emerald-600"
                />
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-slate-700">
                  Language
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Select system language
                </p>
              </div>

              <select
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  focus:border-emerald-400
                  focus:ring-4
                  focus:ring-emerald-500/10
                "
              >
                <option value="English">
                  English
                </option>

                <option value="Swahili">
                  Swahili
                </option>
              </select>
            </div>
          </div>

          {/* Timezone */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Globe
                  size={18}
                  className="text-blue-600"
                />
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-slate-700">
                  Timezone
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Select your timezone
                </p>
              </div>

              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="
                  max-w-[180px]
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  focus:border-blue-400
                  focus:ring-4
                  focus:ring-blue-500/10
                "
              >
                <option value="Africa/Dar_es_Salaam">
                  East Africa Time
                </option>

                <option value="Africa/Nairobi">
                  Nairobi Time
                </option>

                <option value="Africa/Kampala">
                  Kampala Time
                </option>
              </select>
            </div>
          </div>

          {/* Compact Mode */}
          <ToggleRow
            icon={SettingsIcon}
            title="Compact Mode"
            description="Use a more compact interface."
            enabled={settings.compactMode}
            onClick={() =>
              handleToggle("compactMode")
            }
          />
        </SettingsCard>

        {/* =========================
            APPEARANCE
        ========================== */}
        <SettingsCard
          icon={Palette}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          title="Appearance"
          description="Customize the look and feel of the system."
        >
          <div className="grid grid-cols-2 gap-4">

            {/* Light */}
            <button
              type="button"
              className="
                group
                rounded-2xl
                border-2
                border-blue-500
                bg-white
                p-3
                text-left
                shadow-sm
                transition
                hover:-translate-y-0.5
              "
            >
              <div className="h-24 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex gap-2">
                  <div className="h-16 w-4 rounded-md bg-slate-300" />

                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded bg-slate-300" />
                    <div className="h-3 w-full rounded bg-white" />
                    <div className="h-3 w-4/5 rounded bg-white" />
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm font-bold text-slate-700">
                Light
              </p>
            </button>

            {/* Dark */}
            <button
              type="button"
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-3
                text-left
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:border-slate-300
              "
            >
              <div className="h-24 rounded-xl bg-slate-800 p-3">
                <div className="flex gap-2">
                  <div className="h-16 w-4 rounded-md bg-slate-600" />

                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded bg-slate-600" />
                    <div className="h-3 w-full rounded bg-slate-700" />
                    <div className="h-3 w-4/5 rounded bg-slate-700" />
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm font-bold text-slate-700">
                Dark
              </p>
            </button>

          </div>
        </SettingsCard>

      </div>

      {/* =========================
          SAVE BUTTON
      ========================== */}
      <div className="flex items-center justify-end gap-4">

        {saved && (
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <CheckCircle2 size={18} />
            Changes saved
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-blue-600
            to-blue-500
            px-6
            py-3
            text-sm
            font-bold
            text-white
            shadow-lg
            shadow-blue-500/20
            transition
            hover:-translate-y-0.5
            hover:shadow-xl
          "
        >
          <CheckCircle2 size={18} />
          Save Changes
        </button>

      </div>

    </div>
  );
}


/* =================================
   SETTINGS CARD
================================= */

function SettingsCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  children,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/70 shadow-[0_10px_35px_rgba(30,64,175,0.08)] backdrop-blur-xl">

      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">

          <div
            className={`
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              ${iconBg}
            `}
          >
            <Icon
              size={20}
              className={iconColor}
            />
          </div>

          <div>
            <h3 className="font-bold text-slate-800">
              {title}
            </h3>

            <p className="text-xs text-slate-400">
              {description}
            </p>
          </div>

        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 p-6">
        {children}
      </div>

    </div>
  );
}


/* =================================
   TOGGLE ROW
================================= */

function ToggleRow({
  icon: Icon,
  title,
  description,
  enabled,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        justify-between
        rounded-2xl
        border
        border-slate-100
        bg-white
        p-4
        text-left
        transition
        hover:bg-slate-50
      "
    >
      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon
            size={18}
            className="text-slate-600"
          />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-700">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        </div>

      </div>

      {/* Toggle */}
      <div
        className={`
          relative
          h-6
          w-11
          rounded-full
          transition
          duration-200
          ${
            enabled
              ? "bg-blue-600"
              : "bg-slate-200"
          }
        `}
      >
        <span
          className={`
            absolute
            top-1
            h-4
            w-4
            rounded-full
            bg-white
            shadow-sm
            transition
            duration-200
            ${
              enabled
                ? "left-6"
                : "left-1"
            }
          `}
        />
      </div>
    </button>
  );
}