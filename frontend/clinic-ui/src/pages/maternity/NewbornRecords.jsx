import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Baby,
  CalendarDays,
  ChevronRight,
  Clock3,
  HeartPulse,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Weight,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Imeshindikana kupata taarifa za watoto wachanga."
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeValue) {
  if (!timeValue) return "—";

  return String(timeValue).slice(0, 5);
}

function formatWeight(weight) {
  if (weight === null || weight === undefined || weight === "") {
    return "—";
  }

  return `${Number(weight).toFixed(2)} kg`;
}

function getSexLabel(sex) {
  if (!sex) return "Haijaainishwa";

  const normalized = String(sex).toUpperCase();

  if (normalized === "MALE") return "Mwanaume";
  if (normalized === "FEMALE") return "Mwanamke";

  return sex;
}

function getOutcomeLabel(outcome) {
  if (!outcome) return "Haijaainishwa";

  const normalized = String(outcome).toUpperCase();

  if (normalized === "ALIVE") return "Hai";
  if (normalized === "STILLBIRTH") return "Stillbirth";
  if (normalized === "DECEASED") return "Amefariki";

  return outcome;
}

function getOutcomeClass(outcome) {
  const normalized = String(outcome || "").toUpperCase();

  if (normalized === "ALIVE") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (
    normalized === "STILLBIRTH" ||
    normalized === "DECEASED"
  ) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
}

function getSexClass(sex) {
  const normalized = String(sex || "").toUpperCase();

  if (normalized === "FEMALE") {
    return "bg-pink-50 text-pink-700 ring-1 ring-pink-200";
  }

  if (normalized === "MALE") {
    return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
  }

  return "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
}

function StatCard({ icon: Icon, label, value, description, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function NewbornRecords() {
  const [newborns, setNewborns] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNewborns = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/maternity/newborn-records");

      setNewborns(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load newborn records:", err);
      setError(getErrorMessage(err));
      setNewborns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewborns();
  }, []);

  const statistics = useMemo(() => {
    const total = newborns.length;

    const active = newborns.filter(
      (item) =>
        String(item.recordStatus || "").toUpperCase() === "ACTIVE"
    ).length;

    const archived = newborns.filter(
      (item) =>
        String(item.recordStatus || "").toUpperCase() === "ARCHIVED"
    ).length;

    const alive = newborns.filter(
      (item) =>
        String(item.newbornOutcome || "").toUpperCase() === "ALIVE"
    ).length;

    return {
      total,
      active,
      archived,
      alive,
    };
  }, [newborns]);

  const filteredNewborns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return newborns.filter((newborn) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        String(newborn.recordStatus || "").toUpperCase() ===
          statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        newborn.patientName,
        newborn.patientNumber,
        newborn.sex,
        newborn.newbornOutcome,
        newborn.placeOfCare,
        newborn.labourRecordId,
        newborn.pregnancyId,
        newborn.id,
      ]
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            value !== ""
        )
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [newborns, search, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur">
                <Baby className="h-7 w-7" />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                    MATERNITY
                  </span>

                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-300/20">
                    Newborn Care
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Watoto Wachanga
                </h1>

                <p className="mt-1 max-w-2xl text-sm text-blue-100 sm:text-base">
                  Simamia taarifa za watoto waliozaliwa,
                  vipimo vya mwanzo, APGAR na outcome ya mtoto.
                </p>
              </div>
            </div>

            <Link
              to="/maternity/newborn-records/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" />
              Sajili Newborn
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Baby}
            label="Watoto Wote"
            value={statistics.total}
            description="Jumla ya newborn records"
            iconClass="bg-blue-50 text-blue-700"
          />

          <StatCard
            icon={ShieldCheck}
            label="Active"
            value={statistics.active}
            description="Records zinazotumika"
            iconClass="bg-emerald-50 text-emerald-700"
          />

          <StatCard
            icon={Activity}
            label="Hai"
            value={statistics.alive}
            description="Newborn outcome: alive"
            iconClass="bg-indigo-50 text-indigo-700"
          />

          <StatCard
            icon={HeartPulse}
            label="Archived"
            value={statistics.archived}
            description="Historical records"
            iconClass="bg-slate-100 text-slate-600"
          />
        </section>

        {/* Toolbar */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tafuta kwa jina, patient number, sex, outcome..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: "ALL", label: "Wote" },
                { value: "ACTIVE", label: "Active" },
                { value: "ARCHIVED", label: "Archived" },
              ].map((filter) => {
                const active = statusFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <Activity className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-semibold">
                  Imeshindikana kupakia taarifa
                </p>

                <p className="mt-1">{error}</p>

                <button
                  type="button"
                  onClick={loadNewborns}
                  className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Jaribu tena
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Orodha ya Newborn Records
              </h2>

              <p className="text-sm text-slate-500">
                {filteredNewborns.length} record
                {filteredNewborns.length === 1 ? "" : "s"} zinaonyeshwa.
              </p>
            </div>

            <button
              type="button"
              onClick={loadNewborns}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-700">
                Inapakia taarifa za newborn...
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Tafadhali subiri kidogo.
              </p>
            </div>
          ) : filteredNewborns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Baby className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-900">
                Hakuna newborn records
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Hakuna taarifa inayolingana na search au filter
                uliyochagua.
              </p>

              {!search && statusFilter === "ALL" && (
                <Link
                  to="/maternity/newborn-records/register"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Sajili Newborn
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredNewborns.map((newborn) => {
                const isActive =
                  String(newborn.recordStatus || "").toUpperCase() ===
                  "ACTIVE";

                return (
                  <article
                    key={newborn.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                  >
                    {/* Card header */}
                    <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                            <Baby className="h-6 w-6" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-base font-bold text-slate-900">
                              {newborn.patientName || "Mgonjwa hajulikani"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {newborn.patientNumber || "No Patient Number"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                          }`}
                        >
                          {isActive ? "ACTIVE" : "ARCHIVED"}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="space-y-4 p-5">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getSexClass(
                            newborn.sex
                          )}`}
                        >
                          {getSexLabel(newborn.sex)}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getOutcomeClass(
                            newborn.newbornOutcome
                          )}`}
                        >
                          {getOutcomeLabel(newborn.newbornOutcome)}
                        </span>

                        {newborn.birthOrder && (
                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-purple-200">
                            Mtoto #{newborn.birthOrder}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Tarehe
                          </div>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatDate(newborn.dateOfBirth)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            Muda
                          </div>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatTime(newborn.timeOfBirth)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Weight className="h-3.5 w-3.5" />
                            Uzito
                          </div>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatWeight(newborn.birthWeight)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <HeartPulse className="h-3.5 w-3.5" />
                            APGAR
                          </div>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {newborn.apgarOneMinute ?? "—"} /{" "}
                            {newborn.apgarFiveMinutes ?? "—"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-white p-3">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-500">
                            Labour Record
                          </span>

                          <span className="font-semibold text-slate-800">
                            #{newborn.labourRecordId ?? "—"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-500">
                            Pregnancy
                          </span>

                          <span className="font-semibold text-slate-800">
                            #{newborn.pregnancyId ?? "—"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-500">
                            Place of Care
                          </span>

                          <span className="max-w-[60%] truncate font-semibold text-slate-800">
                            {newborn.placeOfCare || "—"}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <Link
                        to={`/maternity/newborn-records/${newborn.id}`}
                        className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm font-semibold text-blue-700 transition group-hover:bg-blue-100"
                      >
                        <span>Fungua Newborn Profile</span>

                        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}