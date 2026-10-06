import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Baby,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  HeartPulse,
  Loader2,
  MapPin,
  Milk,
  Pill,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Thermometer,
  UserRound,
  Weight,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import api from "../../services/api";

function getErrorMessage(error, fallback = "Imeshindikana kupata taarifa.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function formatBoolean(value) {
  if (value === true) return "Ndiyo";
  if (value === false) return "Hapana";
  return "—";
}

function getSexLabel(sex) {
  const normalized = String(sex || "").toUpperCase();

  if (normalized === "MALE") {
    return "Mwanaume";
  }

  if (normalized === "FEMALE") {
    return "Mwanamke";
  }

  return displayValue(sex);
}

function getOutcomeLabel(outcome) {
  const normalized = String(outcome || "").toUpperCase();

  if (normalized === "ALIVE") {
    return "Hai";
  }

  if (normalized === "STILLBIRTH") {
    return "Stillbirth";
  }

  if (normalized === "DECEASED") {
    return "Amefariki";
  }

  if (normalized === "REFERRED") {
    return "Amehamishiwa";
  }

  if (normalized === "TRANSFERRED") {
    return "Amehamishwa";
  }

  return displayValue(outcome);
}

function getStatusConfig(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "ACTIVE") {
    return {
      label: "ACTIVE",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }

  if (normalized === "ARCHIVED") {
    return {
      label: "ARCHIVED",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
      icon: ShieldCheck,
    };
  }

  return {
    label: displayValue(status),
    className: "border-slate-200 bg-slate-100 text-slate-700",
    icon: AlertCircle,
  };
}

