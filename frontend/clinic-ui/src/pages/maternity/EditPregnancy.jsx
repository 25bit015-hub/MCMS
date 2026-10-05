import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Baby,
  CalendarDays,
  CheckCircle2,
  Edit3,
  HeartPulse,
  Loader2,
  Save,
  ShieldAlert,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";

import api from "../../services/api";

const initialForm = {
  patientId: "",
  lmp: "",
  edd: "",
  gravida: "",
  para: "",
  livingChildren: "",
  abortions: "",
  status: "ACTIVE",
  highRisk: false,
  notes: "",
};

function calculateEddFromLmp(lmp) {
  if (!lmp) {
    return "";
  }

  const date = new Date(`${lmp}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + 280);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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

function getPatientName(pregnancy) {
  return pregnancy?.patientName || "-";
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

export default function EditPregnancy() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pregnancy, setPregnancy] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Pregnancy ID haijapatikana.");
      setLoading(false);
      return;
    }

    loadPregnancy();
  }, [id]);

  async function loadPregnancy() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/maternity/pregnancies/${id}`
      );

      const data = response.data;

      setPregnancy(data);

      setForm({
        patientId:
          data.patientId !== null &&
          data.patientId !== undefined
            ? String(data.patientId)
            : "",

        lmp: data.lmp || "",
        edd: data.edd || "",

        gravida:
          data.gravida !== null &&
          data.gravida !== undefined
            ? String(data.gravida)
            : "",

        para:
          data.para !== null &&
          data.para !== undefined
            ? String(data.para)
            : "",

        livingChildren:
          data.livingChildren !== null &&
          data.livingChildren !== undefined
            ? String(data.livingChildren)
            : "",

        abortions:
          data.abortions !== null &&
          data.abortions !== undefined
            ? String(data.abortions)
            : "",

        status: data.status || "ACTIVE",
        highRisk: Boolean(data.highRisk),
        notes: data.notes || "",
      });
    } catch (err) {
      console.error(
        "Failed to load pregnancy:",
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

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  }

  function handleLmpChange(event) {
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      lmp: value,
      edd:
        value && previous.edd
          ? previous.edd
          : calculateEddFromLmp(value),
    }));

    setError("");
    setSuccess("");
  }

  function handleReset() {
    if (!pregnancy) {
      return;
    }

    setForm({
      patientId:
        pregnancy.patientId !== null &&
        pregnancy.patientId !== undefined
          ? String(pregnancy.patientId)
          : "",

      lmp: pregnancy.lmp || "",
      edd: pregnancy.edd || "",

      gravida:
        pregnancy.gravida !== null &&
        pregnancy.gravida !== undefined
          ? String(pregnancy.gravida)
          : "",

      para:
        pregnancy.para !== null &&
        pregnancy.para !== undefined
          ? String(pregnancy.para)
          : "",

      livingChildren:
        pregnancy.livingChildren !== null &&
        pregnancy.livingChildren !== undefined
          ? String(pregnancy.livingChildren)
          : "",

      abortions:
        pregnancy.abortions !== null &&
        pregnancy.abortions !== undefined
          ? String(pregnancy.abortions)
          : "",

      status: pregnancy.status || "ACTIVE",
      highRisk: Boolean(pregnancy.highRisk),
      notes: pregnancy.notes || "",
    });

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!pregnancy?.id) {
      setError(
        "Pregnancy record haijapatikana."
      );
      return;
    }

    /*
     * IMPORTANT:
     * Patient relationship must never change.
     * The backend also protects this rule.
     */
    if (
      String(form.patientId) !==
      String(pregnancy.patientId)
    ) {
      setError(
        "Patient wa pregnancy hii hawezi kubadilishwa. Ili kuhifadhi medical history, pregnancy lazima ibaki kwa patient wake wa awali."
      );
      return;
    }

    if (!form.lmp) {
      setError("LMP inahitajika.");
      return;
    }

    if (!form.edd) {
      setError("EDD inahitajika.");
      return;
    }

    const gravida =
      form.gravida === ""
        ? null
        : Number(form.gravida);

    const para =
      form.para === ""
        ? null
        : Number(form.para);

    const livingChildren =
      form.livingChildren === ""
        ? null
        : Number(form.livingChildren);

    const abortions =
      form.abortions === ""
        ? null
        : Number(form.abortions);

    if (
      gravida !== null &&
      (Number.isNaN(gravida) || gravida < 1)
    ) {
      setError(
        "Gravida lazima iwe namba sahihi."
      );
      return;
    }

    if (
      para !== null &&
      (Number.isNaN(para) || para < 0)
    ) {
      setError(
        "Para lazima iwe namba sahihi."
      );
      return;
    }

    if (
      livingChildren !== null &&
      (Number.isNaN(livingChildren) ||
        livingChildren < 0)
    ) {
      setError(
        "Living Children lazima iwe namba sahihi."
      );
      return;
    }

    if (
      abortions !== null &&
      (Number.isNaN(abortions) ||
        abortions < 0)
    ) {
      setError(
        "Abortions lazima iwe namba sahihi."
      );
      return;
    }

    if (
      gravida !== null &&
      para !== null &&
      para > gravida
    ) {
      setError(
        "Para haiwezi kuwa kubwa kuliko Gravida."
      );
      return;
    }

    /*
     * Do not allow arbitrary status manipulation.
     * ACTIVE/COMPLETED/ARCHIVED should be controlled
     * by proper clinical workflow.
     */
    const currentStatus = String(
      pregnancy.status || ""
    ).toUpperCase();

    if (currentStatus === "ARCHIVED") {
      setError(
        "Pregnancy hii ni ARCHIVED na inalindwa kama historical record. Haiwezi kuhaririwa."
      );
      return;
    }

    const pregnancyData = {
      patientId: Number(
        pregnancy.patientId
      ),
      lmp: form.lmp,
      edd: form.edd,
      gravida,
      para,
      livingChildren,
      abortions,
      status: pregnancy.status || "ACTIVE",
      highRisk: Boolean(form.highRisk),
      notes: form.notes.trim() || null,
    };

    try {
      setSaving(true);

      await api.put(
        `/maternity/pregnancies/${pregnancy.id}`,
        pregnancyData
      );

      setSuccess(
        "Taarifa za pregnancy zimeboreshwa kwa mafanikio."
      );

      setTimeout(() => {
        navigate(
          `/maternity/pregnancies/${pregnancy.id}`
        );
      }, 800);
    } catch (err) {
      console.error(
        "Failed to update pregnancy:",
        err
      );

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data;

      if (err.response?.status === 409) {
        setError(
          typeof backendMessage === "string"
            ? backendMessage
            : "Mabadiliko haya yameshindwa kwa sababu yanapingana na pregnancy nyingine ACTIVE."
        );
      } else {
        setError(
          typeof backendMessage === "string"
            ? backendMessage
            : "Imeshindikana ku-update pregnancy. Tafadhali jaribu tena."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-rose-50/40 p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-rose-600" />
          <span className="text-sm font-medium">
            Inapakia pregnancy...
          </span>
        </div>
      </div>
    );
  }

  if (!pregnancy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/40 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/maternity/pregnancies"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Rudi kwenye Pregnancies
          </Link>

          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-bold">
                  Pregnancy haikupatikana
                </p>

                <p className="mt-1 text-sm">
                  {error ||
                    "Taarifa ya pregnancy haipo."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isArchived =
    String(
      pregnancy.status || ""
    ).toUpperCase() === "ARCHIVED";

  const isCompleted =
    String(
      pregnancy.status || ""
    ).toUpperCase() === "COMPLETED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/40 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Link
              to={`/maternity/pregnancies/${pregnancy.id}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
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
                    <ShieldAlert className="h-3.5 w-3.5" />
                    HIGH RISK
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Edit3 className="h-6 w-6 text-rose-500" />

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Edit Pregnancy
                </h1>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Rekebisha taarifa za pregnancy bila
                kuharibu patient relationship au ANC history.
              </p>
            </div>
          </div>

          <Link
            to={`/maternity/pregnancies/${pregnancy.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <UserRound className="h-4 w-4" />
            Pregnancy Profile
          </Link>
        </div>

        {/* =====================================================
            PROTECTION NOTICE
        ====================================================== */}

        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
          <div className="flex items-start gap-3 text-blue-800">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-bold">
                Medical History Protection
              </p>

              <p className="mt-1 text-sm leading-6">
                Patient wa pregnancy hii hawezi kubadilishwa.
                ANC visits zilizopo hazitafutwa wala
                ku-overwrite wakati wa ku-update taarifa hizi.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            ERRORS / SUCCESS
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

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

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-bold">
                Umefanikiwa
              </p>

              <p className="mt-1 text-sm">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            PATIENT INFORMATION
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Patient
                </h2>

                <p className="text-sm text-slate-500">
                  Patient relationship inalindwa.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                <UserRound className="h-7 w-7" />
              </div>

              <div>
                <p className="text-lg font-bold text-slate-900">
                  {getPatientName(
                    pregnancy
                  )}
                </p>

                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600">
                    Patient No:{" "}
                    {pregnancy.patientNumber ||
                      "-"}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600">
                    Patient ID:{" "}
                    {pregnancy.patientId ||
                      "-"}
                  </span>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                <CheckCircle2 className="h-4 w-4" />
                Protected
              </div>
            </div>

            <input
              type="hidden"
              name="patientId"
              value={form.patientId}
            />
          </div>
        </section>

        {/* =====================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* ===================================================
              PREGNANCY DETAILS
          ==================================================== */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-pink-50 to-white px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                  <HeartPulse className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Taarifa za Ujauzito
                  </h2>

                  <p className="text-sm text-slate-500">
                    Rekebisha taarifa za msingi za pregnancy.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {/* LMP */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    LMP
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="date"
                      name="lmp"
                      value={form.lmp}
                      onChange={handleLmpChange}
                      required
                      disabled={isArchived}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {/* EDD */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    EDD
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="date"
                      name="edd"
                      value={form.edd}
                      onChange={handleChange}
                      required
                      disabled={isArchived}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {/* GRAVIDA */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Gravida
                  </label>

                  <input
                    type="number"
                    name="gravida"
                    min="1"
                    value={form.gravida}
                    onChange={handleChange}
                    disabled={isArchived}
                    placeholder="Mfano: 2"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>

                {/* PARA */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Para
                  </label>

                  <input
                    type="number"
                    name="para"
                    min="0"
                    value={form.para}
                    onChange={handleChange}
                    disabled={isArchived}
                    placeholder="Mfano: 1"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>

                {/* LIVING CHILDREN */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Watoto Walio Hai
                  </label>

                  <input
                    type="number"
                    name="livingChildren"
                    min="0"
                    value={form.livingChildren}
                    onChange={handleChange}
                    disabled={isArchived}
                    placeholder="Mfano: 1"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>

                {/* ABORTIONS */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Abortions
                  </label>

                  <input
                    type="number"
                    name="abortions"
                    min="0"
                    value={form.abortions}
                    onChange={handleChange}
                    disabled={isArchived}
                    placeholder="Mfano: 0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    LMP
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {formatDate(form.lmp)}
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                    EDD
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {formatDate(form.edd)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================
              RISK
          ==================================================== */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Risk Assessment
                  </h2>

                  <p className="text-sm text-slate-500">
                    Rekebisha pregnancy risk classification.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <label
                className={`flex items-start gap-3 rounded-2xl border p-4 ${
                  form.highRisk
                    ? "border-red-200 bg-red-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  name="highRisk"
                  checked={form.highRisk}
                  onChange={handleChange}
                  disabled={isArchived}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-500 disabled:cursor-not-allowed"
                />

                <span>
                  <span className="flex items-center gap-2 font-bold text-slate-900">
                    High Risk Pregnancy

                    {form.highRisk && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                        HIGH RISK
                      </span>
                    )}
                  </span>

                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    Weka alama hii kama pregnancy
                    imetambuliwa kuwa ya high risk.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* ===================================================
              NOTES
          ==================================================== */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Baby className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Clinical Notes
                  </h2>

                  <p className="text-sm text-slate-500">
                    Taarifa za ziada za pregnancy.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                disabled={isArchived}
                rows={6}
                placeholder="Andika taarifa muhimu..."
                className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </section>

          {/* ===================================================
              STATUS INFORMATION
          ==================================================== */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <UsersRound className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Current Status
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {pregnancy.status || "-"}
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-bold ${getStatusClasses(
                  pregnancy.status
                )}`}
              >
                {pregnancy.status || "-"}
              </div>
            </div>

            {isCompleted && (
              <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Pregnancy hii imekamilika. Status
                inahifadhiwa na clinical workflow; form
                hii haibadilishi status yake kiholela.
              </p>
            )}

            {isArchived && (
              <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                Pregnancy hii ni ARCHIVED na inalindwa
                kama historical record. Hakuna clinical
                field inayoweza kuhaririwa.
              </p>
            )}
          </section>

          {/* ===================================================
              ACTIONS
          ==================================================== */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Link
              to={`/maternity/pregnancies/${pregnancy.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Ghairi
            </Link>

            <button
              type="button"
              onClick={handleReset}
              disabled={saving || isArchived}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Rudisha
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                isArchived
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Inahifadhi...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Hifadhi Mabadiliko
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}