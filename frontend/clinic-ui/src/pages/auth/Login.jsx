import { useState } from "react";
import {
  HeartPulse,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);

  try {
    const response = await api.post("/auth/login", {
      username: form.username,
      password: form.password,
    });

    
    const data = response.data;

console.log("LOGIN RESPONSE:", data);
console.log("LOGIN ROLE:", data.role);

    // Save JWT token
    localStorage.setItem("clinic_token", data.token);

    // Save logged-in user
    localStorage.setItem(
      "clinic_user",
      JSON.stringify({
        userId: data.userId,
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        role: data.role,
      })
    );

    // Redirect according to role
    switch (data.role) {
  case "ADMIN":
    navigate("/dashboard");
    break;

  case "RECEPTION":
    navigate("/reception");
    break;

  case "NURSE":
    navigate("/nurse");
    break;

  case "DOCTOR":
    navigate("/doctor");
    break;

  case "LABORATORY":
    navigate("/laboratory");
    break;

  case "PHARMACIST":
    navigate("/pharmacy");
    break;

  case "CASHIER":
    navigate("/billing");
    break;

  default:
    navigate("/dashboard");
}
  } catch (error) {
    console.error("Login error:", error);

    alert(
      error.response?.data?.message ||
      "Invalid username or password"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#eef5ff] p-3 sm:p-5 lg:p-7">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.15)] lg:min-h-[calc(100vh-56px)]">

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#102a52] via-[#124a83] to-[#0879a8] lg:flex lg:w-[56%]">

          {/* Background circles */}
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-300/10" />
          <div className="absolute right-20 top-20 h-32 w-32 rounded-full border border-white/10" />

          {/* Floating medical icon */}
          <div className="absolute right-20 top-24 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-cyan-100 backdrop-blur-md">
            <Activity size={25} />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-md">
                <HeartPulse size={27} className="text-white" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-wide text-white">
                  MCMS
                </h1>
                <p className="text-xs text-blue-100">
                  Clinic Management System
                </p>
              </div>
            </div>

            {/* Main content */}
            <div className="relative flex flex-1 items-center">

              <div className="max-w-xl">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-blue-50 backdrop-blur-md">
                  <ShieldCheck size={15} />
                  Secure Healthcare Platform
                </div>

                <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                  Smarter healthcare.
                  <br />
                  <span className="text-cyan-200">
                    Better patient care.
                  </span>
                </h2>

                <p className="mt-5 max-w-lg text-sm leading-7 text-blue-100 xl:text-base">
                  Manage patients, consultations, laboratory services,
                  pharmacy, billing and daily clinic operations from one
                  powerful platform.
                </p>

                {/* Doctor illustration area */}
                <div className="relative mt-8 h-[300px] xl:h-[340px]">

                  {/* Glow */}
                  <div className="absolute bottom-0 left-1/2 h-48 w-80 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />

                  {/* Laptop */}
                  <div className="absolute bottom-3 left-1/2 z-20 w-[310px] -translate-x-1/2 xl:w-[390px]">

                    {/* Screen */}
                    <div className="rounded-t-2xl border-[5px] border-slate-700 bg-slate-800 p-2 shadow-2xl">
                      <div className="overflow-hidden rounded-lg bg-white">

                        {/* Fake dashboard */}
                        <div className="flex h-8 items-center justify-between border-b border-slate-200 px-3">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-red-300" />
                            <div className="h-2 w-2 rounded-full bg-yellow-300" />
                            <div className="h-2 w-2 rounded-full bg-green-300" />
                          </div>

                          <div className="h-2 w-16 rounded bg-slate-200" />
                        </div>

                        <div className="flex h-[145px] gap-2 p-3">
                          <div className="w-16 rounded bg-slate-100 p-2">
                            <div className="mb-3 h-3 rounded bg-blue-200" />
                            <div className="mb-2 h-2 rounded bg-slate-200" />
                            <div className="mb-2 h-2 rounded bg-slate-200" />
                            <div className="mb-2 h-2 rounded bg-slate-200" />
                            <div className="h-2 rounded bg-slate-200" />
                          </div>

                          <div className="flex-1">
                            <div className="mb-3 grid grid-cols-3 gap-2">
                              <div className="h-12 rounded-lg bg-blue-50" />
                              <div className="h-12 rounded-lg bg-cyan-50" />
                              <div className="h-12 rounded-lg bg-emerald-50" />
                            </div>

                            <div className="flex h-20 items-end gap-2 rounded-lg bg-slate-50 p-3">
                              <div className="h-7 w-5 rounded-t bg-blue-300" />
                              <div className="h-11 w-5 rounded-t bg-blue-400" />
                              <div className="h-9 w-5 rounded-t bg-blue-300" />
                              <div className="h-14 w-5 rounded-t bg-blue-500" />
                              <div className="h-10 w-5 rounded-t bg-cyan-400" />
                              <div className="h-16 w-5 rounded-t bg-blue-500" />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Laptop base */}
                    <div className="relative mx-auto h-4 w-[340px] rounded-b-xl bg-slate-600 shadow-xl xl:w-[430px]">
                      <div className="absolute left-1/2 top-0 h-1 w-24 -translate-x-1/2 rounded-b bg-slate-500" />
                    </div>
                  </div>

                  {/* Doctor */}
                  <div className="absolute bottom-[65px] left-[calc(50%-180px)] z-30 xl:left-[calc(50%-220px)]">

                    {/* Head */}
                    <div className="relative mx-auto h-16 w-16 rounded-full bg-[#d99a72] shadow-lg">
                      {/* Hair */}
                      <div className="absolute -top-1 left-1 h-7 w-14 rounded-t-full bg-slate-800" />

                      {/* Face */}
                      <div className="absolute left-5 top-8 h-1.5 w-1.5 rounded-full bg-slate-700" />
                      <div className="absolute right-5 top-8 h-1.5 w-1.5 rounded-full bg-slate-700" />
                    </div>

                    {/* Body / Coat */}
                    <div className="relative mt-[-3px] h-32 w-28 rounded-t-[35px] bg-white shadow-xl">
                      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-200" />

                      {/* Stethoscope */}
                      <div className="absolute left-7 top-7 h-12 w-12 rounded-b-full border-2 border-cyan-600 border-t-0" />

                      <div className="absolute left-[50px] top-[53px] h-3 w-3 rounded-full bg-cyan-600" />

                      {/* ID badge */}
                      <div className="absolute right-3 top-9 h-5 w-7 rounded bg-blue-100" />
                    </div>

                    {/* Arm */}
                    <div className="absolute -right-8 top-20 h-7 w-14 rotate-[18deg] rounded-full bg-[#d99a72]" />
                  </div>

                  {/* Small medical card */}
                  <div className="absolute right-0 top-12 hidden rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md xl:block">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                        <Stethoscope size={19} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Doctor Dashboard
                        </p>
                        <p className="text-[10px] text-blue-100">
                          Patient care at a glance
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-blue-100">
              <span>© 2026 MCMS</span>

              <div className="flex gap-5">
                <span>Secure</span>
                <span>Reliable</span>
                <span>Professional</span>
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
        <section className="flex w-full items-center justify-center bg-white px-6 py-10 sm:px-10 lg:w-[44%] lg:px-14 xl:px-20">

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                <HeartPulse size={24} />
              </div>

              <div>
                <h1 className="font-bold text-slate-900">
                  MCMS
                </h1>
                <p className="text-xs text-slate-500">
                  Clinic Management System
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold text-blue-600">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your credentials to access the clinic management
                system.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Username or Email
                </label>

                <div className="relative">
                  <User
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter username or email"
                    autoComplete="username"
                    className="
                      h-13 w-full rounded-xl border border-slate-200
                      bg-slate-50 pl-12 pr-4 text-sm text-slate-800
                      outline-none transition-all
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:bg-white
                      focus:ring-4 focus:ring-blue-500/10
                    "
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="
                      h-13 w-full rounded-xl border border-slate-200
                      bg-slate-50 pl-12 pr-12 text-sm text-slate-800
                      outline-none transition-all
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:bg-white
                      focus:ring-4 focus:ring-blue-500/10
                    "
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="
                      absolute right-3 top-1/2 flex h-9 w-9
                      -translate-y-1/2 items-center justify-center
                      rounded-lg text-slate-400 transition
                      hover:bg-slate-100 hover:text-blue-600
                    "
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-slate-600">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  className="text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  group flex h-13 w-full items-center justify-center
                  gap-2 rounded-xl
                  bg-gradient-to-r from-blue-600 to-cyan-500
                  text-sm font-bold text-white
                  shadow-lg shadow-blue-500/20
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:shadow-xl hover:shadow-blue-500/25
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

            </form>

            {/* Security note */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs">
  <div className="relative flex h-7 w-7 items-center justify-center">
    {/* Pulsing glow */}
    <span className="absolute h-7 w-7 animate-ping rounded-full bg-green-400/30" />

    {/* Shield */}
    <ShieldCheck
      size={17}
      strokeWidth={2.2}
      className="relative z-10 text-green-500"
    />
  </div>

  <span className="font-medium text-green-600">
    Your connection is secure
  </span>
</div>

            <p className="mt-5 text-center text-xs text-slate-400">
              © 2026 Clinic Management System
            </p>

          </div>
        </section>
      </div>
    </div>
  );
}