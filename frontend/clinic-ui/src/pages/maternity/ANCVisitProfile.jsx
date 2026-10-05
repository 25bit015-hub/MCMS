import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Baby,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  Info,
  Pill,
  Plus,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
  UserRound,
  Weight,
  Pencil,
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

function formatDateTime(dateValue) {
  if (!dateValue) return "—";

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
  const systolic = visit?.bloodPressureSystolic;
  const diastolic = visit?.bloodPressureDiastolic;

  if (systolic === null || systolic === undefined) {
    return "—";
  }

  if (diastolic === null || diastolic === undefined) {
    return `${systolic}`;
  }

  return `${systolic}/${diastolic}`;
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-800">
        {value !== null && value !== undefined && value !== ""
          ? value
          : "—"}
      </p>
    </div>
  );
}

function DetailSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Icon size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function ANCVisitProfile() {
  const { id } = useParams();

  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadVisit = useCallback(
    async (showRefresh = false) => {
      if (!id) {
        setError("ANC Visit ID haijapatikana.");
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

        const response = await api.get(
          `/maternity/anc-visits/${id}`
        );

        setVisit(response.data);
      } catch (err) {
        console.error("Failed to load ANC visit:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Imeshindikana kupata taarifa za ANC visit.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadVisit();
  }, [loadVisit]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-72 rounded-xl bg-slate-200" />

            <div className="h-40 rounded-3xl bg-white shadow-sm" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="h-28 rounded-2xl bg-white shadow-sm" />
              <div className="h-28 rounded-2xl bg-white shadow-sm" />
              <div className="h-28 rounded-2xl bg-white shadow-sm" />
              <div className="h-28 rounded-2xl bg-white shadow-sm" />
            </div>

            <div className="h-64 rounded-3xl bg-white shadow-sm" />
            <div className="h-64 rounded-3xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !visit) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={28} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Imeshindikana kufungua ANC Visit
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {error}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => loadVisit()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <RefreshCw size={17} />
                Jaribu tena
              </button>

              <Link
                to="/maternity"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Rudi Maternity
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pregnancyId = visit?.pregnancyId;
  const isArchived =
    String(visit?.recordStatus || "").toUpperCase() === "ARCHIVED";

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {pregnancyId && (
                <Link
                  to={`/maternity/pregnancies/${pregnancyId}/anc`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  <ArrowLeft size={17} />
                  Rudi ANC History
                </Link>
              )}

              {pregnancyId && (
                <span className="text-slate-300">•</span>
              )}

              {pregnancyId && (
                <Link
                  to={`/maternity/pregnancies/${pregnancyId}`}
                  className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  Pregnancy Profile
                </Link>
              )}
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
                <ClipboardList size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  ANC Visit #{visit?.id}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Taarifa kamili ya kliniki ya ANC visit hii.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 self-start">
            {!isArchived && (
              <Link
                to={`/maternity/anc-visits/${id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Pencil size={17} />
                Edit ANC Visit
              </Link>
            )}

            <button
              type="button"
              onClick={() => loadVisit(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">Kuna tatizo</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Visit hero */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white sm:p-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <UserRound size={30} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
                    Mjamzito
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {visit?.patientName || "Mgonjwa"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-300">
                    Patient No:{" "}
                    <span className="font-semibold text-white">
                      {visit?.patientNumber || "—"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getVisitTypeStyle(
                    visit?.visitType
                  )}`}
                >
                  {getVisitTypeLabel(visit?.visitType)}
                </span>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                    visit?.recordStatus
                  )}`}
                >
                  {visit?.recordStatus || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Tarehe ya Visit
              </p>

              <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                <CalendarDays
                  size={17}
                  className="text-slate-400"
                />
                {formatDate(visit?.visitDate)}
              </div>
            </div>

            <div className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Gestational Age
              </p>

              <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                <Activity
                  size={17}
                  className="text-slate-400"
                />
                {getGestationalAge(visit)}
              </div>
            </div>

            <div className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Next Visit
              </p>

              <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                <CalendarDays
                  size={17}
                  className="text-slate-400"
                />
                {formatDate(visit?.nextVisitDate)}
              </div>
            </div>

            <div className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Record Status
              </p>

              <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                <CheckCircle2
                  size={17}
                  className="text-emerald-500"
                />
                {visit?.recordStatus || "—"}
              </div>
            </div>
          </div>
        </section>

        {/* Maternal assessment */}
        <DetailSection
          icon={HeartPulse}
          title="Maternal Assessment"
          description="Taarifa za uchunguzi wa mama wakati wa ANC visit."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Weight"
              value={
                visit?.weight !== null &&
                visit?.weight !== undefined
                  ? `${visit.weight} kg`
                  : "—"
              }
            />

            <InfoItem
              label="Blood Pressure"
              value={getBloodPressure(visit)}
            />

            <InfoItem
              label="Pulse"
              value={
                visit?.pulse !== null &&
                visit?.pulse !== undefined
                  ? `${visit.pulse} bpm`
                  : "—"
              }
            />

            <InfoItem
              label="Temperature"
              value={
                visit?.temperature !== null &&
                visit?.temperature !== undefined
                  ? `${visit.temperature} °C`
                  : "—"
              }
            />

            <InfoItem
              label="Respiratory Rate"
              value={
                visit?.respiratoryRate !== null &&
                visit?.respiratoryRate !== undefined
                  ? `${visit.respiratoryRate} /min`
                  : "—"
              }
            />

            <InfoItem
              label="General Condition"
              value={visit?.generalCondition}
            />

            <InfoItem
              label="Oedema"
              value={visit?.oedema}
            />

            <InfoItem
              label="Pallor"
              value={visit?.pallor}
            />
          </div>

          {visit?.symptoms && (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Symptoms / Complaints
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {visit.symptoms}
              </p>
            </div>
          )}
        </DetailSection>

        {/* Fetal assessment */}
        <DetailSection
          icon={Baby}
          title="Fetal Assessment"
          description="Taarifa za uchunguzi wa mtoto tumboni."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Fetal Heart Rate"
              value={
                visit?.fetalHeartRate !== null &&
                visit?.fetalHeartRate !== undefined
                  ? `${visit.fetalHeartRate} bpm`
                  : "—"
              }
            />

            <InfoItem
              label="Fetal Movement"
              value={visit?.fetalMovement}
            />

            <InfoItem
              label="Presentation"
              value={visit?.presentation}
            />

            <InfoItem
              label="Lie"
              value={visit?.lie}
            />

            <InfoItem
              label="Position"
              value={visit?.position}
            />

            <InfoItem
              label="Fundal Height"
              value={
                visit?.fundalHeight !== null &&
                visit?.fundalHeight !== undefined
                  ? `${visit.fundalHeight} cm`
                  : "—"
              }
            />
          </div>
        </DetailSection>

        {/* Investigations */}
        <DetailSection
          icon={FileText}
          title="Investigations"
          description="Vipimo na majibu yaliyorekodiwa wakati wa visit."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Haemoglobin"
              value={
                visit?.haemoglobin !== null &&
                visit?.haemoglobin !== undefined
                  ? `${visit.haemoglobin} g/dL`
                  : "—"
              }
            />

            <InfoItem
              label="Blood Group"
              value={visit?.bloodGroup}
            />

            <InfoItem
              label="Rhesus"
              value={visit?.rhesus}
            />

            <InfoItem
              label="Urinalysis"
              value={visit?.urinalysis}
            />

            <InfoItem
              label="Blood Sugar"
              value={visit?.bloodSugar}
            />

            <InfoItem
              label="HIV Result"
              value={visit?.hivResult}
            />

            <InfoItem
              label="Syphilis Result"
              value={visit?.syphilisResult}
            />

            <InfoItem
              label="Hepatitis B Result"
              value={visit?.hepatitisBResult}
            />

            <InfoItem
              label="Ultrasound"
              value={visit?.ultrasound}
            />
          </div>

          {visit?.otherInvestigations && (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Other Investigations
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {visit.otherInvestigations}
              </p>
            </div>
          )}
        </DetailSection>

        {/* Clinical management */}
        <DetailSection
          icon={Stethoscope}
          title="Clinical Management"
          description="Assessment, diagnosis, treatment na mpango wa huduma."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InfoItem
              label="Assessment"
              value={visit?.assessment}
            />

            <InfoItem
              label="Risk Assessment"
              value={visit?.riskAssessment}
            />

            <InfoItem
              label="Diagnosis"
              value={visit?.diagnosis}
            />

            <InfoItem
              label="Treatment"
              value={visit?.treatment}
            />

            <InfoItem
              label="Medication"
              value={visit?.medication}
            />

            <InfoItem
              label="Referral"
              value={visit?.referral}
            />
          </div>
        </DetailSection>

        {/* Advice and education */}
        <DetailSection
          icon={Info}
          title="Advice & Health Education"
          description="Ushauri na elimu ya afya iliyotolewa kwa mama."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InfoItem
              label="Advice"
              value={visit?.advice}
            />

            <InfoItem
              label="Health Education"
              value={visit?.healthEducation}
            />
          </div>
        </DetailSection>

        {/* Notes */}
        {(visit?.notes || visit?.archiveReason) && (
          <DetailSection
            icon={ClipboardList}
            title="Notes & Record Information"
            description="Taarifa za ziada kuhusu clinical record."
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {visit?.notes && (
                <InfoItem
                  label="Notes"
                  value={visit.notes}
                />
              )}

              {visit?.archiveReason && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert
                      size={17}
                      className="text-amber-700"
                    />

                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Sababu ya Archive
                    </p>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-800">
                    {visit.archiveReason}
                  </p>
                </div>
              )}
            </div>
          </DetailSection>
        )}

        {/* Record metadata */}
        <DetailSection
          icon={FileText}
          title="Record Information"
          description="Taarifa za mfumo kuhusu record hii."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="ANC Visit ID"
              value={visit?.id}
            />

            <InfoItem
              label="Pregnancy ID"
              value={visit?.pregnancyId}
            />

            <InfoItem
              label="Created At"
              value={formatDateTime(visit?.createdAt)}
            />

            <InfoItem
              label="Updated At"
              value={formatDateTime(visit?.updatedAt)}
            />
          </div>
        </DetailSection>

        {/* Bottom navigation */}
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Historia ya ANC
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Rudi kwenye historia ya visits za ujauzito huu.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {pregnancyId && (
              <Link
                to={`/maternity/pregnancies/${pregnancyId}/anc`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                ANC History
              </Link>
            )}

            {!isArchived && (
              <Link
                to={`/maternity/anc-visits/${id}/edit`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil size={17} />
                Edit ANC Visit
              </Link>
            )}

            {pregnancyId && (
              <Link
                to={`/maternity/pregnancies/${pregnancyId}/anc/register`}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus size={17} />
                Sajili ANC Visit
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}