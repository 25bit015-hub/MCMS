import { useCallback, useEffect, useMemo, useState } from "react";
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
  Info,
  Pill,
  Save,
  ShieldAlert,
  Stethoscope,
  UserRound,
  X,
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
  temperature: "",
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

function formatDateForInput(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function getPatientName(pregnancy) {
  if (!pregnancy) return "Mgonjwa";

  return (
    pregnancy.patientName ||
    pregnancy.patient?.fullName ||
    pregnancy.patient?.name ||
    "Mgonjwa"
  );
}

function getPatientNumber(pregnancy) {
  if (!pregnancy) return "—";

  return (
    pregnancy.patientNumber ||
    pregnancy.patient?.patientNumber ||
    "—"
  );
}

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
  min,
  max,
  step,
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
    />
  );
}

function Select({ value, onChange, children, disabled = false }) {
  return (
    <select
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
    >
      {children}
    </select>
  );
}

function Textarea({
  value,
  onChange,
  placeholder = "",
  rows = 4,
  disabled = false,
}) {
  return (
    <textarea
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
    />
  );
}

function Section({
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

export default function EditANCVisit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [visit, setVisit] = useState(null);
  const [pregnancy, setPregnancy] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isArchived =
    String(visit?.recordStatus || "").toUpperCase() ===
    "ARCHIVED";

  const loadData = useCallback(async () => {
    if (!id) {
      setError("ANC Visit ID haijapatikana.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const visitResponse = await api.get(
        `/maternity/anc-visits/${id}`
      );

      const loadedVisit = visitResponse.data;

      setVisit(loadedVisit);

      const pregnancyResponse = await api.get(
        `/maternity/pregnancies/${loadedVisit.pregnancyId}`
      );

      setPregnancy(pregnancyResponse.data);

      setForm({
        visitDate: formatDateForInput(loadedVisit.visitDate),
        visitType: loadedVisit.visitType || "FOLLOW_UP",

        gestationalWeeks:
          loadedVisit.gestationalWeeks ?? "",
        gestationalDays:
          loadedVisit.gestationalDays ?? "",

        weight: loadedVisit.weight ?? "",
        bloodPressureSystolic:
          loadedVisit.bloodPressureSystolic ?? "",
        bloodPressureDiastolic:
          loadedVisit.bloodPressureDiastolic ?? "",
        pulse: loadedVisit.pulse ?? "",
        temperature: loadedVisit.temperature ?? "",
        respiratoryRate:
          loadedVisit.respiratoryRate ?? "",
        generalCondition:
          loadedVisit.generalCondition || "",
        oedema: loadedVisit.oedema || "",
        pallor: loadedVisit.pallor || "",
        symptoms: loadedVisit.symptoms || "",

        fundalHeight: loadedVisit.fundalHeight ?? "",
        fetalHeartRate:
          loadedVisit.fetalHeartRate ?? "",
        fetalMovement:
          loadedVisit.fetalMovement || "",
        presentation:
          loadedVisit.presentation || "",
        lie: loadedVisit.lie || "",
        position:
          loadedVisit.position || "",

        haemoglobin:
          loadedVisit.haemoglobin ?? "",
        bloodGroup:
          loadedVisit.bloodGroup || "",
        rhesus: loadedVisit.rhesus || "",
        urinalysis:
          loadedVisit.urinalysis || "",
        bloodSugar:
          loadedVisit.bloodSugar ?? "",
        hivResult:
          loadedVisit.hivResult || "",
        syphilisResult:
          loadedVisit.syphilisResult || "",
        hepatitisBResult:
          loadedVisit.hepatitisBResult || "",
        ultrasound:
          loadedVisit.ultrasound || "",
        otherInvestigations:
          loadedVisit.otherInvestigations || "",

        assessment:
          loadedVisit.assessment || "",
        riskAssessment:
          loadedVisit.riskAssessment || "",
        diagnosis:
          loadedVisit.diagnosis || "",
        treatment:
          loadedVisit.treatment || "",
        medication:
          loadedVisit.medication || "",
        advice:
          loadedVisit.advice || "",
        healthEducation:
          loadedVisit.healthEducation || "",
        referral:
          loadedVisit.referral || "",

        nextVisitDate:
          formatDateForInput(loadedVisit.nextVisitDate),
        notes: loadedVisit.notes || "",
      });
    } catch (err) {
      console.error("Failed to load ANC visit:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Imeshindikana kupata taarifa za ANC visit.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const patientName = useMemo(
    () => getPatientName(pregnancy) || visit?.patientName,
    [pregnancy, visit]
  );

  const patientNumber = useMemo(
    () =>
      getPatientNumber(pregnancy) ||
      visit?.patientNumber ||
      "—",
    [pregnancy, visit]
  );

  const validateForm = () => {
    if (!form.visitDate) {
      return "Tarehe ya ANC visit inahitajika.";
    }

    if (!form.visitType) {
      return "Aina ya ANC visit inahitajika.";
    }

    if (
      form.gestationalWeeks !== "" &&
      (Number(form.gestationalWeeks) < 0 ||
        Number(form.gestationalWeeks) > 45)
    ) {
      return "Gestational weeks lazima iwe kati ya 0 na 45.";
    }

    if (
      form.gestationalDays !== "" &&
      (Number(form.gestationalDays) < 0 ||
        Number(form.gestationalDays) > 6)
    ) {
      return "Gestational days lazima iwe kati ya 0 na 6.";
    }

    if (
      form.nextVisitDate &&
      form.nextVisitDate < form.visitDate
    ) {
      return "Next visit date haiwezi kuwa kabla ya tarehe ya ANC visit.";
    }

    return "";
  };

  const buildPayload = () => ({
    pregnancyId: visit.pregnancyId,

    visitDate: form.visitDate,
    visitType: form.visitType,

    gestationalWeeks:
      form.gestationalWeeks === ""
        ? null
        : Number(form.gestationalWeeks),

    gestationalDays:
      form.gestationalDays === ""
        ? null
        : Number(form.gestationalDays),

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

    temperature:
      form.temperature === ""
        ? null
        : Number(form.temperature),

    respiratoryRate:
      form.respiratoryRate === ""
        ? null
        : Number(form.respiratoryRate),

    generalCondition: form.generalCondition,
    oedema: form.oedema,
    pallor: form.pallor,
    symptoms: form.symptoms,

    fundalHeight:
      form.fundalHeight === ""
        ? null
        : Number(form.fundalHeight),

    fetalHeartRate:
      form.fetalHeartRate === ""
        ? null
        : Number(form.fetalHeartRate),

    fetalMovement: form.fetalMovement,
    presentation: form.presentation,
    lie: form.lie,
    position: form.position,

    haemoglobin:
      form.haemoglobin === ""
        ? null
        : Number(form.haemoglobin),

    bloodGroup: form.bloodGroup,
    rhesus: form.rhesus,
    urinalysis: form.urinalysis,

    bloodSugar:
      form.bloodSugar === ""
        ? null
        : Number(form.bloodSugar),

    hivResult: form.hivResult,
    syphilisResult: form.syphilisResult,
    hepatitisBResult: form.hepatitisBResult,
    ultrasound: form.ultrasound,
    otherInvestigations: form.otherInvestigations,

    assessment: form.assessment,
    riskAssessment: form.riskAssessment,
    diagnosis: form.diagnosis,
    treatment: form.treatment,
    medication: form.medication,
    advice: form.advice,
    healthEducation: form.healthEducation,
    referral: form.referral,

    nextVisitDate:
      form.nextVisitDate || null,

    notes: form.notes,

    // Record status haibadilishwi na frontend.
    // Backend ndiyo inalinda ACTIVE/ARCHIVED state.
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isArchived) {
      setError(
        "ANC visit hii ime-archive na haiwezi kuhaririwa kwa sababu ni historical clinical record."
      );
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/maternity/anc-visits/${id}`,
        buildPayload()
      );

      setVisit(response.data);

      setSuccess(
        "ANC visit imesasishwa kwa mafanikio."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Failed to update ANC visit:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Imeshindikana kusasisha ANC visit.";

      setError(message);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-80 rounded-xl bg-slate-200" />
            <div className="h-36 rounded-3xl bg-white shadow-sm" />
            <div className="h-96 rounded-3xl bg-white shadow-sm" />
            <div className="h-96 rounded-3xl bg-white shadow-sm" />
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
                onClick={loadData}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Jaribu tena
              </button>

              <Link
                to="/maternity"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                to={`/maternity/pregnancies/${visit.pregnancyId}/anc`}
                className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft size={16} />
                ANC History
              </Link>

              <span className="text-slate-300">•</span>

              <Link
                to={`/maternity/anc-visits/${id}`}
                className="font-semibold text-slate-500 hover:text-slate-900"
              >
                ANC Visit Profile
              </Link>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
                <ClipboardList size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Hariri ANC Visit
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Rekebisha taarifa za clinical visit bila kufuta historia ya ujauzito.
                </p>
              </div>
            </div>
          </div>

          <Link
            to={`/maternity/anc-visits/${id}`}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <X size={17} />
            Ghairi
          </Link>
        </div>

        {/* Patient summary */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <UserRound size={27} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-300">
                    Mjamzito
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {patientName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-300">
                    Patient No:{" "}
                    <span className="font-semibold text-white">
                      {patientNumber}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                  ANC Visit #{visit.id}
                </span>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                  {visit.recordStatus || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Archived warning */}
        {isArchived && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <ShieldAlert
              size={20}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <div>
              <p className="font-bold text-amber-900">
                Record hii ime-archive
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                Archived ANC visits ni historical clinical records na
                haziwezi kuhaririwa.
              </p>

              {visit.archiveReason && (
                <p className="mt-2 text-sm text-amber-800">
                  <span className="font-semibold">
                    Sababu:
                  </span>{" "}
                  {visit.archiveReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">Kuna tatizo</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">Imefanikiwa</p>
              <p className="mt-1">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visit details */}
          <Section
            icon={CalendarDays}
            title="Taarifa za Visit"
            description="Taarifa kuu za ANC visit hii."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <FieldLabel required>
                  Tarehe ya Visit
                </FieldLabel>

                <Input
                  type="date"
                  value={form.visitDate}
                  onChange={handleChange("visitDate")}
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel required>
                  Aina ya Visit
                </FieldLabel>

                <Select
                  value={form.visitType}
                  onChange={handleChange("visitType")}
                  disabled={isArchived || saving}
                >
                  <option value="INITIAL_ANC">
                    Initial ANC
                  </option>
                  <option value="FOLLOW_UP">
                    Follow Up
                  </option>
                  <option value="EMERGENCY">
                    Emergency
                  </option>
                  <option value="REVIEW">
                    Review
                  </option>
                </Select>
              </div>

              <div>
                <FieldLabel>
                  Gestational Weeks
                </FieldLabel>

                <Input
                  type="number"
                  min="0"
                  max="45"
                  value={form.gestationalWeeks}
                  onChange={handleChange(
                    "gestationalWeeks"
                  )}
                  placeholder="Mf. 24"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>
                  Gestational Days
                </FieldLabel>

                <Input
                  type="number"
                  min="0"
                  max="6"
                  value={form.gestationalDays}
                  onChange={handleChange(
                    "gestationalDays"
                  )}
                  placeholder="Mf. 3"
                  disabled={isArchived || saving}
                />
              </div>
            </div>
          </Section>

          {/* Maternal assessment */}
          <Section
            icon={HeartPulse}
            title="Maternal Assessment"
            description="Uchunguzi wa hali ya mama."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <FieldLabel>Weight (kg)</FieldLabel>

                <Input
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={handleChange("weight")}
                  placeholder="Mf. 68.5"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>BP Systolic</FieldLabel>

                <Input
                  type="number"
                  value={form.bloodPressureSystolic}
                  onChange={handleChange(
                    "bloodPressureSystolic"
                  )}
                  placeholder="Mf. 120"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>BP Diastolic</FieldLabel>

                <Input
                  type="number"
                  value={form.bloodPressureDiastolic}
                  onChange={handleChange(
                    "bloodPressureDiastolic"
                  )}
                  placeholder="Mf. 80"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Pulse (bpm)</FieldLabel>

                <Input
                  type="number"
                  value={form.pulse}
                  onChange={handleChange("pulse")}
                  placeholder="Mf. 78"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>
                  Temperature (°C)
                </FieldLabel>

                <Input
                  type="number"
                  step="0.1"
                  value={form.temperature}
                  onChange={handleChange("temperature")}
                  placeholder="Mf. 36.7"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>
                  Respiratory Rate
                </FieldLabel>

                <Input
                  type="number"
                  value={form.respiratoryRate}
                  onChange={handleChange(
                    "respiratoryRate"
                  )}
                  placeholder="Mf. 18"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>
                  General Condition
                </FieldLabel>

                <Input
                  value={form.generalCondition}
                  onChange={handleChange(
                    "generalCondition"
                  )}
                  placeholder="Mf. Good"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Oedema</FieldLabel>

                <Input
                  value={form.oedema}
                  onChange={handleChange("oedema")}
                  placeholder="Mf. None"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Pallor</FieldLabel>

                <Input
                  value={form.pallor}
                  onChange={handleChange("pallor")}
                  placeholder="Mf. Absent"
                  disabled={isArchived || saving}
                />
              </div>
            </div>

            <div className="mt-5">
              <FieldLabel>
                Symptoms / Complaints
              </FieldLabel>

              <Textarea
                value={form.symptoms}
                onChange={handleChange("symptoms")}
                placeholder="Andika malalamiko au dalili za mgonjwa..."
                disabled={isArchived || saving}
              />
            </div>
          </Section>

          {/* Fetal assessment */}
          <Section
            icon={Baby}
            title="Fetal Assessment"
            description="Uchunguzi wa mtoto tumboni."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <FieldLabel>
                  Fundal Height (cm)
                </FieldLabel>

                <Input
                  type="number"
                  step="0.1"
                  value={form.fundalHeight}
                  onChange={handleChange(
                    "fundalHeight"
                  )}
                  placeholder="Mf. 24"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>
                  Fetal Heart Rate (bpm)
                </FieldLabel>

                <Input
                  type="number"
                  value={form.fetalHeartRate}
                  onChange={handleChange(
                    "fetalHeartRate"
                  )}
                  placeholder="Mf. 145"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>
                  Fetal Movement
                </FieldLabel>

                <Input
                  value={form.fetalMovement}
                  onChange={handleChange(
                    "fetalMovement"
                  )}
                  placeholder="Mf. Present"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Presentation</FieldLabel>

                <Input
                  value={form.presentation}
                  onChange={handleChange(
                    "presentation"
                  )}
                  placeholder="Mf. Cephalic"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Lie</FieldLabel>

                <Input
                  value={form.lie}
                  onChange={handleChange("lie")}
                  placeholder="Mf. Longitudinal"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Position</FieldLabel>

                <Input
                  value={form.position}
                  onChange={handleChange("position")}
                  placeholder="Mf. LOA"
                  disabled={isArchived || saving}
                />
              </div>
            </div>
          </Section>

          {/* Investigations */}
          <Section
            icon={FileText}
            title="Investigations"
            description="Vipimo na majibu ya uchunguzi."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <FieldLabel>
                  Haemoglobin (g/dL)
                </FieldLabel>

                <Input
                  type="number"
                  step="0.1"
                  value={form.haemoglobin}
                  onChange={handleChange(
                    "haemoglobin"
                  )}
                  placeholder="Mf. 12.4"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Blood Group</FieldLabel>

                <Select
                  value={form.bloodGroup}
                  onChange={handleChange(
                    "bloodGroup"
                  )}
                  disabled={isArchived || saving}
                >
                  <option value="">
                    Chagua blood group
                  </option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </Select>
              </div>

              <div>
                <FieldLabel>Rhesus</FieldLabel>

                <Select
                  value={form.rhesus}
                  onChange={handleChange("rhesus")}
                  disabled={isArchived || saving}
                >
                  <option value="">
                    Chagua rhesus
                  </option>
                  <option value="POSITIVE">
                    Positive
                  </option>
                  <option value="NEGATIVE">
                    Negative
                  </option>
                </Select>
              </div>

              <div>
                <FieldLabel>Urinalysis</FieldLabel>

                <Input
                  value={form.urinalysis}
                  onChange={handleChange(
                    "urinalysis"
                  )}
                  placeholder="Andika majibu..."
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Blood Sugar</FieldLabel>

                <Input
                  type="number"
                  step="0.1"
                  value={form.bloodSugar}
                  onChange={handleChange(
                    "bloodSugar"
                  )}
                  placeholder="Mf. 5.2"
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>HIV Result</FieldLabel>

                <Select
                  value={form.hivResult}
                  onChange={handleChange(
                    "hivResult"
                  )}
                  disabled={isArchived || saving}
                >
                  <option value="">
                    Chagua result
                  </option>
                  <option value="NEGATIVE">
                    Negative
                  </option>
                  <option value="POSITIVE">
                    Positive
                  </option>
                  <option value="UNKNOWN">
                    Unknown
                  </option>
                  <option value="NOT_DONE">
                    Not Done
                  </option>
                </Select>
              </div>

              <div>
                <FieldLabel>
                  Syphilis Result
                </FieldLabel>

                <Select
                  value={form.syphilisResult}
                  onChange={handleChange(
                    "syphilisResult"
                  )}
                  disabled={isArchived || saving}
                >
                  <option value="">
                    Chagua result
                  </option>
                  <option value="NEGATIVE">
                    Negative
                  </option>
                  <option value="POSITIVE">
                    Positive
                  </option>
                  <option value="UNKNOWN">
                    Unknown
                  </option>
                  <option value="NOT_DONE">
                    Not Done
                  </option>
                </Select>
              </div>

              <div>
                <FieldLabel>
                  Hepatitis B Result
                </FieldLabel>

                <Select
                  value={form.hepatitisBResult}
                  onChange={handleChange(
                    "hepatitisBResult"
                  )}
                  disabled={isArchived || saving}
                >
                  <option value="">
                    Chagua result
                  </option>
                  <option value="NEGATIVE">
                    Negative
                  </option>
                  <option value="POSITIVE">
                    Positive
                  </option>
                  <option value="UNKNOWN">
                    Unknown
                  </option>
                  <option value="NOT_DONE">
                    Not Done
                  </option>
                </Select>
              </div>

              <div>
                <FieldLabel>Ultrasound</FieldLabel>

                <Input
                  value={form.ultrasound}
                  onChange={handleChange(
                    "ultrasound"
                  )}
                  placeholder="Andika majibu..."
                  disabled={isArchived || saving}
                />
              </div>
            </div>

            <div className="mt-5">
              <FieldLabel>
                Other Investigations
              </FieldLabel>

              <Textarea
                value={form.otherInvestigations}
                onChange={handleChange(
                  "otherInvestigations"
                )}
                placeholder="Vipimo vingine..."
                disabled={isArchived || saving}
              />
            </div>
          </Section>

          {/* Clinical management */}
          <Section
            icon={Stethoscope}
            title="Clinical Management"
            description="Assessment, diagnosis na mpango wa matibabu."
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <FieldLabel>Assessment</FieldLabel>

                <Textarea
                  value={form.assessment}
                  onChange={handleChange(
                    "assessment"
                  )}
                  placeholder="Clinical assessment..."
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>
                  Risk Assessment
                </FieldLabel>

                <Textarea
                  value={form.riskAssessment}
                  onChange={handleChange(
                    "riskAssessment"
                  )}
                  placeholder="Risk assessment..."
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Diagnosis</FieldLabel>

                <Textarea
                  value={form.diagnosis}
                  onChange={handleChange(
                    "diagnosis"
                  )}
                  placeholder="Diagnosis..."
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Treatment</FieldLabel>

                <Textarea
                  value={form.treatment}
                  onChange={handleChange(
                    "treatment"
                  )}
                  placeholder="Treatment..."
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Medication</FieldLabel>

                <Textarea
                  value={form.medication}
                  onChange={handleChange(
                    "medication"
                  )}
                  placeholder="Medication..."
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Referral</FieldLabel>

                <Textarea
                  value={form.referral}
                  onChange={handleChange(
                    "referral"
                  )}
                  placeholder="Referral details..."
                  disabled={isArchived || saving}
                />
              </div>
            </div>
          </Section>

          {/* Advice */}
          <Section
            icon={Pill}
            title="Advice & Health Education"
            description="Ushauri na elimu ya afya iliyotolewa."
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <FieldLabel>Advice</FieldLabel>

                <Textarea
                  value={form.advice}
                  onChange={handleChange("advice")}
                  placeholder="Ushauri kwa mama..."
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>
                  Health Education
                </FieldLabel>

                <Textarea
                  value={form.healthEducation}
                  onChange={handleChange(
                    "healthEducation"
                  )}
                  placeholder="Elimu ya afya..."
                  disabled={isArchived || saving}
                />
              </div>
            </div>
          </Section>

          {/* Follow up */}
          <Section
            icon={Activity}
            title="Follow-up"
            description="Mpango wa ufuatiliaji wa mgonjwa."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <FieldLabel>
                  Next Visit Date
                </FieldLabel>

                <Input
                  type="date"
                  value={form.nextVisitDate}
                  onChange={handleChange(
                    "nextVisitDate"
                  )}
                  min={form.visitDate || undefined}
                  disabled={isArchived || saving}
                />
              </div>

              <div>
                <FieldLabel>Notes</FieldLabel>

                <Textarea
                  value={form.notes}
                  onChange={handleChange("notes")}
                  placeholder="Taarifa za ziada..."
                  rows={3}
                  disabled={isArchived || saving}
                />
              </div>
            </div>
          </Section>

          {/* Bottom actions */}
          <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 p-4 backdrop-blur sm:-mx-6 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to={`/maternity/anc-visits/${id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X size={18} />
                Ghairi
              </Link>

              <button
                type="submit"
                disabled={saving || isArchived}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={18} />

                {saving
                  ? "Inahifadhi..."
                  : "Hifadhi Mabadiliko"}
              </button>
            </div>
          </div>
        </form>

        {/* Clinical record note */}
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <Info
              size={20}
              className="mt-0.5 shrink-0 text-blue-700"
            />

            <div>
              <p className="font-bold text-blue-900">
                Muhimu kuhusu clinical history
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Kuhariri ANC visit hii kunarekebisha record hii
                iliyopo. Hakutengenezi visit mpya wala kufuta
                ANC visits nyingine za zamani. Records zilizowekwa
                <strong> ARCHIVED </strong>
                haziruhusiwi kuhaririwa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}