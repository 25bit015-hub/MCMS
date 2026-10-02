import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Thermometer,
  HeartPulse,
  Activity,
  Wind,
  Droplets,
  Weight,
  Ruler,
  Save,
  User,
} from "lucide-react";

import api from "../../services/api";

export default function Vitals() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // GET VISIT ID FROM URL
  // Example:
  // /nurse/patients/17/vitals?visitId=2
  // =====================================================

  const [searchParams] = useSearchParams();
  const visitId = searchParams.get("visitId");

  const [patient, setPatient] = useState(null);

  const [form, setForm] = useState({
    temperature: "",
    bloodPressure: "",
    pulse: "",
    respiratoryRate: "",
    spo2: "",
    weight: "",
    height: "",
  });

  const [latestVitals, setLatestVitals] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PATIENT + LATEST VITALS FOR THIS VISIT
  // =====================================================

  useEffect(() => {
    const loadPatientAndVitals = async () => {
      try {
        setLoading(true);
        setError("");

        // -----------------------------------------------
        // Validate patient ID
        // -----------------------------------------------

        if (!id) {
          setError("Patient ID haijapatikana.");
          setPatient(null);
          return;
        }

        // -----------------------------------------------
        // Validate visit ID
        // -----------------------------------------------

        if (!visitId) {
          setError(
            "Visit ID haijapatikana. Tafadhali fungua Vitals kupitia Queue."
          );
          setPatient(null);
          return;
        }

        console.log("VITALS PATIENT ID:", id);
        console.log("VITALS VISIT ID:", visitId);

        // -----------------------------------------------
        // GET PATIENT
        // -----------------------------------------------

        const patientResponse = await api.get(
          `/patients/${id}`
        );

        const foundPatient = patientResponse.data;

        console.log(
          "PATIENT FROM API:",
          foundPatient
        );

        if (!foundPatient) {
          setPatient(null);
          setError(
            "Taarifa za mgonjwa hazikupatikana."
          );
          return;
        }

        setPatient(foundPatient);

        // -----------------------------------------------
        // GET LATEST VITALS FOR THIS VISIT
        // -----------------------------------------------

        try {
          const vitalsResponse = await api.get(
            `/vitals/visit/${visitId}/latest`
          );

          const latest = vitalsResponse.data;

          console.log(
            "LATEST VITALS FOR VISIT:",
            latest
          );

          setLatestVitals(latest);

          if (latest) {
            setForm({
              temperature:
                latest.temperature ?? "",

              bloodPressure:
                latest.bloodPressure ?? "",

              pulse:
                latest.pulseRate ?? "",

              respiratoryRate:
                latest.respiratoryRate ?? "",

              spo2:
                latest.oxygenSaturation ?? "",

              weight:
                latest.weight ?? "",

              height:
                latest.height ?? "",
            });
          } else {
            setLatestVitals(null);

            setForm({
              temperature: "",
              bloodPressure: "",
              pulse: "",
              respiratoryRate: "",
              spo2: "",
              weight: "",
              height: "",
            });
          }

        } catch (vitalsError) {
          // ---------------------------------------------
          // No previous vitals
          // ---------------------------------------------

          if (
            vitalsError.response?.status === 404
          ) {
            console.log(
              "No previous vitals found for this visit."
            );

            setLatestVitals(null);

            setForm({
              temperature: "",
              bloodPressure: "",
              pulse: "",
              respiratoryRate: "",
              spo2: "",
              weight: "",
              height: "",
            });
          } else {
            throw vitalsError;
          }
        }

      } catch (error) {
        console.error(
          "Failed to load patient/vitals:",
          error
        );

        setPatient(null);

        if (
          error.response?.status === 404
        ) {
          setError(
            "Mgonjwa hakupatikana kwenye database."
          );
        } else if (
          error.response?.status === 401
        ) {
          setError(
            "Session yako imeisha. Tafadhali login tena."
          );
        } else {
          setError(
            "Imeshindikana kupata taarifa za mgonjwa."
          );
        }

      } finally {
        setLoading(false);
      }
    };

    loadPatientAndVitals();

  }, [id, visitId]);

  // =====================================================
  // FULL NAME
  // =====================================================

  const getFullName = () => {
    if (!patient) {
      return "";
    }

    return (
      `${patient.firstName || ""} ${
        patient.middleName || ""
      } ${patient.lastName || ""}`
        .replace(/\s+/g, " ")
        .trim()
    );
  };

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = () => {
    const fullName = getFullName();

    if (!fullName) {
      return "P";
    }

    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name.charAt(0).toUpperCase()
      )
      .join("");
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!form.temperature) {
      return "Temperature inahitajika.";
    }

    if (!form.bloodPressure.trim()) {
      return "Blood pressure inahitajika.";
    }

    if (!form.pulse) {
      return "Pulse rate inahitajika.";
    }

    if (!form.respiratoryRate) {
      return "Respiratory rate inahitajika.";
    }

    if (!form.spo2) {
      return "Oxygen saturation (SpO₂) inahitajika.";
    }

    if (!form.weight) {
      return "Weight inahitajika.";
    }

    if (!form.height) {
      return "Height inahitajika.";
    }

    // -----------------------------------------------
    // Numeric validation
    // -----------------------------------------------

    const temperature =
      Number(form.temperature);

    const pulse =
      Number(form.pulse);

    const respiratoryRate =
      Number(form.respiratoryRate);

    const spo2 =
      Number(form.spo2);

    const weight =
      Number(form.weight);

    const height =
      Number(form.height);

    if (
      Number.isNaN(temperature) ||
      temperature <= 0
    ) {
      return "Temperature si sahihi.";
    }

    if (
      Number.isNaN(pulse) ||
      pulse <= 0
    ) {
      return "Pulse rate si sahihi.";
    }

    if (
      Number.isNaN(respiratoryRate) ||
      respiratoryRate <= 0
    ) {
      return "Respiratory rate si sahihi.";
    }

    if (
      Number.isNaN(spo2) ||
      spo2 <= 0 ||
      spo2 > 100
    ) {
      return "SpO₂ lazima iwe kati ya 1 na 100.";
    }

    if (
      Number.isNaN(weight) ||
      weight <= 0
    ) {
      return "Weight si sahihi.";
    }

    if (
      Number.isNaN(height) ||
      height <= 0
    ) {
      return "Height si sahihi.";
    }

    return "";
  };

  // =====================================================
  // SAVE VITALS
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patient) {
      setError(
        "Taarifa za mgonjwa hazipatikani."
      );
      return;
    }

    // -----------------------------------------------
    // Validate Visit ID
    // -----------------------------------------------

    if (!visitId) {
      setError(
        "Visit ID haijapatikana. Tafadhali rudi Queue na ufungue Vitals tena."
      );
      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      // -----------------------------------------------
      // Payload
      // -----------------------------------------------

      const vitalsData = {
        // IMPORTANT:
        // Backend sasa inahitaji Visit ID
        visitId: Number(visitId),

        bloodPressure:
          form.bloodPressure.trim(),

        pulseRate:
          Number(form.pulse),

        temperature:
          Number(form.temperature),

        respiratoryRate:
          Number(form.respiratoryRate),

        oxygenSaturation:
          Number(form.spo2),

        weight:
          Number(form.weight),

        height:
          Number(form.height),

        notes:
          "Vitals recorded by nurse",
      };

      console.log(
        "VITALS DATA TO API:",
        vitalsData
      );

      console.log(
        "SAVING VITALS FOR PATIENT:",
        patient.id
      );

      console.log(
        "SAVING VITALS FOR VISIT:",
        visitId
      );

      // -----------------------------------------------
      // POST TO BACKEND
      // -----------------------------------------------

      const response =
        await api.post(
          `/vitals/patient/${patient.id}`,
          vitalsData
        );

      console.log(
        "VITALS SAVED:",
        response.data
      );

      // -----------------------------------------------
      // Update latest vitals
      // -----------------------------------------------

      setLatestVitals(
        response.data
      );

      // -----------------------------------------------
      // Continue to Send To Doctor
      // Preserve visitId
      // -----------------------------------------------

      navigate(
        `/nurse/patients/${patient.id}/send-doctor?visitId=${visitId}`
      );

    } catch (error) {
      console.error(
        "Failed to save vitals:",
        error
      );

      if (
        error.response?.status === 400
      ) {
        setError(
          "Taarifa za vitals si sahihi. Tafadhali hakikisha umejaza vizuri."
        );
      } else if (
        error.response?.status === 401
      ) {
        setError(
          "Session yako imeisha. Tafadhali login tena."
        );
      } else if (
        error.response?.status === 404
      ) {
        setError(
          "Mgonjwa au Visit hakupatikana kwenye database."
        );
      } else {
        setError(
          "Imeshindikana kuhifadhi vital signs. Tafadhali jaribu tena."
        );
      }

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <div
            className="
              mx-auto h-10 w-10
              animate-spin rounded-full
              border-4 border-slate-200
              border-t-blue-600
            "
          />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading patient information...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // PATIENT NOT FOUND
  // =====================================================

  if (!patient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <div
            className="
              mx-auto flex h-16 w-16
              items-center justify-center
              rounded-full bg-slate-100
            "
          >
            <User
              size={28}
              className="text-slate-400"
            />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Patient Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "The patient you are looking for does not exist."}
          </p>

          <Link
            to="/nurse"
            className="
              mt-5 inline-flex
              rounded-xl bg-blue-600
              px-5 py-3
              text-sm font-bold text-white
              transition hover:bg-blue-700
            "
          >
            Back to Nurse Dashboard
          </Link>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex flex-col gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div className="flex items-center gap-3">

          <Link
            to="/nurse"
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-slate-200
              bg-white
              text-slate-600
              shadow-sm
              transition
              hover:bg-slate-50
              hover:text-blue-600
            "
          >
            <ArrowLeft size={19} />
          </Link>

          <div>

            <p className="text-sm font-semibold text-blue-600">
              Nursing Assessment
            </p>

            <h1 className="text-2xl font-bold text-slate-800">
              Record Vital Signs
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Visit ID: {visitId}
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          className="
            rounded-xl
            border border-red-200
            bg-red-50
            px-4 py-3
            text-sm font-medium
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* =================================================
          PATIENT CARD
      ================================================= */}

      <div
        className="
          rounded-2xl
          border border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        <div className="flex items-center gap-4">

          <div
            className="
              flex h-14 w-14
              items-center justify-center
              rounded-full
              bg-blue-100
              text-lg font-bold
              text-blue-700
            "
          >
            {getInitials()}
          </div>

          <div>

            <h2 className="text-lg font-bold text-slate-800">
              {getFullName()}
            </h2>

            <div
              className="
                mt-1 flex flex-wrap
                gap-x-4 gap-y-1
                text-sm text-slate-500
              "
            >

              <span>
                Patient No:{" "}
                <strong className="text-slate-700">
                  {patient.patientNumber ||
                    `PAT-${String(
                      patient.id
                    ).padStart(6, "0")}`}
                </strong>
              </span>

              <span>
                Gender:{" "}
                <strong className="text-slate-700">
                  {patient.gender || "—"}
                </strong>
              </span>

              <span>
                Phone:{" "}
                <strong className="text-slate-700">
                  {patient.phone || "—"}
                </strong>
              </span>

              <span>
                Visit ID:{" "}
                <strong className="text-slate-700">
                  {visitId}
                </strong>
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          LATEST VITALS
      ================================================= */}

      {latestVitals && (
        <div
          className="
            rounded-2xl
            border border-blue-100
            bg-blue-50/50
            p-6
          "
        >

          <div className="mb-4">

            <h2 className="text-lg font-bold text-slate-800">
              Latest Recorded Vitals
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Most recent vital signs from this visit.
            </p>

          </div>

          <div
            className="
              grid grid-cols-2
              gap-4
              md:grid-cols-4
            "
          >

            <VitalSummary
              label="Blood Pressure"
              value={
                latestVitals.bloodPressure ||
                "—"
              }
              unit="mmHg"
            />

            <VitalSummary
              label="Pulse"
              value={
                latestVitals.pulseRate ??
                "—"
              }
              unit="bpm"
            />

            <VitalSummary
              label="Temperature"
              value={
                latestVitals.temperature ??
                "—"
              }
              unit="°C"
            />

            <VitalSummary
              label="SpO₂"
              value={
                latestVitals.oxygenSaturation ??
                "—"
              }
              unit="%"
            />

            <VitalSummary
              label="Respiratory"
              value={
                latestVitals.respiratoryRate ??
                "—"
              }
              unit="breaths/min"
            />

            <VitalSummary
              label="Weight"
              value={
                latestVitals.weight ??
                "—"
              }
              unit="kg"
            />

            <VitalSummary
              label="Height"
              value={
                latestVitals.height ??
                "—"
              }
              unit="cm"
            />

            <VitalSummary
              label="BMI"
              value={
                latestVitals.bmi ??
                "—"
              }
              unit=""
            />

          </div>

        </div>
      )}

      {/* =================================================
          VITALS FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="
          overflow-hidden
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-sm
        "
      >

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="text-lg font-bold text-slate-800">
            Vital Signs
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter the patient's current vital signs.
          </p>

        </div>

        <div
          className="
            grid grid-cols-1
            gap-6
            p-6
            md:grid-cols-2
          "
        >

          {/* Temperature */}

          <VitalInput
            label="Temperature"
            name="temperature"
            value={form.temperature}
            onChange={handleChange}
            placeholder="36.5"
            unit="°C"
            icon={Thermometer}
          />

          {/* Blood Pressure */}

          <VitalInput
            label="Blood Pressure"
            name="bloodPressure"
            value={form.bloodPressure}
            onChange={handleChange}
            placeholder="120/80"
            unit="mmHg"
            icon={Activity}
            inputType="text"
          />

          {/* Pulse */}

          <VitalInput
            label="Pulse"
            name="pulse"
            value={form.pulse}
            onChange={handleChange}
            placeholder="72"
            unit="bpm"
            icon={HeartPulse}
          />

          {/* Respiratory */}

          <VitalInput
            label="Respiratory Rate"
            name="respiratoryRate"
            value={form.respiratoryRate}
            onChange={handleChange}
            placeholder="18"
            unit="breaths/min"
            icon={Wind}
          />

          {/* SpO2 */}

          <VitalInput
            label="SpO₂"
            name="spo2"
            value={form.spo2}
            onChange={handleChange}
            placeholder="98"
            unit="%"
            icon={Droplets}
          />

          {/* Weight */}

          <VitalInput
            label="Weight"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            placeholder="70"
            unit="kg"
            icon={Weight}
          />

          {/* Height */}

          <VitalInput
            label="Height"
            name="height"
            value={form.height}
            onChange={handleChange}
            placeholder="170"
            unit="cm"
            icon={Ruler}
          />

        </div>

        {/* =================================================
            FORM FOOTER
        ================================================= */}

        <div
          className="
            flex flex-col-reverse
            gap-3
            border-t border-slate-100
            bg-slate-50/60
            p-6
            sm:flex-row
            sm:justify-end
          "
        >

          <Link
            to="/nurse"
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              border border-slate-200
              bg-white
              px-5 py-3
              text-sm font-bold
              text-slate-600
              transition
              hover:bg-slate-100
            "
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5 py-3
              text-sm font-bold
              text-white
              shadow-lg
              shadow-blue-500/20
              transition
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save Vitals"}

          </button>

        </div>

      </form>

    </div>
  );
}

