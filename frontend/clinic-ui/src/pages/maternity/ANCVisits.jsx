import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  HeartPulse,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  UserRound,
  Weight,
} from "lucide-react";

import api from "../../services/api";

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

function getVisitTypeLabel(type) {
  const normalized = String(type || "").toUpperCase();

  const labels = {
    INITIAL_ANC: "ANC ya Kwanza",
    FOLLOW_UP: "ANC ya Ufuatiliaji",
    FOLLOW_UP_ANC: "ANC ya Ufuatiliaji",
    EMERGENCY: "Huduma ya Dharura",
    REVIEW: "Mapitio",
  };

  return labels[normalized] || type || "—";
}

function getVisitTypeStyle(type) {
  const normalized = String(type || "").toUpperCase();

  if (normalized === "INITIAL_ANC") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (
    normalized === "FOLLOW_UP" ||
    normalized === "FOLLOW_UP_ANC"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (normalized === "EMERGENCY") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

function getStatusStyle(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "ACTIVE") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (normalized === "ARCHIVED") {
    return "bg-slate-100 text-slate-600 border-slate-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

function getGestationalAge(visit) {
  const weeks = visit?.gestationalWeeks;
  const days = visit?.gestationalDays;

  if (weeks === null || weeks === undefined) {
    return "—";
  }

  if (days !== null && days !== undefined) {
    return `${weeks}w ${days}d`;
  }

  return `${weeks} weeks`;
}

function getBloodPressure(visit) {
  if (
    visit?.bloodPressureSystolic === null ||
    visit?.bloodPressureSystolic === undefined
  ) {
    return "—";
  }

  if (
    visit?.bloodPressureDiastolic === null ||
    visit?.bloodPressureDiastolic === undefined
  ) {
    return `${visit.bloodPressureSystolic}`;
  }

  return `${visit.bloodPressureSystolic}/${visit.bloodPressureDiastolic}`;
}

export default function ANCVisits() {
  const { id } = useParams();

  const [pregnancy, setPregnancy] = useState(null);
  const [visits, setVisits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadData = useCallback(
    async (showRefresh = false) => {
      if (!id) {
        setError("Pregnancy ID haijapatikana.");
        setLoading(false);
        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const [pregnancyResponse, visitsResponse] = await Promise.all([
          api.get(`/maternity/pregnancies/${id}`),
          api.get(`/maternity/anc-visits/pregnancy/${id}`),
        ]);

        setPregnancy(pregnancyResponse.data);

        const visitData = Array.isArray(visitsResponse.data)
          ? visitsResponse.data
          : [];

        setVisits(visitData);
      } catch (err) {
        console.error("Failed to load ANC visits:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Imeshindikana kupata taarifa za ANC.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredVisits = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return visits.filter((visit) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        String(visit?.recordStatus || "").toUpperCase() === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        visit?.visitType,
        getVisitTypeLabel(visit?.visitType),
        visit?.assessment,
        visit?.diagnosis,
        visit?.treatment,
        visit?.medication,
        visit?.notes,
        visit?.generalCondition,
        visit?.riskAssessment,
        visit?.recordStatus,
        formatDate(visit?.visitDate),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [visits, searchTerm, statusFilter]);

  const activeVisits = useMemo(
    () =>
      visits.filter(
        (visit) =>
          String(visit?.recordStatus || "").toUpperCase() === "ACTIVE"
      ),
    [visits]
  );

  const archivedVisits = useMemo(
    () =>
      visits.filter(
        (visit) =>
          String(visit?.recordStatus || "").toUpperCase() === "ARCHIVED"
      ),
    [visits]
  );

  const latestVisit = useMemo(() => {
    if (!visits.length) return null;

    return [...visits].sort((a, b) => {
      const dateA = new Date(a?.visitDate || 0).getTime();
      const dateB = new Date(b?.visitDate || 0).getTime();

      return dateB - dateA;
    })[0];
  }, [visits]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded-xl bg-slate-200" />

            <div className="h-28 rounded-2xl bg-white shadow-sm" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="h-28 rounded-2xl bg-white shadow-sm" />
              <div className="h-28 rounded-2xl bg-white shadow-sm" />
              <div className="h-28 rounded-2xl bg-white shadow-sm" />
            </div>

            <div className="h-20 rounded-2xl bg-white shadow-sm" />

            <div className="h-96 rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !pregnancy) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={28} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Imeshindikana kufungua ANC
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {error}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => loadData()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <RefreshCw size={17} />
                Jaribu tena
              </button>

              <Link
                to={`/maternity/pregnancies/${id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Rudi kwenye Pregnancy
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              to={`/maternity/pregnancies/${id}`}
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Rudi kwenye Pregnancy
            </Link>

            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
                <ClipboardList size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  ANC Visits
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Historia yote ya kliniki ya ujauzito huu.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              to={`/maternity/pregnancies/${id}/anc/register`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={18} />
              Sajili ANC Visit
            </Link>
          </div>
        </div>

        {/* Pregnancy summary */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <UserRound size={26} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
                    Mjamzito
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {pregnancy?.patientName || "Mgonjwa"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-300">
                    Patient No:{" "}
                    <span className="font-semibold text-white">
                      {pregnancy?.patientNumber || "—"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <p className="text-xs text-slate-300">LMP</p>

                  <p className="mt-1 text-sm font-bold">
                    {formatDate(pregnancy?.lmp)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <p className="text-xs text-slate-300">EDD</p>

                  <p className="mt-1 text-sm font-bold">
                    {formatDate(pregnancy?.edd)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <p className="text-xs text-slate-300">Gravida</p>

                  <p className="mt-1 text-sm font-bold">
                    {pregnancy?.gravida ?? "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <p className="text-xs text-slate-300">Para</p>

                  <p className="mt-1 text-sm font-bold">
                    {pregnancy?.para ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />

            <div>
              <p className="font-semibold">Kuna tatizo</p>

              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <ClipboardList size={21} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Visits
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {visits.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Jumla ya ANC records
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={21} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {activeVisits.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Records zinazotumika
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <FileText size={21} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Archived
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {archivedVisits.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Historical records
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-700">
                <CalendarDays size={21} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Latest
              </span>
            </div>

            <p className="mt-4 text-lg font-bold text-slate-900">
              {latestVisit ? formatDate(latestVisit.visitDate) : "—"}
            </p>

            <p className="mt-1 truncate text-sm text-slate-500">
              {latestVisit
                ? getVisitTypeLabel(latestVisit.visitType)
                : "Hakuna ANC visit"}
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search
                size={19}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tafuta kwa diagnosis, assessment, treatment, tarehe..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: "ALL", label: "Zote" },
                { value: "ACTIVE", label: "Active" },
                { value: "ARCHIVED", label: "Archived" },
              ].map((filter) => {
                const selected = statusFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      selected
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Visits */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Historia ya ANC
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredVisits.length} record
                {filteredVisits.length === 1 ? "" : "s"} imepatikana.
              </p>
            </div>

            <Link
              to={`/maternity/pregnancies/${id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              <Eye size={17} />
              Angalia Pregnancy Profile
            </Link>
          </div>

          {filteredVisits.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <ClipboardList size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Hakuna ANC visit
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Hakuna record inayolingana na search au filter uliyochagua.
                Unaweza kusajili ANC visit mpya.
              </p>

              <Link
                to={`/maternity/pregnancies/${id}/anc/register`}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Sajili ANC Visit
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredVisits.map((visit, index) => (
                <div
                  key={visit.id}
                  className="p-5 transition hover:bg-slate-50/70 sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-400">
                          #{visit.id}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getVisitTypeStyle(
                            visit.visitType
                          )}`}
                        >
                          {getVisitTypeLabel(visit.visitType)}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            visit.recordStatus
                          )}`}
                        >
                          {visit.recordStatus || "—"}
                        </span>

                        {index === 0 && (
                          <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
                            Record ya Mwisho
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <CalendarDays
                            size={17}
                            className="text-slate-400"
                          />
                          {formatDate(visit.visitDate)}
                        </div>

                        <div className="hidden h-4 w-px bg-slate-200 sm:block" />

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Activity
                            size={17}
                            className="text-slate-400"
                          />
                          Gestational age:{" "}
                          <span className="font-semibold text-slate-900">
                            {getGestationalAge(visit)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <HeartPulse size={15} />
                            BP
                          </div>

                          <p className="mt-2 text-sm font-bold text-slate-900">
                            {getBloodPressure(visit)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <Weight size={15} />
                            Weight
                          </div>

                          <p className="mt-2 text-sm font-bold text-slate-900">
                            {visit.weight !== null &&
                            visit.weight !== undefined
                              ? `${visit.weight} kg`
                              : "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <Stethoscope size={15} />
                            FHR
                          </div>

                          <p className="mt-2 text-sm font-bold text-slate-900">
                            {visit.fetalHeartRate !== null &&
                            visit.fetalHeartRate !== undefined
                              ? `${visit.fetalHeartRate} bpm`
                              : "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <Activity size={15} />
                            Fundal Height
                          </div>

                          <p className="mt-2 text-sm font-bold text-slate-900">
                            {visit.fundalHeight !== null &&
                            visit.fundalHeight !== undefined
                              ? `${visit.fundalHeight} cm`
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {(visit.assessment ||
                        visit.diagnosis ||
                        visit.treatment ||
                        visit.medication) && (
                        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Clinical Summary
                          </p>

                          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {visit.assessment && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500">
                                  Assessment
                                </p>

                                <p className="mt-1 text-sm leading-6 text-slate-700">
                                  {visit.assessment}
                                </p>
                              </div>
                            )}

                            {visit.diagnosis && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500">
                                  Diagnosis
                                </p>

                                <p className="mt-1 text-sm leading-6 text-slate-700">
                                  {visit.diagnosis}
                                </p>
                              </div>
                            )}

                            {visit.treatment && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500">
                                  Treatment
                                </p>

                                <p className="mt-1 text-sm leading-6 text-slate-700">
                                  {visit.treatment}
                                </p>
                              </div>
                            )}

                            {visit.medication && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500">
                                  Medication
                                </p>

                                <p className="mt-1 text-sm leading-6 text-slate-700">
                                  {visit.medication}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {visit.archiveReason && (
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                            Sababu ya Archive
                          </p>

                          <p className="mt-1 text-sm leading-6 text-amber-800">
                            {visit.archiveReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 xl:pl-4">
                      <Link
                        to={`/maternity/anc-visits/${visit.id}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
                      >
                        <Eye size={17} />
                        Angalia Record
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}