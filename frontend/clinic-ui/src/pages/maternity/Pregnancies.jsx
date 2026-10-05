import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Baby,
  CalendarDays,
  ChevronRight,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  X,
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
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "ARCHIVED":
      return "border-slate-200 bg-slate-100 text-slate-600";

    case "COMPLETED":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
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

export default function Pregnancies() {
  const [pregnancies, setPregnancies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const loadPregnancies = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/maternity/pregnancies");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setPregnancies(data);
    } catch (err) {
      console.error("Pregnancies loading error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      setError(
        backendMessage ||
          "Imeshindikana kupata pregnancy records kutoka kwenye server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPregnancies();
  }, []);

  const filteredPregnancies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return pregnancies.filter((pregnancy) => {
      const matchesSearch =
        !query ||
        [
          pregnancy?.patientName,
          pregnancy?.patientNumber,
          pregnancy?.status,
          pregnancy?.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        pregnancy?.status?.toUpperCase() === statusFilter;

      const isHighRisk = Boolean(pregnancy?.highRisk);

      const matchesRisk =
        riskFilter === "ALL" ||
        (riskFilter === "HIGH_RISK" && isHighRisk) ||
        (riskFilter === "NORMAL_RISK" && !isHighRisk);

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [pregnancies, searchTerm, statusFilter, riskFilter]);

  const activeCount = useMemo(
    () =>
      pregnancies.filter(
        (item) => item?.status?.toUpperCase() === "ACTIVE"
      ).length,
    [pregnancies]
  );

  const highRiskCount = useMemo(
    () => pregnancies.filter((item) => Boolean(item?.highRisk)).length,
    [pregnancies]
  );

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setRiskFilter("ALL");
  };

  const hasActiveFilters =
    searchTerm.trim() ||
    statusFilter !== "ALL" ||
    riskFilter !== "ALL";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* ========================================================= */}
        {/* PAGE HEADER */}
        {/* ========================================================= */}

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-100/60 blur-3xl" />

          <div className="relative flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                <Baby className="h-7 w-7" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Pregnancy Records
                  </h1>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Maternity
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Angalia, tafuta na simamia taarifa za mimba bila kufuta
                  historia ya huduma.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadPregnancies}
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

              <div>
                <p className="font-semibold text-red-800">
                  Imeshindikana kupakia records
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadPregnancies}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Jaribu tena
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUMMARY */}
        {/* ========================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Baby className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Jumla ya Pregnancy
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "—" : pregnancies.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-emerald-700">
                  Zinazoendelea
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-800">
                  {loading ? "—" : activeCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-red-700">
                  High Risk
                </p>

                <p className="mt-1 text-2xl font-bold text-red-800">
                  {loading ? "—" : highRiskCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SEARCH + FILTERS */}
        {/* ========================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tafuta Mgonjwa
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Jina la mgonjwa au Patient Number..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div className="w-full xl:w-52">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="ALL">Status zote</option>
                <option value="ACTIVE">Inaendelea</option>
                <option value="COMPLETED">Imekamilika</option>
                <option value="ARCHIVED">Imehifadhiwa</option>
              </select>
            </div>

            <div className="w-full xl:w-52">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Risk Level
              </label>

              <select
                value={riskFilter}
                onChange={(event) =>
                  setRiskFilter(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="ALL">Risk zote</option>
                <option value="HIGH_RISK">High Risk</option>
                <option value="NORMAL_RISK">Normal Risk</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:flex">
                <Filter className="h-4 w-4" />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Safisha
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              Inaonyesha{" "}
              <span className="font-semibold text-slate-800">
                {filteredPregnancies.length}
              </span>{" "}
              kati ya{" "}
              <span className="font-semibold text-slate-800">
                {pregnancies.length}
              </span>{" "}
              records.
            </p>

            {hasActiveFilters && (
              <p className="text-xs font-medium text-emerald-700">
                Filters zimewashwa
              </p>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* RECORDS */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-slate-900">
              Pregnancy Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Chagua record kuona taarifa zote za pregnancy na ANC history.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm">
                  Inapakia pregnancy records...
                </p>
              </div>
            </div>
          ) : filteredPregnancies.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Hakuna records
              </h3>

              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                Hakuna pregnancy inayolingana na search au filters
                ulizochagua.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Ondoa Filters
                </button>
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
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                            pregnancy?.highRisk
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {pregnancy?.highRisk ? (
                            <AlertTriangle className="h-5 w-5" />
                          ) : (
                            <UserRound className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-bold text-slate-900">
                              {pregnancy?.patientName ||
                                "Mgonjwa hajatajwa"}
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                                pregnancy?.status
                              )}`}
                            >
                              {getStatusLabel(
                                pregnancy?.status
                              )}
                            </span>

                            {pregnancy?.highRisk && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
                                <AlertTriangle className="h-3 w-3" />
                                High Risk
                              </span>
                            )}
                          </div>

                          <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 text-xs text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Patient Number
                              </span>

                              <span className="mt-0.5 block font-semibold text-slate-700">
                                {pregnancy?.patientNumber ||
                                  "—"}
                              </span>
                            </div>

                            <div>
                              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                LMP
                              </span>

                              <span className="mt-0.5 block font-semibold text-slate-700">
                                {formatDate(pregnancy?.lmp)}
                              </span>
                            </div>

                            <div>
                              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                EDD
                              </span>

                              <span className="mt-0.5 block font-semibold text-slate-700">
                                {formatDate(pregnancy?.edd)}
                              </span>
                            </div>

                            <div>
                              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Gestation
                              </span>

                              <span className="mt-0.5 block font-semibold text-slate-700">
                                {gestation || "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-5 border-t border-slate-100 pt-4 lg:border-t-0 lg:pt-0">
                        <div className="text-left lg:text-right">
                          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Imesajiliwa
                          </span>

                          <span className="mt-1 block text-sm font-semibold text-slate-700">
                            {formatDate(
                              pregnancy?.createdAt
                            )}
                          </span>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition group-hover:bg-emerald-50 group-hover:text-emerald-600">
                          <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* FOOTER */}
        {/* ========================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Maternity Management • Pregnancy Records
            </p>

            <p>
              Clinical history inalindwa; records hazifutwi moja kwa moja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}