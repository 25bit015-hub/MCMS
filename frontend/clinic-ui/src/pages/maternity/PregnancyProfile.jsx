import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Baby,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FileHeart,
  HeartPulse,
  Loader2,
  Plus,
  ShieldAlert,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";

import api from "../../services/api";

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPatientName(pregnancy) {
  if (pregnancy?.patientName) {
    return pregnancy.patientName;
  }

  return "-";
}

function getStatusClasses(status) {
  switch (String(status || "").toUpperCase()) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "COMPLETED":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "ARCHIVED":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function getVisitTypeClasses(visitType) {
  switch (String(visitType || "").toUpperCase()) {
    case "INITIAL_ANC":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "FOLLOW_UP":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "EMERGENCY":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getVisitTypeLabel(visitType) {
  switch (String(visitType || "").toUpperCase()) {
    case "INITIAL_ANC":
      return "Initial ANC";

    case "FOLLOW_UP":
      return "Follow Up";

    case "EMERGENCY":
      return "Emergency";

    default:
      return visitType || "-";
  }
}

function calculatePregnancyProgress(edd) {
  if (!edd) {
    return null;
  }

  const eddDate = new Date(`${edd}T00:00:00`);

  if (Number.isNaN(eddDate.getTime())) {
    return null;
  }

  const today = new Date();

  const pregnancyStart = new Date(eddDate);
  pregnancyStart.setDate(
    pregnancyStart.getDate() - 280
  );

  const totalDays =
    280;

  const elapsedDays =
    Math.floor(
      (today.getTime() -
        pregnancyStart.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  const weeks = Math.floor(
    elapsedDays / 7
  );

  const days = elapsedDays % 7;

  const percentage = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (elapsedDays / totalDays) * 100
      )
    )
  );

  return {
    weeks,
    days,
    percentage,
  };
}

export default function PregnancyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pregnancy, setPregnancy] =
    useState(null);

  const [ancVisits, setAncVisits] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [archiving, setArchiving] =
    useState(false);

  useEffect(() => {
    if (!id) {
      setError(
        "Pregnancy ID haijapatikana."
      );
      setLoading(false);
      return;
    }

    loadPregnancy();
  }, [id]);

  async function loadPregnancy() {
    try {
      setLoading(true);
      setError("");

      const [pregnancyResponse, ancResponse] =
        await Promise.all([
          api.get(
            `/maternity/pregnancies/${id}`
          ),

          api.get(
            `/maternity/anc-visits/pregnancy/${id}`
          ),
        ]);

      setPregnancy(
        pregnancyResponse.data
      );

      const visits = Array.isArray(
        ancResponse.data
      )
        ? ancResponse.data
        : [];

      setAncVisits(visits);
    } catch (err) {
      console.error(
        "Failed to load pregnancy profile:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Imeshindikana kupata taarifa za pregnancy."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive() {
    if (!pregnancy?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        "Una uhakika unataka ku-archive pregnancy hii? Historia yake haitafutwa."
      );

    if (!confirmed) {
      return;
    }

    try {
      setArchiving(true);
      setError("");

      await api.delete(
        `/maternity/pregnancies/${pregnancy.id}`
      );

      await loadPregnancy();
    } catch (err) {
      console.error(
        "Failed to archive pregnancy:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Imeshindikana ku-archive pregnancy."
      );
    } finally {
      setArchiving(false);
    }
  }

  const activeAncVisits = useMemo(() => {
    return ancVisits.filter(
      (visit) =>
        String(
          visit.recordStatus || "ACTIVE"
        ).toUpperCase() === "ACTIVE"
    );
  }, [ancVisits]);

  const archivedAncVisits = useMemo(() => {
    return ancVisits.filter(
      (visit) =>
        String(
          visit.recordStatus || ""
        ).toUpperCase() === "ARCHIVED"
    );
  }, [ancVisits]);

  const latestVisit = useMemo(() => {
    if (!ancVisits.length) {
      return null;
    }

    return [...ancVisits].sort(
      (a, b) =>
        new Date(
          `${b.visitDate}T00:00:00`
        ) -
        new Date(
          `${a.visitDate}T00:00:00`
        )
    )[0];
  }, [ancVisits]);

  const pregnancyProgress =
    calculatePregnancyProgress(
      pregnancy?.edd
    );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-rose-50/40 p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-rose-600" />
          <span className="text-sm font-medium">
            Inapakia taarifa za pregnancy...
          </span>
        </div>
      </div>
    );
  }

  if (error && !pregnancy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/40 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/maternity/pregnancies"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Rudi kwenye Pregnancies
          </Link>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-7">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0" />

              <div>
                <h2 className="font-bold">
                  Taarifa haikupatikana
                </h2>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pregnancy) {
    return null;
  }

  const patientName =
    getPatientName(pregnancy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/40 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Link
              to="/maternity/pregnancies"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              title="Rudi kwenye Pregnancies"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                    pregnancy.status
                  )}`}
                >
                  {pregnancy.status || "-"}
                </span>

                {pregnancy.highRisk && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    HIGH RISK
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Pregnancy Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Historia kamili ya pregnancy na ANC
                visits zake.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {String(
              pregnancy.status || ""
            ).toUpperCase() === "ACTIVE" && (
              <Link
                to={`/maternity/pregnancies/${pregnancy.id}/anc`}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700"
              >
                <Plus className="h-4 w-4" />
                Ongeza ANC Visit
              </Link>
            )}

            <Link
              to={`/maternity/pregnancies/${pregnancy.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Edit3 className="h-4 w-4" />
              Edit Pregnancy
            </Link>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Hitilafu
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            PATIENT + PREGNANCY HERO
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-rose-50 via-white to-violet-50/50 px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-rose-100 text-rose-600">
                  <UserRound className="h-8 w-8" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Patient
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                    {patientName}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600 shadow-sm">
                      Patient No:{" "}
                      {pregnancy.patientNumber ||
                        "-"}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600 shadow-sm">
                      Pregnancy ID:{" "}
                      {pregnancy.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white bg-white/80 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  ANC Visits
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">
                  {activeAncVisits.length}
                </p>

                <p className="text-xs text-slate-500">
                  active clinical records
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                LMP
              </p>

              <p className="mt-2 flex items-center gap-2 font-bold text-slate-800">
                <CalendarDays className="h-4 w-4 text-rose-500" />
                {formatDate(pregnancy.lmp)}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                EDD
              </p>

              <p className="mt-2 flex items-center gap-2 font-bold text-slate-800">
                <CalendarDays className="h-4 w-4 text-violet-500" />
                {formatDate(pregnancy.edd)}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Gravida / Para
              </p>

              <p className="mt-2 flex items-center gap-2 font-bold text-slate-800">
                <UsersRound className="h-4 w-4 text-blue-500" />
                {pregnancy.gravida ?? "-"} /{" "}
                {pregnancy.para ?? "-"}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Living Children
              </p>

              <p className="mt-2 flex items-center gap-2 font-bold text-slate-800">
                <Baby className="h-4 w-4 text-emerald-500" />
                {pregnancy.livingChildren ?? "-"}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            PROGRESS
        ====================================================== */}

        {pregnancyProgress && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-rose-500" />

                  <h2 className="font-bold text-slate-900">
                    Pregnancy Progress
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Makadirio kulingana na LMP na EDD
                  iliyohifadhiwa.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-2xl font-black text-slate-900">
                  {Math.max(
                    0,
                    pregnancyProgress.weeks
                  )}{" "}
                  weeks{" "}
                  {Math.max(
                    0,
                    pregnancyProgress.days
                  )}{" "}
                  days
                </p>

                <p className="text-xs text-slate-400">
                  Target EDD:{" "}
                  {formatDate(
                    pregnancy.edd
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-violet-500 transition-all"
                  style={{
                    width: `${pregnancyProgress.percentage}%`,
                  }}
                />
              </div>

              <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
                <span>Start</span>
                <span>
                  {pregnancyProgress.percentage}%
                </span>
                <span>EDD</span>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <FileHeart className="h-5 w-5" />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                ANC
              </span>
            </div>

            <p className="mt-4 text-2xl font-black text-slate-900">
              {activeAncVisits.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Active ANC Visits
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Activity className="h-5 w-5" />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                Latest
              </span>
            </div>

            <p className="mt-4 text-lg font-black text-slate-900">
              {latestVisit
                ? formatDate(
                    latestVisit.visitDate
                  )
                : "-"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Last ANC Visit
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ShieldAlert className="h-5 w-5" />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                Risk
              </span>
            </div>

            <p className="mt-4 text-lg font-black text-slate-900">
              {pregnancy.highRisk
                ? "HIGH RISK"
                : "NORMAL"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Pregnancy Risk Status
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                Records
              </span>
            </div>

            <p className="mt-4 text-2xl font-black text-slate-900">
              {archivedAncVisits.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Archived ANC Records
            </p>
          </div>
        </div>

        {/* =====================================================
            ANC HISTORY
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Stethoscope className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  ANC Visit History
                </h2>

                <p className="text-sm text-slate-500">
                  Clinical records zote za pregnancy hii.
                </p>
              </div>
            </div>

            {String(
              pregnancy.status || ""
            ).toUpperCase() === "ACTIVE" && (
              <Link
                to={`/maternity/pregnancies/${pregnancy.id}/anc`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />
                Record ANC Visit
              </Link>
            )}
          </div>

          {ancVisits.length === 0 ? (
            <div className="px-5 py-14 text-center sm:px-7">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FileHeart className="h-7 w-7" />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                Hakuna ANC Visit bado
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                Pregnancy hii bado haina ANC clinical
                record. Unaweza kuongeza visit ya kwanza
                kutoka hapa.
              </p>

              {String(
                pregnancy.status || ""
              ).toUpperCase() === "ACTIVE" && (
                <Link
                  to={`/maternity/pregnancies/${pregnancy.id}/anc`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
                >
                  <Plus className="h-4 w-4" />
                  Ongeza ANC Visit
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {ancVisits.map((visit) => {
                const isArchived =
                  String(
                    visit.recordStatus || ""
                  ).toUpperCase() ===
                  "ARCHIVED";

                return (
                  <Link
                    key={visit.id}
                    to={`/maternity/anc-visits/${visit.id}`}
                    className="group block px-5 py-5 transition hover:bg-slate-50 sm:px-7"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isArchived
                              ? "bg-slate-100 text-slate-400"
                              : "bg-violet-50 text-violet-600"
                          }`}
                        >
                          <CalendarDays className="h-5 w-5" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900 group-hover:text-violet-700">
                              {formatDate(
                                visit.visitDate
                              )}
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getVisitTypeClasses(
                                visit.visitType
                              )}`}
                            >
                              {getVisitTypeLabel(
                                visit.visitType
                              )}
                            </span>

                            {isArchived && (
                              <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                                ARCHIVED
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                            <span>
                              Gestational Age:{" "}
                              <strong className="text-slate-700">
                                {visit.gestationalWeeks ??
                                  "-"}{" "}
                                w{" "}
                                {visit.gestationalDays ??
                                  "-"}{" "}
                                d
                              </strong>
                            </span>

                            <span>
                              BP:{" "}
                              <strong className="text-slate-700">
                                {visit.bloodPressureSystolic ??
                                  "-"}
                                /
                                {visit.bloodPressureDiastolic ??
                                  "-"}
                              </strong>
                            </span>

                            <span>
                              FHR:{" "}
                              <strong className="text-slate-700">
                                {visit.fetalHeartRate ??
                                  "-"}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-left lg:text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Next Visit
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {formatDate(
                              visit.nextVisitDate
                            )}
                          </p>
                        </div>

                        <ArrowLeft className="h-4 w-4 rotate-180 text-slate-300 transition group-hover:text-violet-500" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* =====================================================
            PREGNANCY NOTES
        ====================================================== */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileHeart className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Clinical Notes
                </h2>

                <p className="text-xs text-slate-400">
                  Taarifa za pregnancy
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {pregnancy.notes ||
                  "Hakuna clinical notes zilizowekwa."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Record Information
                </h2>

                <p className="text-xs text-slate-400">
                  Mfumo na timestamps
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-500">
                  Created
                </span>

                <span className="text-right text-sm font-semibold text-slate-700">
                  {formatDateTime(
                    pregnancy.createdAt
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Last Updated
                </span>

                <span className="text-right text-sm font-semibold text-slate-700">
                  {formatDateTime(
                    pregnancy.updatedAt
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ARCHIVE
        ====================================================== */}

        {String(
          pregnancy.status || ""
        ).toUpperCase() === "ACTIVE" && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>
                  <h3 className="font-bold text-slate-900">
                    Archive Pregnancy
                  </h3>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                    Archiving haitafuta pregnancy wala ANC
                    history. Record itawekwa kama ARCHIVED
                    kwa ajili ya history na audit trail.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleArchive}
                disabled={archiving}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-amber-700 shadow-sm transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {archiving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ina-archive...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    Archive Pregnancy
                  </>
                )}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}