// =====================================================
// VITAL INPUT COMPONENT
// =====================================================

function VitalInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  unit,
  icon: Icon,
  inputType = "number",
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="
          mb-2 block
          text-sm font-bold
          text-slate-700
        "
      >
        {label}
      </label>

      <div className="relative">

        {/* Icon */}

        <div
          className="
            absolute left-3 top-1/2
            flex h-8 w-8
            -translate-y-1/2
            items-center justify-center
            rounded-lg
            bg-blue-50
          "
        >
          <Icon
            size={17}
            className="text-blue-600"
          />
        </div>

        {/* Input */}

        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          step={
            inputType === "number"
              ? name === "temperature" ||
                name === "weight" ||
                name === "height"
                ? "0.1"
                : "1"
              : undefined
          }
          min={
            inputType === "number"
              ? "0"
              : undefined
          }
          className="
            h-12 w-full
            rounded-xl
            border border-slate-200
            bg-white
            pl-14 pr-24
            text-sm font-semibold
            text-slate-700
            outline-none
            transition
            placeholder:text-slate-300
            focus:border-blue-400
            focus:ring-4
            focus:ring-blue-500/10
          "
        />

        {/* Unit */}

        <span
          className="
            absolute right-4 top-1/2
            -translate-y-1/2
            text-xs font-bold
            text-slate-400
          "
        >
          {unit}
        </span>

      </div>

    </div>
  );
}

// =====================================================
// VITAL SUMMARY COMPONENT
// =====================================================

function VitalSummary({
  label,
  value,
  unit,
}) {
  return (
    <div
      className="
        rounded-xl
        border border-slate-200
        bg-white
        p-4
      "
    >

      <p className="text-xs font-semibold text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-baseline gap-1">

        <span className="text-lg font-bold text-slate-800">
          {value}
        </span>

        {unit && (
          <span className="text-xs font-medium text-slate-400">
            {unit}
          </span>
        )}

      </div>

    </div>
  );
}