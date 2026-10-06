import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Baby,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Loader2,
  MapPin,
  Milk,
  Save,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Thermometer,
  UserRound,
  Weight,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

const initialForm = {
  labourRecordId: "",
  dateOfBirth: "",
  timeOfBirth: "",
  sex: "",
  birthOrder: "",

  birthWeight: "",
  birthLength: "",
  headCircumference: "",

  apgarOneMinute: "",
  apgarFiveMinutes: "",
  apgarTenMinutes: "",

  conditionAtBirth: "",
  cryAtBirth: "",
  breathingAtBirth: "",
  muscleTone: "",
  skinColour: "",

  resuscitationRequired: false,
  resuscitationMethod: "",
  resuscitationDuration: "",

  congenitalAbnormalities: "",
  clinicalCondition: "",
  temperature: "",
  heartRate: "",
  respiratoryRate: "",

  breastfeedingStarted: false,
  breastfeedingTime: "",
  skinToSkin: false,
  vitaminKGiven: false,
  bcgGiven: false,
  opvGiven: false,

  newbornOutcome: "",
  placeOfCare: "",
  referralRequired: false,
  referralReason: "",

  assessment: "",
  treatment: "",
  notes: "",
};

function getErrorMessage(
  error,
  fallback = "Imeshindikana kufanya operesheni."
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number) ? null : number;
}

