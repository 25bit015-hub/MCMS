import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  Loader2,
  Save,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";

import api from "../../services/api";

const initialForm = {
  visitDate: "",
  visitType: "FOLLOW_UP",

  gestationalWeeks: "",
  gestationalDays: "",

  weight: "",
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  pulse: "",
  temp: "",
  respiratoryRate: "",
  generalCondition: "",
  oedema: "",
  pallor: "",
  symptoms: "",

  fundalHeight: "",
  fetalHeartRate: "",
  fetalMovement: "",
  presentation: "",
  lie: "",
  position: "",

  haemoglobin: "",
  bloodGroup: "",
  rhesus: "",
  urinalysis: "",
  bloodSugar: "",
  hivResult: "",
  syphilisResult: "",
  hepatitisBResult: "",
  ultrasound: "",
  otherInvestigations: "",

  assessment: "",
  riskAssessment: "",
  diagnosis: "",
  treatment: "",
  medication: "",
  advice: "",
  healthEducation: "",
  referral: "",

  nextVisitDate: "",
  notes: "",
};

function formatDate(dateValue) {
  if (!dateValue) return "—";

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

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calculateGestationalAge(lmp) {
  if (!lmp) return null;

  const lmpDate = new Date(`${lmp}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(lmpDate.getTime()) || lmpDate > today) {
    return null;
  }

  const difference = Math.floor(
    (today.getTime() - lmpDate.getTime()) / 86400000
  );

  const weeks = Math.floor(difference / 7);
  const days = difference % 7;

  return {
    weeks,
    days,
  };
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
  max,
  step,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  children,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      >
        {children}
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      />
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>

        {description && (
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function RegisterANCVisit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pregnancy, setPregnancy] = useState(null);

  const [form, setForm] = useState({
    ...initialForm,
    visitDate: getToday(),
  });

  const [loadingPregnancy, setLoadingPregnancy] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadPregnancy = async () => {
      if (!id) {
        setError("Pregnancy ID haijapatikana.");
        setLoadingPregnancy(false);
        return;
      }

      try {
        setLoadingPregnancy(true);
        setError("");

        const response = await api.get(
          `/maternity/pregnancies/${id}`
        );

        setPregnancy(response.data);

        if (
          String(response.data?.status || "").toUpperCase() !==
          "ACTIVE"
        ) {
          setError(
            "Pregnancy hii si ACTIVE. ANC visit mpya haiwezi kusajiliwa."
          );
        }
      } catch (err) {
        console.error("Failed to load pregnancy:", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Imeshindikana kupata taarifa za pregnancy."
        );
      } finally {
        setLoadingPregnancy(false);
      }
    };

    loadPregnancy();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const calculatedGestationalAge = calculateGestationalAge(
    pregnancy?.lmp
  );

  const handleUseCalculatedGestationalAge = () => {
    if (!calculatedGestationalAge) {
      return;
    }

    setForm((current) => ({
      ...current,
      gestationalWeeks: String(
        calculatedGestationalAge.weeks
      ),
      gestationalDays: String(
        calculatedGestationalAge.days
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!id) {
      setError("Pregnancy ID haijapatikana.");
      return;
    }

    if (!pregnancy) {
      setError("Taarifa za pregnancy hazijapatikana.");
      return;
    }

    if (
      String(pregnancy.status || "").toUpperCase() !== "ACTIVE"
    ) {
      setError(
        "Pregnancy hii si ACTIVE. Huwezi kusajili ANC visit mpya."
      );
      return;
    }

    if (!form.visitDate) {
      setError("Tafadhali chagua tarehe ya ANC visit.");
      return;
    }

    if (!form.visitType) {
      setError("Tafadhali chagua aina ya ANC visit.");
      return;
    }

    const gestationalWeeks =
      form.gestationalWeeks === ""
        ? null
        : Number(form.gestationalWeeks);

    const gestationalDays =
      form.gestationalDays === ""
        ? null
        : Number(form.gestationalDays);

    if (
      gestationalWeeks !== null &&
      (!Number.isInteger(gestationalWeeks) ||
        gestationalWeeks < 0 ||
        gestationalWeeks > 45)
    ) {
      setError("Gestational weeks lazima iwe kati ya 0 na 45.");
      return;
    }

    if (
      gestationalDays !== null &&
      (!Number.isInteger(gestationalDays) ||
        gestationalDays < 0 ||
        gestationalDays > 6)
    ) {
      setError("Gestational days lazima iwe kati ya 0 na 6.");
      return;
    }

    const payload = {
      pregnancyId: Number(id),

      visitDate: form.visitDate,
      visitType: form.visitType,

      gestationalWeeks,
      gestationalDays,

      weight:
        form.weight === "" ? null : Number(form.weight),

      bloodPressureSystolic:
        form.bloodPressureSystolic === ""
          ? null
          : Number(form.bloodPressureSystolic),

      bloodPressureDiastolic:
        form.bloodPressureDiastolic === ""
          ? null
          : Number(form.bloodPressureDiastolic),

      pulse:
        form.pulse === "" ? null : Number(form.pulse),

      temp:
        form.temp === "" ? null : Number(form.temp),

      respiratoryRate:
        form.respiratoryRate === ""
          ? null
          : Number(form.respiratoryRate),

      generalCondition: form.generalCondition || null,
      oedema: form.oedema || null,
      pallor: form.pallor || null,
      symptoms: form.symptoms || null,

      fundalHeight:
        form.fundalHeight === ""
          ? null
          : Number(form.fundalHeight),

      fetalHeartRate:
        form.fetalHeartRate === ""
          ? null
          : Number(form.fetalHeartRate),

      fetalMovement: form.fetalMovement || null,
      presentation: form.presentation || null,
      lie: form.lie || null,
      position: form.position || null,

      haemoglobin:
        form.haemoglobin === ""
          ? null
          : Number(form.haemoglobin),

      bloodGroup: form.bloodGroup || null,
      rhesus: form.rhesus || null,
      urinalysis: form.urinalysis || null,

      bloodSugar:
        form.bloodSugar === ""
          ? null
          : Number(form.bloodSugar),

      hivResult: form.hivResult || null,
      syphilisResult: form.syphilisResult || null,
      hepatitisBResult: form.hepatitisBResult || null,
      ultrasound: form.ultrasound || null,
      otherInvestigations:
        form.otherInvestigations || null,

      assessment: form.assessment || null,
      riskAssessment: form.riskAssessment || null,
      diagnosis: form.diagnosis || null,
      treatment: form.treatment || null,
      medication: form.medication || null,
      advice: form.advice || null,
      healthEducation: form.healthEducation || null,
      referral: form.referral || null,

      nextVisitDate: form.nextVisitDate || null,
      notes: form.notes || null,
    };

    try {
      setSaving(true);

      const response = await api.post(
        "/maternity/anc-visits",
        payload
      );

      const createdVisit = response.data;

      setSuccess("ANC visit imesajiliwa kwa mafanikio.");

      setTimeout(() => {
        if (createdVisit?.id) {
          navigate(
            `/maternity/anc-visits/${createdVisit.id}`
          );
        } else {
          navigate(`/maternity/pregnancies/${id}/anc`);
        }
      }, 700);
    } catch (err) {
      console.error("Failed to create ANC visit:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error;

      setError(
        backendMessage ||
          "Imeshindikana kusajili ANC visit. Tafadhali hakikisha taarifa ulizoingiza ni sahihi."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingPregnancy) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-5">
            <div className="h-10 w-72 rounded-xl bg-slate-200" />
            <div className="h-32 rounded-3xl bg-white shadow-sm" />
            <div className="h-[700px] rounded-3xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (!pregnancy) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={28} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Pregnancy haijapatikana
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {error || "Taarifa za pregnancy hazijapatikana."}
          </p>

          <Link
            to="/maternity/pregnancies"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <ArrowLeft size={17} />
            Rudi kwenye Pregnancies
          </Link>
        </div>
      </div>
    );
  }

  const pregnancyIsActive =
    String(pregnancy.status || "").toUpperCase() ===
    "ACTIVE";

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              to={`/maternity/pregnancies/${id}/anc`}
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Rudi ANC History
            </Link>

            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
                <ClipboardList size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Sajili ANC Visit
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Ingiza taarifa za kliniki za ziara hii bila
                  kubadilisha historia ya ziara zilizopita.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pregnancy information */}

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
                    {pregnancy.patientName || "Mgonjwa"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-300">
                    Patient No:{" "}
                    <span className="font-semibold text-white">
                      {pregnancy.patientNumber || "—"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <p className="text-xs text-slate-300">LMP</p>
                  <p className="mt-1 text-sm font-bold">
                    {formatDate(pregnancy.lmp)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <p className="text-xs text-slate-300">EDD</p>
                  <p className="mt-1 text-sm font-bold">
                    {formatDate(pregnancy.edd)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <p className="text-xs text-slate-300">Gravida</p>
                  <p className="mt-1 text-sm font-bold">
                    {pregnancy.gravida ?? "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <p className="text-xs text-slate-300">Para</p>
                  <p className="mt-1 text-sm font-bold">
                    {pregnancy.para ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {!pregnancyIsActive && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <ShieldAlert
              className="mt-0.5 shrink-0"
              size={19}
            />

            <div>
              <p className="text-sm font-bold">
                Pregnancy hii si ACTIVE
              </p>

              <p className="mt-1 text-sm leading-6">
                Pregnancy iliyokamilika au archived haiwezi
                kupokea ANC visit mpya.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              className="mt-0.5 shrink-0"
              size={19}
            />

            <div>
              <p className="text-sm font-bold">
                Kuna tatizo
              </p>

              <p className="mt-1 text-sm leading-6">
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <CheckCircle2
              className="mt-0.5 shrink-0"
              size={19}
            />

            <div>
              <p className="text-sm font-bold">
                Imefanikiwa
              </p>

              <p className="mt-1 text-sm leading-6">
                {success}
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Visit information */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              icon={CalendarDays}
              title="Taarifa za Visit"
              description="Taarifa za msingi za ANC visit hii."
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              <InputField
                label="Tarehe ya Visit"
                name="visitDate"
                type="date"
                value={form.visitDate}
                onChange={handleChange}
                required
              />

              <SelectField
                label="Aina ya Visit"
                name="visitType"
                value={form.visitType}
                onChange={handleChange}
                required
              >
                <option value="">
                  Chagua aina
                </option>

                <option value="INITIAL_ANC">
                  ANC ya Kwanza
                </option>

                <option value="FOLLOW_UP">
                  ANC ya Ufuatiliaji
                </option>

                <option value="REVIEW">
                  Mapitio
                </option>

                <option value="EMERGENCY">
                  Huduma ya Dharura
                </option>
              </SelectField>

              <InputField
                label="Gestational Weeks"
                name="gestationalWeeks"
                type="number"
                min="0"
                max="45"
                value={form.gestationalWeeks}
                onChange={handleChange}
                placeholder="Mf. 24"
              />

              <InputField
                label="Gestational Days"
                name="gestationalDays"
                type="number"
                min="0"
                max="6"
                value={form.gestationalDays}
                onChange={handleChange}
                placeholder="Mf. 3"
              />
            </div>

            {calculatedGestationalAge && (
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Activity
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-700"
                  />

                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      Gestational age iliyokokotolewa
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      Kulingana na LMP, ni{" "}
                      <strong>
                        {calculatedGestationalAge.weeks}{" "}
                        weeks{" "}
                        {calculatedGestationalAge.days}{" "}
                        days
                      </strong>
                      .
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleUseCalculatedGestationalAge
                  }
                  className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Tumia hii
                </button>
              </div>
            )}
          </section>

          {/* Maternal assessment */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              icon={HeartPulse}
              title="Maternal Assessment"
              description="Vipimo na hali ya mama wakati wa visit."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <InputField
                label="Weight (kg)"
                name="weight"
                type="number"
                min="0"
                step="0.1"
                value={form.weight}
                onChange={handleChange}
                placeholder="Mf. 68.5"
              />

              <InputField
                label="BP Systolic"
                name="bloodPressureSystolic"
                type="number"
                min="0"
                value={form.bloodPressureSystolic}
                onChange={handleChange}
                placeholder="Mf. 120"
              />

              <InputField
                label="BP Diastolic"
                name="bloodPressureDiastolic"
                type="number"
                min="0"
                value={form.bloodPressureDiastolic}
                onChange={handleChange}
                placeholder="Mf. 80"
              />

              <InputField
                label="Pulse"
                name="pulse"
                type="number"
                min="0"
                value={form.pulse}
                onChange={handleChange}
                placeholder="bpm"
              />

              <InputField
                label="Temperature"
                name="temp"
                type="number"
                min="0"
                step="0.1"
                value={form.temp}
                onChange={handleChange}
                placeholder="°C"
              />

              <InputField
                label="Respiratory Rate"
                name="respiratoryRate"
                type="number"
                min="0"
                value={form.respiratoryRate}
                onChange={handleChange}
                placeholder="breaths/min"
              />

              <SelectField
                label="General Condition"
                name="generalCondition"
                value={form.generalCondition}
                onChange={handleChange}
              >
                <option value="">Chagua</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="ILL">Ill</option>
                <option value="CRITICAL">
                  Critical
                </option>
              </SelectField>

              <SelectField
                label="Oedema"
                name="oedema"
                value={form.oedema}
                onChange={handleChange}
              >
                <option value="">Chagua</option>
                <option value="NONE">Hakuna</option>
                <option value="MILD">Mild</option>
                <option value="MODERATE">
                  Moderate
                </option>
                <option value="SEVERE">Severe</option>
              </SelectField>

              <SelectField
                label="Pallor"
                name="pallor"
                value={form.pallor}
                onChange={handleChange}
              >
                <option value="">Chagua</option>
                <option value="ABSENT">Absent</option>
                <option value="PRESENT">Present</option>
              </SelectField>
            </div>

            <div className="mt-5">
              <TextAreaField
                label="Symptoms / Malalamiko"
                name="symptoms"
                value={form.symptoms}
                onChange={handleChange}
                placeholder="Andika dalili au malalamiko ya mama..."
              />
            </div>
          </section>

          {/* Fetal assessment */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              icon={Baby}
              title="Fetal Assessment"
              description="Taarifa za mtoto tumboni na assessment ya fetal."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <InputField
                label="Fundal Height (cm)"
                name="fundalHeight"
                type="number"
                min="0"
                step="0.1"
                value={form.fundalHeight}
                onChange={handleChange}
                placeholder="Mf. 24"
              />

              <InputField
                label="Fetal Heart Rate (bpm)"
                name="fetalHeartRate"
                type="number"
                min="0"
                value={form.fetalHeartRate}
                onChange={handleChange}
                placeholder="Mf. 145"
              />

              <SelectField
                label="Fetal Movement"
                name="fetalMovement"
                value={form.fetalMovement}
                onChange={handleChange}
              >
                <option value="">Chagua</option>
                <option value="PRESENT">Present</option>
                <option value="REDUCED">Reduced</option>
                <option value="ABSENT">Absent</option>
                <option value="NOT_ASSESSED">
                  Not assessed
                </option>
              </SelectField>

              <SelectField
                label="Presentation"
                name="presentation"
                value={form.presentation}
                onChange={handleChange}
              >
                <option value="">Chagua</option>
                <option value="CEPHALIC">Cephalic</option>
                <option value="BREECH">Breech</option>
                <option value="TRANSVERSE">
                  Transverse
                </option>
                <option value="UNKNOWN">Unknown</option>
              </SelectField>

              <SelectField
                label="Lie"
                name="lie"
                value={form.lie}
                onChange={handleChange}
              >
                <option value="">Chagua</option>
                <option value="LONGITUDINAL">
                  Longitudinal
                </option>
                <option value="TRANSVERSE">
                  Transverse
                </option>
                <option value="OBLIQUE">Oblique</option>
                <option value="UNKNOWN">Unknown</option>
              </SelectField>

              <InputField
                label="Position"
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Andika position..."
              />
            </div>
          </section>

          {/* Investigations */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              icon={Stethoscope}
              title="Investigations"
              description="Vipimo na majibu ya uchunguzi wa visit hii."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <InputField
                label="Haemoglobin"
                name="haemoglobin"
                type="number"
                min="0"
                step="0.1"
                value={form.haemoglobin}
                onChange={handleChange}
                placeholder="g/dL"
              />

              <SelectField
                label="Blood Group"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Chagua</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </SelectField>

              <SelectField
                label="Rhesus"
                name="rhesus"
                value={form.rhesus}
                onChange={handleChange}
              >
                <option value="">Chagua</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEGATIVE">Negative</option>
              </SelectField>

              <InputField
                label="Blood Sugar"
                name="bloodSugar"
                type="number"
                min="0"
                step="0.1"
                value={form.bloodSugar}
                onChange={handleChange}
                placeholder="mmol/L"
              />

              <SelectField
                label="HIV Result"
                name="hivResult"
                value={form.hivResult}
                onChange={handleChange}
              >
                <option value="">Chagua</option>
                <option value="NEGATIVE">Negative</option>
                <option value="POSITIVE">Positive</option>
                <option value="UNKNOWN">Unknown</option>
                <option value="NOT_DONE">Not done</option>
              </SelectField>

              <SelectField
                label="Syphilis Result"
                name="syphilisResult"
                value={form.syphilisResult}
                onChange={handleChange}
              >
                <option value="">Chagua</option>
                <option value="NEGATIVE">Negative</option>
                <option value="POSITIVE">Positive</option>
                <option value="UNKNOWN">Unknown</option>
                <option value="NOT_DONE">Not done</option>
              </SelectField>

              <SelectField
                label="Hepatitis B"
                name="hepatitisBResult"
                value={form.hepatitisBResult}
                onChange={handleChange}
              >
                <option value="">Chagua</option>
                <option value="NEGATIVE">Negative</option>
                <option value="POSITIVE">Positive</option>
                <option value="UNKNOWN">Unknown</option>
                <option value="NOT_DONE">Not done</option>
              </SelectField>

              <InputField
                label="Urinalysis"
                name="urinalysis"
                value={form.urinalysis}
                onChange={handleChange}
                placeholder="Protein, glucose, etc."
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <TextAreaField
                label="Ultrasound"
                name="ultrasound"
                value={form.ultrasound}
                onChange={handleChange}
                placeholder="Andika ultrasound findings..."
              />

              <TextAreaField
                label="Other Investigations"
                name="otherInvestigations"
                value={form.otherInvestigations}
                onChange={handleChange}
                placeholder="Vipimo vingine na majibu..."
              />
            </div>
          </section>

          {/* Clinical management */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              icon={FileText}
              title="Clinical Management"
              description="Clinical assessment, diagnosis, treatment na mpango wa huduma."
            />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <TextAreaField
                label="Assessment"
                name="assessment"
                value={form.assessment}
                onChange={handleChange}
                placeholder="Clinical assessment ya mama..."
              />

              <TextAreaField
                label="Risk Assessment"
                name="riskAssessment"
                value={form.riskAssessment}
                onChange={handleChange}
                placeholder="Risk factors au risk assessment..."
              />

              <TextAreaField
                label="Diagnosis"
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="Diagnosis..."
              />

              <TextAreaField
                label="Treatment"
                name="treatment"
                value={form.treatment}
                onChange={handleChange}
                placeholder="Treatment iliyotolewa..."
              />

              <TextAreaField
                label="Medication"
                name="medication"
                value={form.medication}
                onChange={handleChange}
                placeholder="Dawa na dosage..."
              />

              <TextAreaField
                label="Advice"
                name="advice"
                value={form.advice}
                onChange={handleChange}
                placeholder="Ushauri uliotolewa..."
              />

              <TextAreaField
                label="Health Education"
                name="healthEducation"
                value={form.healthEducation}
                onChange={handleChange}
                placeholder="Elimu ya afya iliyotolewa..."
              />

              <TextAreaField
                label="Referral"
                name="referral"
                value={form.referral}
                onChange={handleChange}
                placeholder="Referral ikiwa ipo..."
              />
            </div>
          </section>

          {/* Follow-up */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeader
              icon={CalendarDays}
              title="Follow-up"
              description="Panga ziara inayofuata na ongeza notes za ziada."
            />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <InputField
                label="Next Visit Date"
                name="nextVisitDate"
                type="date"
                value={form.nextVisitDate}
                onChange={handleChange}
              />

              <div className="hidden lg:block" />

              <div className="lg:col-span-2">
                <TextAreaField
                  label="Notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Taarifa nyingine muhimu za clinical..."
                  rows={5}
                />
              </div>
            </div>
          </section>

          {/* Actions */}

          <section className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:p-5">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to={`/maternity/pregnancies/${id}/anc`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || !pregnancyIsActive}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Inahifadhi...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Sajili ANC Visit
                  </>
                )}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}