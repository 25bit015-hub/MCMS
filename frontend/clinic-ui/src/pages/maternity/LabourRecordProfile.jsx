import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Baby,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  HeartPulse,
  Loader2,
  Lock,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "ACTIVE") return "Active";
  if (normalized === "ARCHIVED") return "Archived";

  return status || "—";
}

function statusClasses(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "ARCHIVED") {
    return "border-white/40 bg-white/20 text-white";
  }

  return "border-emerald-200 bg-emerald-100 text-emerald-800";
}

function labourStageLabel(value) {
  const labels = {
    FIRST_STAGE: "First Stage",
    SECOND_STAGE: "Second Stage",
    THIRD_STAGE: "Third Stage",
    FOURTH_STAGE: "Fourth Stage",
    COMPLETED: "Completed",
  };

  return labels[value] || value || "—";
}

function deliveryModeLabel(value) {
  const labels = {
    SVD: "Spontaneous Vaginal Delivery",
    NORMAL: "Normal Vaginal Delivery",
    C_SECTION: "Caesarean Section",
    ASSISTED: "Assisted Vaginal Delivery",
    VACUUM: "Vacuum Delivery",
    FORCEPS: "Forceps Delivery",
  };

  return labels[value] || value || "—";
}

function InfoItem({
  label,
  value,
  tone = "slate",
}) {
  const toneClasses = {
    slate: "border-slate-200 bg-slate-50/70",
    blue: "border-blue-100 bg-blue-50/60",
    rose: "border-rose-100 bg-rose-50/60",
    green: "border-emerald-100 bg-emerald-50/60",
    orange: "border-orange-100 bg-orange-50/60",
    purple: "border-purple-100 bg-purple-50/60",
    amber: "border-amber-100 bg-amber-50/60",
  };

  const labelClasses = {
    slate: "text-slate-400",
    blue: "text-blue-500",
    rose: "text-rose-500",
    green: "text-emerald-600",
    orange: "text-orange-500",
    purple: "text-purple-500",
    amber: "text-amber-600",
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
        toneClasses[tone] || toneClasses.slate
      }`}
    >
      <p
        className={`text-[11px] font-bold uppercase tracking-[0.08em] ${
          labelClasses[tone] || labelClasses.slate
        }`}
      >
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-bold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  tone = "rose",
}) {
  const themes = {
    rose: {
      wrapper: "border-rose-100",
      header: "from-rose-50 via-white to-pink-50",
      icon: "bg-rose-100 text-rose-600 ring-rose-200",
      line: "bg-rose-500",
    },
    blue: {
      wrapper: "border-blue-100",
      header: "from-blue-50 via-white to-sky-50",
      icon: "bg-blue-100 text-blue-600 ring-blue-200",
      line: "bg-blue-500",
    },
    green: {
      wrapper: "border-emerald-100",
      header: "from-emerald-50 via-white to-green-50",
      icon: "bg-emerald-100 text-emerald-600 ring-emerald-200",
      line: "bg-emerald-500",
    },
    orange: {
      wrapper: "border-orange-100",
      header: "from-orange-50 via-white to-amber-50",
      icon: "bg-orange-100 text-orange-600 ring-orange-200",
      line: "bg-orange-500",
    },
    purple: {
      wrapper: "border-purple-100",
      header: "from-purple-50 via-white to-violet-50",
      icon: "bg-purple-100 text-purple-600 ring-purple-200",
      line: "bg-purple-500",
    },
    slate: {
      wrapper: "border-slate-200",
      header: "from-slate-50 via-white to-slate-100",
      icon: "bg-slate-100 text-slate-600 ring-slate-200",
      line: "bg-slate-500",
    },
    amber: {
      wrapper: "border-amber-100",
      header: "from-amber-50 via-white to-yellow-50",
      icon: "bg-amber-100 text-amber-600 ring-amber-200",
      line: "bg-amber-500",
    },
  };

  const theme = themes[tone] || themes.rose;

  return (
    <section
      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-300 hover:shadow-md ${theme.wrapper}`}
    >
      <div
        className={`relative border-b border-slate-100 bg-gradient-to-r px-5 py-4 ${theme.header}`}
      >
        <div
          className={`absolute bottom-0 left-0 top-0 w-1 ${theme.line}`}
        />

        <div className="flex items-start gap-3 pl-1">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${theme.icon}`}
          >
            <Icon size={21} />
          </div>

          <div>
            <h2 className="text-base font-black text-slate-900">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-0.5 text-xs font-medium text-slate-500">
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

function TextBlock({
  label,
  value,
  tone = "slate",
}) {
  const classes = {
    slate: "border-slate-200 bg-slate-50/70",
    blue: "border-blue-100 bg-blue-50/50",
    rose: "border-rose-100 bg-rose-50/50",
    green: "border-emerald-100 bg-emerald-50/50",
    orange: "border-orange-100 bg-orange-50/50",
    purple: "border-purple-100 bg-purple-50/50",
    amber: "border-amber-100 bg-amber-50/50",
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${
        classes[tone] || classes.slate
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}

export default function LabourRecordProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [archiving, setArchiving] = useState(false);

  async function loadRecord() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/maternity/labour-records/${id}`
      );

      setRecord(response.data);
    } catch (err) {
      console.error("Failed to load Labour record:", err);

      setError(
        err.response?.data?.message ||
          "Imeshindikana kupakia taarifa za Labour Record."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecord();
  }, [id]);

  const isArchived = useMemo(
    () =>
      String(record?.recordStatus || "").toUpperCase() ===
      "ARCHIVED",
    [record]
  );

  async function handleArchive() {
    if (!record || isArchived) return;

    const confirmed = window.confirm(
      "Una uhakika unataka ku-archive Labour Record hii? Taarifa hii itabaki kwenye historia lakini haitaruhusiwa kuhaririwa."
    );

    if (!confirmed) return;

    try {
      setArchiving(true);
      setError("");

      const reason =
        window.prompt(
          "Weka sababu ya ku-archive Labour Record:",
          "Labour record completed"
        ) || "Labour record archived";

      await api.put(
        `/maternity/labour-records/${record.id}/archive`,
        null,
        {
          params: {
            reason,
          },
        }
      );

      await loadRecord();
    } catch (err) {
      console.error("Failed to archive Labour record:", err);

      setError(
        err.response?.data?.message ||
          "Imeshindikana ku-archive Labour Record."
      );
    } finally {
      setArchiving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
              <Loader2
                className="animate-spin text-rose-600"
                size={28}
              />
            </div>

            <p className="text-sm font-semibold text-slate-600">
              Inapakia taarifa za Labour Record...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="min-h-[70vh] bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/maternity/labour-records"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-rose-600"
          >
            <ArrowLeft size={17} />
            Rudi Labour Records
          </Link>

          <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <AlertTriangle size={22} />
                </div>

                <div>
                  <h2 className="font-black text-red-800">
                    Imeshindikana kupakia taarifa
                  </h2>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!record) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-rose-50/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-blue-900 to-rose-800 text-white shadow-xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <Link
                  to="/maternity/labour-records"
                  className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur transition hover:bg-white/20"
                  title="Rudi Labour Records"
                >
                  <ArrowLeft size={20} />
                </Link>

                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                      <HeartPulse size={14} />
                      Labour & Delivery
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black ${statusClasses(
                        record.recordStatus
                      )}`}
                    >
                      {isArchived ? (
                        <Lock size={13} />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}

                      {statusLabel(record.recordStatus)}
                    </span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                    Labour Record #{record.id}
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                    Taarifa kamili za labour, maternal assessment,
                    fetal assessment na delivery ya mgonjwa.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {!isArchived && (
                  <>
                    <Link
                      to={`/maternity/labour-records/${record.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-rose-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-rose-50"
                    >
                      <Edit3 size={17} />
                      Hariri
                    </Link>

                    <button
                      type="button"
                      onClick={handleArchive}
                      disabled={archiving}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {archiving ? (
                        <Loader2
                          className="animate-spin"
                          size={17}
                        />
                      ) : (
                        <Lock size={17} />
                      )}

                      Archive
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Header mini summary */}
            <div className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Patient
                </p>
                <p className="mt-1 truncate text-sm font-black">
                  {record.patientName || "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Patient Number
                </p>
                <p className="mt-1 text-sm font-black">
                  {record.patientNumber || "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Pregnancy
                </p>
                <p className="mt-1 text-sm font-black">
                  #{record.pregnancyId}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Admission
                </p>
                <p className="mt-1 text-sm font-black">
                  {formatDate(record.admissionDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-red-600"
                size={19}
              />

              <span className="text-sm font-semibold text-red-700">
                {error}
              </span>
            </div>
          </div>
        )}

        {/* Patient + Admission */}
        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard
            icon={UserRound}
            title="Taarifa za Mgonjwa"
            subtitle="Patient information"
            tone="blue"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                label="Jina la Mgonjwa"
                value={record.patientName}
                tone="blue"
              />

              <InfoItem
                label="Patient Number"
                value={record.patientNumber}
                tone="blue"
              />

              <InfoItem
                label="Patient ID"
                value={record.patientId}
                tone="blue"
              />

              <InfoItem
                label="Pregnancy ID"
                value={record.pregnancyId}
                tone="rose"
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={CalendarDays}
            title="Admission"
            subtitle="Taarifa za kuwasili labour ward"
            tone="orange"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                label="Admission Date"
                value={formatDate(record.admissionDate)}
                tone="orange"
              />

              <InfoItem
                label="Admission Time"
                value={record.admissionTime}
                tone="orange"
              />

              <InfoItem
                label="Admission Reason"
                value={record.admissionReason}
                tone="orange"
              />

              <InfoItem
                label="Labour Onset"
                value={record.labourOnset}
                tone="orange"
              />
            </div>
          </SectionCard>
        </div>

        {/* Labour Progress */}
        <SectionCard
          icon={Stethoscope}
          title="Maendeleo ya Labour"
          subtitle="Labour progress and cervical assessment"
          tone="orange"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Labour Stage"
              value={labourStageLabel(record.labourStage)}
              tone="orange"
            />

            <InfoItem
              label="Membrane Status"
              value={record.membraneStatus}
              tone="orange"
            />

            <InfoItem
              label="Liquor"
              value={record.liquor}
              tone="orange"
            />

            <InfoItem
              label="Cervical Dilation"
              value={record.cervicalDilation}
              tone="orange"
            />

            <InfoItem
              label="Cervical Effacement"
              value={record.cervicalEffacement}
              tone="orange"
            />

            <InfoItem
              label="Fetal Descent"
              value={record.fetalDescent}
              tone="orange"
            />

            <InfoItem
              label="Contraction Frequency"
              value={record.contractionFrequency}
              tone="orange"
            />

            <InfoItem
              label="Contraction Duration"
              value={record.contractionDuration}
              tone="orange"
            />
          </div>
        </SectionCard>

        {/* Maternal */}
        <SectionCard
          icon={HeartPulse}
          title="Taarifa za Mama"
          subtitle="Maternal assessment and vital signs"
          tone="rose"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Weight"
              value={
                record.maternalWeight != null
                  ? `${record.maternalWeight} kg`
                  : "—"
              }
              tone="rose"
            />

            <InfoItem
              label="Blood Pressure"
              value={
                record.maternalBpSystolic != null &&
                record.maternalBpDiastolic != null
                  ? `${record.maternalBpSystolic}/${record.maternalBpDiastolic} mmHg`
                  : "—"
              }
              tone="rose"
            />

            <InfoItem
              label="Pulse"
              value={
                record.maternalPulse != null
                  ? `${record.maternalPulse} bpm`
                  : "—"
              }
              tone="rose"
            />

            <InfoItem
              label="Temperature"
              value={
                record.maternalTemperature != null
                  ? `${record.maternalTemperature} °C`
                  : "—"
              }
              tone="rose"
            />

            <InfoItem
              label="Respiratory Rate"
              value={
                record.maternalRespiratoryRate != null
                  ? `${record.maternalRespiratoryRate}/min`
                  : "—"
              }
              tone="rose"
            />

            <InfoItem
              label="Condition"
              value={record.maternalCondition}
              tone="green"
            />

            <InfoItem
              label="Pain Score"
              value={
                record.painScore != null
                  ? `${record.painScore}/10`
                  : "—"
              }
              tone="rose"
            />

            <InfoItem
              label="Bleeding"
              value={record.bleeding}
              tone="rose"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <TextBlock
              label="Complications"
              value={record.complications}
              tone="rose"
            />
          </div>
        </SectionCard>

        {/* Fetal */}
        <SectionCard
          icon={Baby}
          title="Taarifa za Mtoto"
          subtitle="Fetal assessment"
          tone="purple"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Fetal Heart Rate"
              value={
                record.fetalHeartRate != null
                  ? `${record.fetalHeartRate} bpm`
                  : "—"
              }
              tone="purple"
            />

            <InfoItem
              label="Fetal Condition"
              value={record.fetalCondition}
              tone="purple"
            />

            <InfoItem
              label="Presentation"
              value={record.fetalPresentation}
              tone="purple"
            />

            <InfoItem
              label="Lie"
              value={record.fetalLie}
              tone="purple"
            />

            <InfoItem
              label="Position"
              value={record.fetalPosition}
              tone="purple"
            />

            <InfoItem
              label="Fetal Movement"
              value={record.fetalMovement}
              tone="green"
            />
          </div>
        </SectionCard>

        {/* Delivery */}
        <SectionCard
          icon={Baby}
          title="Delivery"
          subtitle="Taarifa za kujifungua"
          tone="green"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Delivery Date"
              value={formatDate(record.deliveryDate)}
              tone="green"
            />

            <InfoItem
              label="Delivery Time"
              value={record.deliveryTime}
              tone="green"
            />

            <InfoItem
              label="Delivery Mode"
              value={deliveryModeLabel(record.deliveryMode)}
              tone="green"
            />

            <InfoItem
              label="Delivery Outcome"
              value={record.deliveryOutcome}
              tone="green"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <TextBlock
              label="Delivery Indication"
              value={record.deliveryIndication}
              tone="green"
            />

            <TextBlock
              label="Delivery Complications"
              value={record.deliveryComplications}
              tone="orange"
            />
          </div>
        </SectionCard>

        {/* Postpartum */}
        <SectionCard
          icon={ShieldCheck}
          title="Baada ya Kujifungua"
          subtitle="Maternal postpartum and placenta assessment"
          tone="green"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Maternal Outcome"
              value={record.maternalOutcome}
              tone="green"
            />

            <InfoItem
              label="Postpartum Bleeding"
              value={record.postpartumBleeding}
              tone="green"
            />

            <InfoItem
              label="Placenta Status"
              value={record.placentaStatus}
              tone="green"
            />

            <InfoItem
              label="Estimated Blood Loss"
              value={
                record.estimatedBloodLoss != null
                  ? `${record.estimatedBloodLoss} mL`
                  : "—"
              }
              tone="green"
            />
          </div>
        </SectionCard>

        {/* Clinical */}
        <SectionCard
          icon={FileText}
          title="Clinical Information"
          subtitle="Assessment, diagnosis and management"
          tone="purple"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <TextBlock
              label="Assessment"
              value={record.assessment}
              tone="purple"
            />

            <TextBlock
              label="Diagnosis"
              value={record.diagnosis}
              tone="purple"
            />

            <TextBlock
              label="Treatment"
              value={record.treatment}
              tone="purple"
            />

            <TextBlock
              label="Medication"
              value={record.medication}
              tone="purple"
            />

            <TextBlock
              label="Referral"
              value={record.referral}
              tone="blue"
            />

            <TextBlock
              label="Notes"
              value={record.notes}
              tone="slate"
            />
          </div>
        </SectionCard>

        {/* Record Protection */}
        <SectionCard
          icon={Lock}
          title="Record Protection & History"
          subtitle="Audit information ya Labour Record"
          tone={isArchived ? "amber" : "blue"}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Record Status"
              value={statusLabel(record.recordStatus)}
              tone={isArchived ? "amber" : "green"}
            />

            <InfoItem
              label="Created At"
              value={formatDateTime(record.createdAt)}
              tone="blue"
            />

            <InfoItem
              label="Updated At"
              value={formatDateTime(record.updatedAt)}
              tone="blue"
            />

            <InfoItem
              label="Record ID"
              value={record.id}
              tone="slate"
            />
          </div>

          {isArchived && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Lock size={19} />
                </div>

                <div>
                  <p className="text-sm font-black text-amber-800">
                    Labour Record hii ime-archive
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    Record hii ni sehemu ya historia ya mgonjwa na
                    haiwezi kuhaririwa.
                  </p>

                  {record.archiveReason && (
                    <p className="mt-2 text-sm text-amber-800">
                      <span className="font-black">
                        Sababu:
                      </span>{" "}
                      {record.archiveReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Footer Actions */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link
              to="/maternity/labour-records"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft size={17} />
              Rudi Labour Records
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/maternity/pregnancies/${record.pregnancyId}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-100"
              >
                <UserRound size={17} />
                Fungua Pregnancy
              </Link>

              {!isArchived && (
                <Link
                  to={`/maternity/labour-records/${record.id}/edit`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Edit3 size={17} />
                  Hariri Labour Record
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pb-4 text-xs font-medium text-slate-400">
          <Clock3 size={14} />
          <span>
            Record ID: {record.id} · Pregnancy ID:{" "}
            {record.pregnancyId}
          </span>
        </div>
      </div>
    </div>
  );
}