import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Baby,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("sw-TZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateGestation(lmp) {
  if (!lmp) {
    return null;
  }

  const lmpDate = new Date(`${lmp}T00:00:00`);

  if (Number.isNaN(lmpDate.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const difference = today.getTime() - lmpDate.getTime();
  const totalDays = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  if (totalDays < 0) {
    return null;
  }

  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  return `${weeks}w ${days}d`;
}

function getStatusLabel(status) {
  if (!status) {
    return "Haijulikani";
  }

  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "Inaendelea";

    case "ARCHIVED":
      return "Imehifadhiwa";

    case "COMPLETED":
      return "Imekamilika";

    default:
      return status;
  }
}

function getStatusClasses(status) {
  if (!status) {
    return "bg-slate-100 text-slate-600 border-slate-200";
  }

  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "ARCHIVED":
      return "bg-slate-100 text-slate-600 border-slate-200";

    case "COMPLETED":
      return "bg-blue-50 text-blue-700 border-blue-200";

    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconWrapperClass,
  loading,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-slate-50 opacity-70" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <div className="mt-2 min-h-[40px]">
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
            ) : (
              <p className="text-3xl font-bold tracking-tight text-slate-900">
                {value}
              </p>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrapperClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function MaternityDashboard() {
  const [activeCount, setActiveCount] = useState(0);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [pregnancies, setPregnancies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        activeResponse,
        highRiskResponse,
        pregnanciesResponse,
      ] = await Promise.all([
        api.get("/maternity/pregnancies/dashboard/active-count"),
        api.get("/maternity/pregnancies/dashboard/high-risk-count"),
        api.get("/maternity/pregnancies"),
      ]);

      setActiveCount(Number(activeResponse.data ?? 0));
      setHighRiskCount(Number(highRiskResponse.data ?? 0));

      const pregnancyData = Array.isArray(
        pregnanciesResponse.data
      )
        ? pregnanciesResponse.data
        : [];

      setPregnancies(pregnancyData);
    } catch (err) {
      console.error("Maternity dashboard error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      setError(
        backendMessage ||
          "Imeshindikana kupata taarifa za Maternity kutoka kwenye server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const activePregnancies = useMemo(() => {
    return pregnancies.filter(
      (pregnancy) =>
        pregnancy?.status &&
        pregnancy.status.toUpperCase() === "ACTIVE"
    );
  }, [pregnancies]);

  const recentPregnancies = useMemo(() => {
    return [...activePregnancies]
      .sort((a, b) => {
        const dateA = new Date(
          a?.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b?.createdAt || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 8);
  }, [activePregnancies]);

  const filteredPregnancies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return recentPregnancies;
    }

    return recentPregnancies.filter((pregnancy) => {
      const searchableText = [
        pregnancy?.patientName,
        pregnancy?.patientNumber,
        pregnancy?.status,
        pregnancy?.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [recentPregnancies, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                <Baby className="h-7 w-7" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Maternity
                  </h1>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    ANC
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Simamia mimba, mahudhurio ya ANC na historia ya huduma za
                  mama mjamzito kwa usalama na mwendelezo.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadDashboard}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Onyesha upya
              </button>

              <Link
                to="/maternity/pregnancies/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Sajili Mimba
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ERROR */}
        {/* ========================================================= */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div className="min-w-0">
                <p className="font-semibold text-red-800">
                  Imeshindikana kupakia taarifa
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadDashboard}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Jaribu tena
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAT CARDS */}
        {/* ========================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Mimba Zinazoendelea"
            value={activeCount}
            description="Pregnancies zenye status ACTIVE"
            icon={Activity}
            iconWrapperClass="bg-emerald-50 text-emerald-600"
            loading={loading}
          />

          <StatCard
            title="High Risk"
            value={highRiskCount}
            description="Mimba zilizoainishwa kuwa hatarishi"
            icon={AlertTriangle}
            iconWrapperClass="bg-red-50 text-red-600"
            loading={loading}
          />

          <StatCard
            title="Jumla ya Records"
            value={pregnancies.length}
            description="Pregnancy records zilizopo"
            icon={ClipboardList}
            iconWrapperClass="bg-blue-50 text-blue-600"
            loading={loading}
          />

          <StatCard
            title="ANC Continuity"
            value={activePregnancies.length}
            description="Mimba zinazoweza kupokea ANC"
            icon={HeartPulse}
            iconWrapperClass="bg-violet-50 text-violet-600"
            loading={loading}
          />
        </div>

        {/* ========================================================= */}
        {/* QUICK ACTIONS */}
        {/* ========================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* REGISTER PREGNANCY */}
          <Link
            to="/maternity/pregnancies/register"
            className="group rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Plus className="h-5 w-5" />
                </div>

                <h2 className="mt-4 font-bold text-slate-900">
                  Sajili Mimba Mpya
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Fungua pregnancy record mpya kwa mgonjwa.
                </p>
              </div>

              <ChevronRight className="h-5 w-5 text-emerald-600 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* PREGNANCY RECORDS */}
          <Link
            to="/maternity/pregnancies"
            className="group rounded-2xl border border-blue-200 bg-blue-50/70 p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Users className="h-5 w-5" />
                </div>

                <h2 className="mt-4 font-bold text-slate-900">
                  Pregnancy Records
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Angalia na tafuta records zote za mimba.
                </p>
              </div>

              <ChevronRight className="h-5 w-5 text-blue-600 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* LABOUR & DELIVERY */}
          <Link
            to="/maternity/labour"
            className="group rounded-2xl border border-rose-200 bg-rose-50/70 p-5 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white">
                  <Baby className="h-5 w-5" />
                </div>

                <h2 className="mt-4 font-bold text-slate-900">
                  Labour & Delivery
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Simamia labour, delivery na taarifa za mama baada ya kujifungua.
                </p>
              </div>

              <ChevronRight className="h-5 w-5 text-rose-600 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* PROTECTED HISTORY */}
          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Historia inalindwa
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  ANC visits za zamani hazifutwi wakati wa kuendelea na
                  huduma mpya.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RECENT PREGNANCIES */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-600" />

                <h2 className="text-lg font-bold text-slate-900">
                  Mimba Zinazoendelea
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Pregnancy records za hivi karibuni zilizo ACTIVE.
              </p>
            </div>

            <Link
              to="/maternity/pregnancies"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Angalia zote
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Tafuta kwa jina au Patient Number..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />

                <p className="text-sm">
                  Inapakia pregnancy records...
                </p>
              </div>
            </div>
          ) : filteredPregnancies.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UserRound className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Hakuna record iliyopatikana
              </h3>

              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                {searchTerm
                  ? "Hakuna pregnancy inayolingana na utafutaji wako."
                  : "Bado hakuna pregnancy yenye status ACTIVE."}
              </p>

              {!searchTerm && (
                <Link
                  to="/maternity/pregnancies/register"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Sajili Mimba
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPregnancies.map((pregnancy) => {
                const gestation = calculateGestation(
                  pregnancy?.lmp
                );

                return (
                  <Link
                    key={pregnancy.id}
                    to={`/maternity/pregnancies/${pregnancy.id}`}
                    className="group block p-5 transition hover:bg-slate-50 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <UserRound className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-bold text-slate-900">
                              {pregnancy?.patientName ||
                                "Mgonjwa hajatajwa"}
                            </h3>

                            {pregnancy?.highRisk && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">
                                <AlertTriangle className="h-3 w-3" />
                                High Risk
                              </span>
                            )}

                            <span
                              className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${getStatusClasses(
                                pregnancy?.status
                              )}`}
                            >
                              {getStatusLabel(
                                pregnancy?.status
                              )}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>
                              Patient No:{" "}
                              <strong className="font-semibold text-slate-700">
                                {pregnancy?.patientNumber || "—"}
                              </strong>
                            </span>

                            <span>
                              LMP:{" "}
                              <strong className="font-semibold text-slate-700">
                                {formatDate(
                                  pregnancy?.lmp
                                )}
                              </strong>
                            </span>

                            <span>
                              EDD:{" "}
                              <strong className="font-semibold text-slate-700">
                                {formatDate(
                                  pregnancy?.edd
                                )}
                              </strong>
                            </span>

                            {gestation && (
                              <span>
                                Gestation:{" "}
                                <strong className="font-semibold text-slate-700">
                                  {gestation}
                                </strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 lg:justify-end">
                        <div className="text-left lg:text-right">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Imesajiliwa
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {formatDate(
                              pregnancy?.createdAt
                            )}
                          </p>
                        </div>

                        <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* FOOTER INFO */}
        {/* ========================================================= */}

        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Maternity Management • Pregnancy, ANC & Labour Continuity
          </p>

          <p>
            Records zinahifadhiwa bila kufuta historia ya huduma.
          </p>
        </div>
      </div>
    </div>
  );
}