function getOutcomeConfig(outcome) {
  const normalized = String(outcome || "").toUpperCase();

  if (normalized === "ALIVE") {
    return {
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }

  if (
    normalized.includes("REFER") ||
    normalized.includes("TRANSFER")
  ) {
    return {
      className:
        "border-orange-200 bg-orange-50 text-orange-700",
      icon: AlertCircle,
    };
  }

  if (
    normalized === "STILLBIRTH" ||
    normalized === "DECEASED"
  ) {
    return {
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    };
  }

  return {
    className:
      "border-slate-200 bg-slate-100 text-slate-700",
    icon: Activity,
  };
}

function InfoItem({
  icon: Icon,
  label,
  value,
  tone = "blue",
}) {
  const tones = {
    blue: "border-blue-100 bg-blue-50/70 text-blue-700",
    rose: "border-rose-100 bg-rose-50/70 text-rose-700",
    green:
      "border-emerald-100 bg-emerald-50/70 text-emerald-700",
    purple:
      "border-purple-100 bg-purple-50/70 text-purple-700",
    orange:
      "border-orange-100 bg-orange-50/70 text-orange-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tones[tone]}`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-800">
            {displayValue(value)}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  tone = "blue",
}) {
  const headerTones = {
    blue: "from-blue-50 to-cyan-50 text-blue-700",
    rose: "from-rose-50 to-pink-50 text-rose-700",
    green:
      "from-emerald-50 to-teal-50 text-emerald-700",
    purple:
      "from-purple-50 to-indigo-50 text-purple-700",
    orange:
      "from-orange-50 to-amber-50 text-orange-700",
    slate:
      "from-slate-50 to-slate-100 text-slate-700",
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div
        className={`border-b border-slate-100 bg-gradient-to-r px-5 py-4 ${headerTones[tone]}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
            <Icon size={21} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function TextBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {displayValue(value)}
      </p>
    </div>
  );
}

export default function NewbornProfile() {
  const { id } = useParams();

  const [newborn, setNewborn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [archiveModalOpen, setArchiveModalOpen] =
    useState(false);

  const [archiveReason, setArchiveReason] = useState("");

  const [archiveValidationError, setArchiveValidationError] =
    useState("");

  const loadNewborn = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/maternity/newborn-records/${id}`
      );

      setNewborn(response.data);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Imeshindikana kupata taarifa za mtoto."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewborn();
  }, [id]);

  const isArchived =
    String(newborn?.recordStatus || "").toUpperCase() ===
    "ARCHIVED";

  const statusConfig = useMemo(
    () => getStatusConfig(newborn?.recordStatus),
    [newborn?.recordStatus]
  );

  const outcomeConfig = useMemo(
    () => getOutcomeConfig(newborn?.newbornOutcome),
    [newborn?.newbornOutcome]
  );

  const StatusIcon = statusConfig.icon;
  const OutcomeIcon = outcomeConfig.icon;

  const openArchiveModal = () => {
    if (!newborn || isArchived || actionLoading) {
      return;
    }

    setArchiveReason("");
    setArchiveValidationError("");
    setArchiveModalOpen(true);
  };

  const closeArchiveModal = () => {
    if (actionLoading) {
      return;
    }

    setArchiveModalOpen(false);
    setArchiveReason("");
    setArchiveValidationError("");
  };

  const handleArchive = async () => {
    if (!newborn || isArchived || actionLoading) {
      return;
    }

    const trimmedReason = archiveReason.trim();

    if (!trimmedReason) {
      setArchiveValidationError(
        "Tafadhali andika sababu ya ku-archive record hii."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");
      setArchiveValidationError("");

      await api.put(
        `/maternity/newborn-records/${newborn.id}/archive`,
        null,
        {
          params: {
            reason: trimmedReason,
          },
        }
      );

      setSuccess(
        "Record ya mtoto imehifadhiwa kama ARCHIVED."
      );

      setArchiveModalOpen(false);
      setArchiveReason("");

      await loadNewborn();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Imeshindikana ku-archive record ya mtoto."
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-center rounded-3xl border border-slate-200 bg-white py-24 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2
              className="animate-spin"
              size={34}
            />

            <p className="text-sm font-medium">
              Inapakia taarifa za mtoto...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !newborn) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/maternity/newborn-records"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Rudi Newborn Records
          </Link>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 shrink-0"
                size={22}
              />

              <div>
                <h2 className="font-bold">
                  Imeshindikana kupakia taarifa
                </h2>

                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!newborn) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Baby
            className="mx-auto text-slate-400"
            size={42}
          />

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Record ya mtoto haijapatikana
          </h2>

          <Link
            to="/maternity/newborn-records"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Rudi Newborn Records
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Back */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/maternity/newborn-records"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Rudi Newborn Records
          </Link>

          <div className="text-xs font-medium text-slate-400">
            Newborn Record #{newborn.id}
          </div>
        </div>

        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white shadow-xl">
          <div className="relative p-6 md:p-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                    <Baby size={32} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                        Newborn Profile
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.className}`}
                      >
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </div>

                    <h1 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">
                      {newborn.sex
                        ? `${getSexLabel(newborn.sex)} • Newborn`
                        : "Newborn Record"}
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                      Taarifa kamili za mtoto aliyezaliwa,
                      hali yake baada ya kuzaliwa na huduma
                      alizopokea.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold">
                        Patient:{" "}
                        {displayValue(newborn.patientNumber)}
                      </span>

                      <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold">
                        Labour #
                        {displayValue(newborn.labourRecordId)}
                      </span>

                      <span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold">
                        Pregnancy #
                        {displayValue(newborn.pregnancyId)}
                      </span>
                    </div>
                  </div>
                </div>

                {!isArchived && (
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/maternity/newborn-records/${newborn.id}/edit`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
                    >
                      <Edit3 size={17} />
                      Edit Record
                    </Link>

                    <button
                      type="button"
                      onClick={openArchiveModal}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ShieldCheck size={17} />
                      Archive
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Alerts */}
        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
            <CheckCircle2
              className="mt-0.5 shrink-0"
              size={20}
            />

            <div>
              <p className="font-bold">Imefanikiwa</p>

              <p className="mt-1 text-sm">{success}</p>
            </div>
          </div>
        )}

        {error && newborn && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
            <AlertCircle
              className="mt-0.5 shrink-0"
              size={20}
            />

            <div>
              <p className="font-bold">Kuna tatizo</p>

              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Archived banner */}
        {isArchived && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-amber-600"
                size={22}
              />

              <div>
                <h2 className="font-bold text-amber-900">
                  Record hii ime-ARCHIVED
                </h2>

                <p className="mt-1 text-sm text-amber-800">
                  Record za zamani zilizowekwa ARCHIVED
                  haziwezi kuhaririwa.
                </p>

                <div className="mt-3 rounded-xl border border-amber-200 bg-white/70 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                    Sababu ya Archive
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {displayValue(newborn.archiveReason)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mother & pregnancy */}
        <SectionCard
          icon={UserRound}
          title="Mama na Pregnancy"
          subtitle="Taarifa zinazohusiana na mama na ujauzito"
          tone="rose"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={UserRound}
              label="Jina la Mama"
              value={newborn.patientName}
              tone="rose"
            />

            <InfoItem
              icon={ShieldCheck}
              label="Patient Number"
              value={newborn.patientNumber}
              tone="blue"
            />

            <InfoItem
              icon={Activity}
              label="Pregnancy ID"
              value={newborn.pregnancyId}
              tone="purple"
            />

            <InfoItem
              icon={Stethoscope}
              label="Labour Record ID"
              value={newborn.labourRecordId}
              tone="orange"
            />
          </div>
        </SectionCard>

        {/* Birth information */}
        <SectionCard
          icon={Baby}
          title="Taarifa za Kuzaliwa"
          subtitle="Basic birth information"
          tone="blue"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={CalendarDays}
              label="Tarehe ya Kuzaliwa"
              value={formatDate(newborn.dateOfBirth)}
              tone="blue"
            />

            <InfoItem
              icon={Clock3}
              label="Muda wa Kuzaliwa"
              value={newborn.timeOfBirth}
              tone="purple"
            />

            <InfoItem
              icon={Baby}
              label="Jinsia"
              value={getSexLabel(newborn.sex)}
              tone="rose"
            />

            <InfoItem
              icon={Activity}
              label="Birth Order"
              value={newborn.birthOrder}
              tone="green"
            />
          </div>
        </SectionCard>

        {/* Measurements */}
        <SectionCard
          icon={Weight}
          title="Vipimo vya Mtoto"
          subtitle="Anthropometric measurements at birth"
          tone="green"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={Weight}
              label="Birth Weight"
              value={
                newborn.birthWeight !== null &&
                newborn.birthWeight !== undefined
                  ? `${newborn.birthWeight} kg`
                  : "—"
              }
              tone="green"
            />

            <InfoItem
              icon={Activity}
              label="Birth Length"
              value={
                newborn.birthLength !== null &&
                newborn.birthLength !== undefined
                  ? `${newborn.birthLength} cm`
                  : "—"
              }
              tone="blue"
            />

            <InfoItem
              icon={Activity}
              label="Head Circumference"
              value={
                newborn.headCircumference !== null &&
                newborn.headCircumference !== undefined
                  ? `${newborn.headCircumference} cm`
                  : "—"
              }
              tone="purple"
            />
          </div>
        </SectionCard>

        {/* APGAR */}
        <SectionCard
          icon={HeartPulse}
          title="APGAR Score"
          subtitle="Assessment at 1, 5 and 10 minutes"
          tone="purple"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-purple-500">
                1 Minute
              </p>

              <p className="mt-2 text-4xl font-extrabold text-purple-700">
                {displayValue(newborn.apgarOneMinute)}
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                5 Minutes
              </p>

              <p className="mt-2 text-4xl font-extrabold text-indigo-700">
                {displayValue(newborn.apgarFiveMinutes)}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                10 Minutes
              </p>

              <p className="mt-2 text-4xl font-extrabold text-blue-700">
                {displayValue(newborn.apgarTenMinutes)}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Condition at birth */}
        <SectionCard
          icon={HeartPulse}
          title="Hali ya Mtoto Wakati wa Kuzaliwa"
          subtitle="Initial newborn condition"
          tone="rose"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={HeartPulse}
              label="Condition at Birth"
              value={newborn.conditionAtBirth}
              tone="rose"
            />

            <InfoItem
              icon={Activity}
              label="Cry at Birth"
              value={newborn.cryAtBirth}
              tone="green"
            />

            <InfoItem
              icon={Activity}
              label="Breathing"
              value={newborn.breathingAtBirth}
              tone="blue"
            />

            <InfoItem
              icon={Activity}
              label="Muscle Tone"
              value={newborn.muscleTone}
              tone="purple"
            />

            <InfoItem
              icon={Activity}
              label="Skin Colour"
              value={newborn.skinColour}
              tone="rose"
            />
          </div>
        </SectionCard>

        {/* Resuscitation */}
        <SectionCard
          icon={Syringe}
          title="Resuscitation"
          subtitle="Huduma za kuokoa/kuimarisha hali ya mtoto baada ya kuzaliwa"
          tone="orange"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={
                newborn.resuscitationRequired
                  ? AlertCircle
                  : CheckCircle2
              }
              label="Resuscitation Required"
              value={formatBoolean(
                newborn.resuscitationRequired
              )}
              tone={
                newborn.resuscitationRequired
                  ? "orange"
                  : "green"
              }
            />

            <InfoItem
              icon={Activity}
              label="Method"
              value={newborn.resuscitationMethod}
              tone="orange"
            />

            <InfoItem
              icon={Clock3}
              label="Duration"
              value={newborn.resuscitationDuration}
              tone="orange"
            />
          </div>
        </SectionCard>

        {/* Clinical condition */}
        <SectionCard
          icon={Thermometer}
          title="Clinical Condition"
          subtitle="Vital signs and clinical assessment"
          tone="blue"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={Thermometer}
              label="Temperature"
              value={
                newborn.temperature !== null &&
                newborn.temperature !== undefined
                  ? `${newborn.temperature} °C`
                  : "—"
              }
              tone="orange"
            />

            <InfoItem
              icon={HeartPulse}
              label="Heart Rate"
              value={
                newborn.heartRate !== null &&
                newborn.heartRate !== undefined
                  ? `${newborn.heartRate} bpm`
                  : "—"
              }
              tone="rose"
            />

            <InfoItem
              icon={Activity}
              label="Respiratory Rate"
              value={
                newborn.respiratoryRate !== null &&
                newborn.respiratoryRate !== undefined
                  ? `${newborn.respiratoryRate} /min`
                  : "—"
              }
              tone="blue"
            />

            <InfoItem
              icon={Stethoscope}
              label="Clinical Condition"
              value={newborn.clinicalCondition}
              tone="green"
            />
          </div>

          <div className="mt-4">
            <TextBlock
              label="Congenital Abnormalities"
              value={newborn.congenitalAbnormalities}
            />
          </div>
        </SectionCard>

        {/* Immediate newborn care */}
        <SectionCard
          icon={Milk}
          title="Immediate Newborn Care"
          subtitle="Huduma za mwanzo baada ya kuzaliwa"
          tone="green"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={Milk}
              label="Breastfeeding Started"
              value={formatBoolean(
                newborn.breastfeedingStarted
              )}
              tone="green"
            />

            <InfoItem
              icon={Clock3}
              label="Breastfeeding Time"
              value={newborn.breastfeedingTime}
              tone="blue"
            />

            <InfoItem
              icon={Baby}
              label="Skin-to-Skin"
              value={formatBoolean(newborn.skinToSkin)}
              tone="rose"
            />

            <InfoItem
              icon={Syringe}
              label="Vitamin K"
              value={formatBoolean(newborn.vitaminKGiven)}
              tone="purple"
            />

            <InfoItem
              icon={ShieldCheck}
              label="BCG"
              value={formatBoolean(newborn.bcgGiven)}
              tone="green"
            />

            <InfoItem
              icon={ShieldCheck}
              label="OPV"
              value={formatBoolean(newborn.opvGiven)}
              tone="blue"
            />
          </div>
        </SectionCard>

        {/* Outcome & referral */}
        <SectionCard
          icon={MapPin}
          title="Outcome & Referral"
          subtitle="Hali ya mwisho na mahali mtoto alipohudumiwa"
          tone="orange"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${outcomeConfig.className}`}
                >
                  <OutcomeIcon size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Newborn Outcome
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {getOutcomeLabel(
                      newborn.newbornOutcome
                    )}
                  </p>
                </div>
              </div>
            </div>

            <InfoItem
              icon={MapPin}
              label="Place of Care"
              value={newborn.placeOfCare}
              tone="blue"
            />

            <InfoItem
              icon={
                newborn.referralRequired
                  ? AlertCircle
                  : CheckCircle2
              }
              label="Referral Required"
              value={formatBoolean(newborn.referralRequired)}
              tone={
                newborn.referralRequired
                  ? "orange"
                  : "green"
              }
            />
          </div>

          {newborn.referralRequired && (
            <div className="mt-4">
              <TextBlock
                label="Referral Reason"
                value={newborn.referralReason}
              />
            </div>
          )}
        </SectionCard>

        {/* Clinical management */}
        <SectionCard
          icon={Stethoscope}
          title="Clinical Management"
          subtitle="Assessment, treatment and clinical notes"
          tone="purple"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <TextBlock
              label="Assessment"
              value={newborn.assessment}
            />

            <TextBlock
              label="Treatment"
              value={newborn.treatment}
            />

            <TextBlock
              label="Notes"
              value={newborn.notes}
            />
          </div>
        </SectionCard>

        {/* Record history */}
        <SectionCard
          icon={ShieldCheck}
          title="Record History"
          subtitle="Taarifa za mfumo na status ya record"
          tone="slate"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={ShieldCheck}
              label="Record Status"
              value={newborn.recordStatus}
              tone={isArchived ? "slate" : "green"}
            />

            <InfoItem
              icon={CalendarDays}
              label="Created At"
              value={formatDateTime(newborn.createdAt)}
              tone="blue"
            />

            <InfoItem
              icon={Clock3}
              label="Updated At"
              value={formatDateTime(newborn.updatedAt)}
              tone="purple"
            />

            <InfoItem
              icon={Pill}
              label="Record ID"
              value={newborn.id}
              tone="slate"
            />
          </div>

          {isArchived && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <XCircle
                  className="mt-0.5 shrink-0 text-amber-600"
                  size={19}
                />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                    Archive Reason
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {displayValue(newborn.archiveReason)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Bottom actions */}
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/maternity/newborn-records"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Rudi kwenye Records
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/maternity/labour-records/${newborn.labourRecordId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
            >
              <Stethoscope size={17} />
              Labour Record
            </Link>

            {!isArchived && (
              <>
                <Link
                  to={`/maternity/newborn-records/${newborn.id}/edit`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Edit3 size={17} />
                  Edit Newborn
                </Link>

                <button
                  type="button"
                  onClick={openArchiveModal}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShieldCheck size={17} />
                  Archive Record
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      {archiveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !actionLoading
            ) {
              closeArchiveModal();
            }
          }}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-modal-title"
          >
            {/* Modal Header */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-amber-700">
                  <ShieldCheck size={23} />
                </div>

                <div className="min-w-0">
                  <h2
                    id="archive-modal-title"
                    className="text-lg font-extrabold text-slate-800"
                  >
                    Thibitisha Archive
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Unataka ku-archive record ya mtoto
                    <span className="font-bold text-slate-800">
                      {" "}
                      #{newborn.id}
                    </span>
                    ?
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeArchiveModal}
                  disabled={actionLoading}
                  className="ml-auto rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Funga"
                >
                  <XCircle size={21} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="mt-0.5 shrink-0 text-amber-600"
                    size={20}
                  />

                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      Muhimu
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Record hii haitafutwa kwenye database.
                      Itawekwa kama{" "}
                      <strong>ARCHIVED</strong> na
                      haitaruhusiwa kuhaririwa.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="archiveReason"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Sababu ya Archive
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  id="archiveReason"
                  value={archiveReason}
                  onChange={(event) => {
                    setArchiveReason(event.target.value);

                    if (archiveValidationError) {
                      setArchiveValidationError("");
                    }
                  }}
                  rows={4}
                  maxLength={500}
                  autoFocus
                  disabled={actionLoading}
                  placeholder="Andika sababu ya ku-archive record hii..."
                  className={`w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    archiveValidationError
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  } disabled:cursor-not-allowed disabled:bg-slate-50`}
                />

                <div className="mt-2 flex items-start justify-between gap-3">
                  {archiveValidationError ? (
                    <p className="text-xs font-semibold text-red-600">
                      {archiveValidationError}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Sababu hii itahifadhiwa kwenye historia
                      ya record.
                    </p>
                  )}

                  <span className="shrink-0 text-xs font-medium text-slate-400">
                    {archiveReason.length}/500
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeArchiveModal}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircle size={17} />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleArchive}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={17}
                    />
                    Ina-archive...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={17} />
                    Archive Record
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}