function normalizePayload(form) {
  return {
    labourRecordId: Number(form.labourRecordId),

    dateOfBirth: form.dateOfBirth || null,
    timeOfBirth: form.timeOfBirth || null,
    sex: form.sex || null,
    birthOrder: normalizeNumber(form.birthOrder),

    birthWeight: normalizeNumber(form.birthWeight),
    birthLength: normalizeNumber(form.birthLength),
    headCircumference: normalizeNumber(form.headCircumference),

    apgarOneMinute: normalizeNumber(form.apgarOneMinute),
    apgarFiveMinutes: normalizeNumber(form.apgarFiveMinutes),
    apgarTenMinutes: normalizeNumber(form.apgarTenMinutes),

    conditionAtBirth: form.conditionAtBirth || null,
    cryAtBirth: form.cryAtBirth || null,
    breathingAtBirth: form.breathingAtBirth || null,
    muscleTone: form.muscleTone || null,
    skinColour: form.skinColour || null,

    resuscitationRequired: Boolean(form.resuscitationRequired),
    resuscitationMethod:
      form.resuscitationMethod || null,
    resuscitationDuration:
      form.resuscitationDuration || null,

    congenitalAbnormalities:
      form.congenitalAbnormalities || null,
    clinicalCondition:
      form.clinicalCondition || null,
    temperature: normalizeNumber(form.temperature),
    heartRate: normalizeNumber(form.heartRate),
    respiratoryRate: normalizeNumber(form.respiratoryRate),

    breastfeedingStarted:
      Boolean(form.breastfeedingStarted),
    breastfeedingTime:
      form.breastfeedingTime || null,
    skinToSkin: Boolean(form.skinToSkin),
    vitaminKGiven: Boolean(form.vitaminKGiven),
    bcgGiven: Boolean(form.bcgGiven),
    opvGiven: Boolean(form.opvGiven),

    newbornOutcome: form.newbornOutcome || null,
    placeOfCare: form.placeOfCare || null,
    referralRequired: Boolean(form.referralRequired),
    referralReason: form.referralReason || null,

    assessment: form.assessment || null,
    treatment: form.treatment || null,
    notes: form.notes || null,
  };
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  tone = "blue",
}) {
  const tones = {
    blue: "from-blue-50 to-cyan-50 text-blue-700",
    rose: "from-rose-50 to-pink-50 text-rose-700",
    green: "from-emerald-50 to-teal-50 text-emerald-700",
    purple: "from-purple-50 to-indigo-50 text-purple-700",
    orange: "from-orange-50 to-amber-50 text-orange-700",
    slate: "from-slate-50 to-slate-100 text-slate-700",
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div
        className={`border-b border-slate-100 bg-gradient-to-r px-5 py-4 ${tones[tone]}`}
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

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children}

      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const textareaClass =
  "w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function ToggleField({
  label,
  checked,
  onChange,
  description,
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />

      <span>
        <span className="block text-sm font-bold text-slate-700">
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export default function EditNewborn() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [newborn, setNewborn] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [patientName, setPatientName] = useState("");
  const [patientNumber, setPatientNumber] =
    useState("");

  const isArchived =
    String(newborn?.recordStatus || "").toUpperCase() ===
    "ARCHIVED";

  useEffect(() => {
    const loadNewborn = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/maternity/newborn-records/${id}`
        );

        const data = response.data;

        setNewborn(data);
        setPatientName(data.patientName || "");
        setPatientNumber(data.patientNumber || "");

        setForm({
          labourRecordId:
            data.labourRecordId ?? "",
          dateOfBirth:
            data.dateOfBirth ?? "",
          timeOfBirth:
            data.timeOfBirth ?? "",
          sex:
            data.sex ?? "",
          birthOrder:
            data.birthOrder ?? "",

          birthWeight:
            data.birthWeight ?? "",
          birthLength:
            data.birthLength ?? "",
          headCircumference:
            data.headCircumference ?? "",

          apgarOneMinute:
            data.apgarOneMinute ?? "",
          apgarFiveMinutes:
            data.apgarFiveMinutes ?? "",
          apgarTenMinutes:
            data.apgarTenMinutes ?? "",

          conditionAtBirth:
            data.conditionAtBirth ?? "",
          cryAtBirth:
            data.cryAtBirth ?? "",
          breathingAtBirth:
            data.breathingAtBirth ?? "",
          muscleTone:
            data.muscleTone ?? "",
          skinColour:
            data.skinColour ?? "",

          resuscitationRequired:
            Boolean(data.resuscitationRequired),
          resuscitationMethod:
            data.resuscitationMethod ?? "",
          resuscitationDuration:
            data.resuscitationDuration ?? "",

          congenitalAbnormalities:
            data.congenitalAbnormalities ?? "",
          clinicalCondition:
            data.clinicalCondition ?? "",
          temperature:
            data.temperature ?? "",
          heartRate:
            data.heartRate ?? "",
          respiratoryRate:
            data.respiratoryRate ?? "",

          breastfeedingStarted:
            Boolean(data.breastfeedingStarted),
          breastfeedingTime:
            data.breastfeedingTime ?? "",
          skinToSkin:
            Boolean(data.skinToSkin),
          vitaminKGiven:
            Boolean(data.vitaminKGiven),
          bcgGiven:
            Boolean(data.bcgGiven),
          opvGiven:
            Boolean(data.opvGiven),

          newbornOutcome:
            data.newbornOutcome ?? "",
          placeOfCare:
            data.placeOfCare ?? "",
          referralRequired:
            Boolean(data.referralRequired),
          referralReason:
            data.referralReason ?? "",

          assessment:
            data.assessment ?? "",
          treatment:
            data.treatment ?? "",
          notes:
            data.notes ?? "",
        });
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

    loadNewborn();
  }, [id]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isArchived) {
      setError(
        "Record hii ime-ARCHIVED na haiwezi kuhaririwa."
      );
      return;
    }

    setError("");
    setSuccess("");

    if (!form.labourRecordId) {
      setError("Labour Record inahitajika.");
      return;
    }

    if (!form.dateOfBirth) {
      setError("Tarehe ya kuzaliwa inahitajika.");
      return;
    }

    if (!form.timeOfBirth) {
      setError("Muda wa kuzaliwa unahitajika.");
      return;
    }

    if (!form.sex) {
      setError("Tafadhali chagua jinsia ya mtoto.");
      return;
    }

    if (!form.birthOrder) {
      setError("Birth order inahitajika.");
      return;
    }

    if (
      form.resuscitationRequired &&
      !form.resuscitationMethod.trim()
    ) {
      setError(
        "Tafadhali weka njia ya resuscitation."
      );
      return;
    }

    if (
      form.referralRequired &&
      !form.referralReason.trim()
    ) {
      setError("Tafadhali weka sababu ya referral.");
      return;
    }

    try {
      setSaving(true);

      const payload = normalizePayload(form);

      const response = await api.put(
        `/maternity/newborn-records/${id}`,
        payload
      );

      setSuccess(
        "Taarifa za mtoto zimeboreshwa kwa mafanikio."
      );

      setTimeout(() => {
        navigate(
          `/maternity/newborn-records/${response.data.id}`
        );
      }, 700);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Imeshindikana kuhifadhi mabadiliko."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto flex max-w-5xl items-center justify-center rounded-3xl border border-slate-200 bg-white py-24 shadow-sm">
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
            to={`/maternity/newborn-records/${id}`}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Rudi kwenye Profile
          </Link>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <p className="font-bold">
              Imeshindikana kupakia taarifa
            </p>

            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isArchived) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            to={`/maternity/newborn-records/${id}`}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Rudi kwenye Newborn Profile
          </Link>

          <div className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                  <ShieldCheck size={28} />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800">
                    Record Ime-ARCHIVED
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Record hii ni historical record na
                    haiwezi kuhaririwa.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Mtoto
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {patientName || "Newborn"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Patient Number
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {patientNumber || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  Sababu ya Archive
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {newborn.archiveReason || "—"}
                </p>
              </div>

              <Link
                to={`/maternity/newborn-records/${id}`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                <ArrowLeft size={17} />
                Rudi kwenye Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Header */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white shadow-xl">
            <div className="relative p-6 md:p-8">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <Link
                  to={`/maternity/newborn-records/${id}`}
                  className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-100 hover:text-white"
                >
                  <ArrowLeft size={18} />
                  Rudi kwenye Newborn Profile
                </Link>

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                      <Baby size={32} />
                    </div>

                    <div>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                        Edit Newborn
                      </span>

                      <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">
                        Hariri Taarifa za Mtoto
                      </h1>

                      <p className="mt-1 text-sm text-blue-100">
                        {patientName || "Newborn"}{" "}
                        {patientNumber
                          ? `• ${patientNumber}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-xs text-blue-100">
                      Newborn Record
                    </p>

                    <p className="mt-1 text-lg font-extrabold">
                      #{newborn?.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
              <Activity
                className="mt-0.5 shrink-0"
                size={20}
              />

              <div>
                <p className="font-bold">
                  Imeshindikana
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
              <CheckCircle2
                className="mt-0.5 shrink-0"
                size={20}
              />

              <div>
                <p className="font-bold">
                  Imefanikiwa
                </p>

                <p className="mt-1 text-sm">
                  {success}
                </p>
              </div>
            </div>
          )}

          {/* Mother & Labour */}
          <SectionCard
            icon={UserRound}
            title="Mama & Labour Record"
            subtitle="Taarifa za msingi za record hii"
            tone="rose"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <FieldLabel>Jina la Mama</FieldLabel>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {patientName || "—"}
                </div>
              </div>

              <div>
                <FieldLabel>Patient Number</FieldLabel>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {patientNumber || "—"}
                </div>
              </div>

              <div>
                <FieldLabel>Labour Record ID</FieldLabel>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  #{form.labourRecordId || "—"}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Birth */}
          <SectionCard
            icon={Baby}
            title="Taarifa za Kuzaliwa"
            subtitle="Basic birth information"
            tone="blue"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <FieldLabel required>
                  Tarehe ya Kuzaliwa
                </FieldLabel>

                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) =>
                    updateField(
                      "dateOfBirth",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel required>
                  Muda wa Kuzaliwa
                </FieldLabel>

                <input
                  type="time"
                  value={form.timeOfBirth}
                  onChange={(event) =>
                    updateField(
                      "timeOfBirth",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel required>
                  Jinsia
                </FieldLabel>

                <select
                  value={form.sex}
                  onChange={(event) =>
                    updateField(
                      "sex",
                      event.target.value
                    )
                  }
                  className={selectClass}
                >
                  <option value="">
                    Chagua jinsia
                  </option>
                  <option value="MALE">
                    Mwanaume
                  </option>
                  <option value="FEMALE">
                    Mwanamke
                  </option>
                  <option value="INTERSEX">
                    Intersex
                  </option>
                </select>
              </div>

              <div>
                <FieldLabel required>
                  Birth Order
                </FieldLabel>

                <input
                  type="number"
                  min="1"
                  value={form.birthOrder}
                  onChange={(event) =>
                    updateField(
                      "birthOrder",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: 1"
                />
              </div>
            </div>
          </SectionCard>

          {/* Measurements */}
          <SectionCard
            icon={Weight}
            title="Vipimo vya Mtoto"
            subtitle="Anthropometric measurements"
            tone="green"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <FieldLabel>
                  Birth Weight (kg)
                </FieldLabel>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.birthWeight}
                  onChange={(event) =>
                    updateField(
                      "birthWeight",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: 3.2"
                />
              </div>

              <div>
                <FieldLabel>
                  Birth Length (cm)
                </FieldLabel>

                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.birthLength}
                  onChange={(event) =>
                    updateField(
                      "birthLength",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: 50"
                />
              </div>

              <div>
                <FieldLabel>
                  Head Circumference (cm)
                </FieldLabel>

                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.headCircumference}
                  onChange={(event) =>
                    updateField(
                      "headCircumference",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: 34"
                />
              </div>
            </div>
          </SectionCard>

          {/* APGAR */}
          <SectionCard
            icon={HeartPulse}
            title="APGAR"
            subtitle="APGAR score assessment"
            tone="purple"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <FieldLabel>
                  APGAR - 1 Minute
                </FieldLabel>

                <input
                  type="number"
                  min="0"
                  max="10"
                  value={form.apgarOneMinute}
                  onChange={(event) =>
                    updateField(
                      "apgarOneMinute",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel>
                  APGAR - 5 Minutes
                </FieldLabel>

                <input
                  type="number"
                  min="0"
                  max="10"
                  value={form.apgarFiveMinutes}
                  onChange={(event) =>
                    updateField(
                      "apgarFiveMinutes",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel>
                  APGAR - 10 Minutes
                </FieldLabel>

                <input
                  type="number"
                  min="0"
                  max="10"
                  value={form.apgarTenMinutes}
                  onChange={(event) =>
                    updateField(
                      "apgarTenMinutes",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </SectionCard>

          {/* Condition */}
          <SectionCard
            icon={Activity}
            title="Hali ya Mtoto Wakati wa Kuzaliwa"
            subtitle="Initial condition at birth"
            tone="rose"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <FieldLabel>
                  Condition at Birth
                </FieldLabel>

                <input
                  value={form.conditionAtBirth}
                  onChange={(event) =>
                    updateField(
                      "conditionAtBirth",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: Stable"
                />
              </div>

              <div>
                <FieldLabel>
                  Cry at Birth
                </FieldLabel>

                <input
                  value={form.cryAtBirth}
                  onChange={(event) =>
                    updateField(
                      "cryAtBirth",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: Strong cry"
                />
              </div>

              <div>
                <FieldLabel>
                  Breathing
                </FieldLabel>

                <input
                  value={form.breathingAtBirth}
                  onChange={(event) =>
                    updateField(
                      "breathingAtBirth",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: Spontaneous"
                />
              </div>

              <div>
                <FieldLabel>
                  Muscle Tone
                </FieldLabel>

                <input
                  value={form.muscleTone}
                  onChange={(event) =>
                    updateField(
                      "muscleTone",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: Good"
                />
              </div>

              <div>
                <FieldLabel>
                  Skin Colour
                </FieldLabel>

                <input
                  value={form.skinColour}
                  onChange={(event) =>
                    updateField(
                      "skinColour",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: Pink"
                />
              </div>
            </div>
          </SectionCard>

          {/* Resuscitation */}
          <SectionCard
            icon={Syringe}
            title="Resuscitation"
            subtitle="Huduma za resuscitation baada ya kuzaliwa"
            tone="orange"
          >
            <div className="space-y-4">
              <ToggleField
                label="Resuscitation ilihitajika"
                checked={form.resuscitationRequired}
                onChange={(value) =>
                  updateField(
                    "resuscitationRequired",
                    value
                  )
                }
                description="Washa ikiwa mtoto alihitaji resuscitation."
              />

              {form.resuscitationRequired && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FieldLabel required>
                      Resuscitation Method
                    </FieldLabel>

                    <input
                      value={form.resuscitationMethod}
                      onChange={(event) =>
                        updateField(
                          "resuscitationMethod",
                          event.target.value
                        )
                      }
                      className={inputClass}
                      placeholder="Mfano: Bag and mask"
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      Resuscitation Duration
                    </FieldLabel>

                    <input
                      value={form.resuscitationDuration}
                      onChange={(event) =>
                        updateField(
                          "resuscitationDuration",
                          event.target.value
                        )
                      }
                      className={inputClass}
                      placeholder="Mfano: 2 minutes"
                    />
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Clinical condition */}
          <SectionCard
            icon={Thermometer}
            title="Clinical Condition"
            subtitle="Vital signs na clinical assessment"
            tone="blue"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <FieldLabel>
                  Temperature (°C)
                </FieldLabel>

                <input
                  type="number"
                  step="0.1"
                  value={form.temperature}
                  onChange={(event) =>
                    updateField(
                      "temperature",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: 36.7"
                />
              </div>

              <div>
                <FieldLabel>
                  Heart Rate (bpm)
                </FieldLabel>

                <input
                  type="number"
                  min="0"
                  value={form.heartRate}
                  onChange={(event) =>
                    updateField(
                      "heartRate",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel>
                  Respiratory Rate (/min)
                </FieldLabel>

                <input
                  type="number"
                  min="0"
                  value={form.respiratoryRate}
                  onChange={(event) =>
                    updateField(
                      "respiratoryRate",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel>
                  Clinical Condition
                </FieldLabel>

                <input
                  value={form.clinicalCondition}
                  onChange={(event) =>
                    updateField(
                      "clinicalCondition",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: Stable"
                />
              </div>
            </div>

            <div className="mt-4">
              <FieldLabel>
                Congenital Abnormalities
              </FieldLabel>

              <textarea
                rows={3}
                value={form.congenitalAbnormalities}
                onChange={(event) =>
                  updateField(
                    "congenitalAbnormalities",
                    event.target.value
                  )
                }
                className={textareaClass}
                placeholder="Andika kama kuna congenital abnormality..."
              />
            </div>
          </SectionCard>

          {/* Immediate care */}
          <SectionCard
            icon={Milk}
            title="Immediate Newborn Care"
            subtitle="Huduma za mwanzo baada ya kuzaliwa"
            tone="green"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleField
                label="Breastfeeding ilianza"
                checked={form.breastfeedingStarted}
                onChange={(value) =>
                  updateField(
                    "breastfeedingStarted",
                    value
                  )
                }
                description="Washa ikiwa mtoto ameanza kunyonya."
              />

              <ToggleField
                label="Skin-to-Skin"
                checked={form.skinToSkin}
                onChange={(value) =>
                  updateField("skinToSkin", value)
                }
                description="Washa ikiwa skin-to-skin care ilifanyika."
              />

              <ToggleField
                label="Vitamin K Given"
                checked={form.vitaminKGiven}
                onChange={(value) =>
                  updateField(
                    "vitaminKGiven",
                    value
                  )
                }
                description="Vitamin K imepewa mtoto."
              />

              <ToggleField
                label="BCG Given"
                checked={form.bcgGiven}
                onChange={(value) =>
                  updateField("bcgGiven", value)
                }
                description="BCG imepewa mtoto."
              />

              <ToggleField
                label="OPV Given"
                checked={form.opvGiven}
                onChange={(value) =>
                  updateField("opvGiven", value)
                }
                description="OPV imepewa mtoto."
              />
            </div>

            {form.breastfeedingStarted && (
              <div className="mt-4 max-w-md">
                <FieldLabel>
                  Breastfeeding Time
                </FieldLabel>

                <input
                  type="time"
                  value={form.breastfeedingTime}
                  onChange={(event) =>
                    updateField(
                      "breastfeedingTime",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>
            )}
          </SectionCard>

          {/* Outcome */}
          <SectionCard
            icon={MapPin}
            title="Outcome & Referral"
            subtitle="Hali ya mwisho na referral"
            tone="orange"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <FieldLabel>
                  Newborn Outcome
                </FieldLabel>

                <select
                  value={form.newbornOutcome}
                  onChange={(event) =>
                    updateField(
                      "newbornOutcome",
                      event.target.value
                    )
                  }
                  className={selectClass}
                >
                  <option value="">
                    Chagua outcome
                  </option>
                  <option value="ALIVE">
                    Alive
                  </option>
                  <option value="REFERRED">
                    Referred
                  </option>
                  <option value="TRANSFERRED">
                    Transferred
                  </option>
                  <option value="DECEASED">
                    Deceased
                  </option>
                </select>
              </div>

              <div>
                <FieldLabel>
                  Place of Care
                </FieldLabel>

                <input
                  value={form.placeOfCare}
                  onChange={(event) =>
                    updateField(
                      "placeOfCare",
                      event.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Mfano: Labour Ward"
                />
              </div>
            </div>

            <div className="mt-4">
              <ToggleField
                label="Referral Required"
                checked={form.referralRequired}
                onChange={(value) =>
                  updateField(
                    "referralRequired",
                    value
                  )
                }
                description="Washa ikiwa mtoto alihitaji referral."
              />
            </div>

            {form.referralRequired && (
              <div className="mt-4">
                <FieldLabel required>
                  Referral Reason
                </FieldLabel>

                <textarea
                  rows={3}
                  value={form.referralReason}
                  onChange={(event) =>
                    updateField(
                      "referralReason",
                      event.target.value
                    )
                  }
                  className={textareaClass}
                  placeholder="Andika sababu ya referral..."
                />
              </div>
            )}
          </SectionCard>

          {/* Clinical management */}
          <SectionCard
            icon={Stethoscope}
            title="Clinical Management"
            subtitle="Assessment, treatment na notes"
            tone="purple"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <FieldLabel>
                  Assessment
                </FieldLabel>

                <textarea
                  rows={4}
                  value={form.assessment}
                  onChange={(event) =>
                    updateField(
                      "assessment",
                      event.target.value
                    )
                  }
                  className={textareaClass}
                  placeholder="Clinical assessment..."
                />
              </div>

              <div>
                <FieldLabel>
                  Treatment
                </FieldLabel>

                <textarea
                  rows={4}
                  value={form.treatment}
                  onChange={(event) =>
                    updateField(
                      "treatment",
                      event.target.value
                    )
                  }
                  className={textareaClass}
                  placeholder="Treatment iliyotolewa..."
                />
              </div>

              <div className="lg:col-span-2">
                <FieldLabel>
                  Notes
                </FieldLabel>

                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    updateField(
                      "notes",
                      event.target.value
                    )
                  }
                  className={textareaClass}
                  placeholder="Maelezo mengine..."
                />
              </div>
            </div>
          </SectionCard>

          {/* Footer */}
          <div className="sticky bottom-4 z-20">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <Link
                to={`/maternity/newborn-records/${id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    className="animate-spin"
                    size={18}
                  />
                ) : (
                  <Save size={18} />
                )}

                {saving
                  ? "Inahifadhi..."
                  : "Hifadhi Mabadiliko"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}