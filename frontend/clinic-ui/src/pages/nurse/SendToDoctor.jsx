import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Stethoscope,
  User,
  Thermometer,
  HeartPulse,
  Activity,
  Wind,
  Droplets,
  Weight,
} from "lucide-react";

import api from "../../services/api";

export default function SendToDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // GET VISIT ID FROM URL
  // =====================================================

  const [searchParams] = useSearchParams();
  const visitId = searchParams.get("visitId");

  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // GET TODAY'S DATE
  // ==========================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // LOAD PATIENT + VITALS
  // ==========================================

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        setError("");

        // ==========================================
        // VALIDATE PATIENT ID
        // ==========================================

        if (!id) {
          setError(
            "Patient ID haijapatikana."
          );

          setPatient(null);
          return;
        }

        // ==========================================
        // VALIDATE VISIT ID
        // ==========================================

        if (!visitId) {
          setError(
            "Visit ID haijapatikana. Tafadhali rudi kwenye Nurse Dashboard na uchague visit sahihi."
          );

          setPatient(null);
          return;
        }

        console.log(
          "SEND TO DOCTOR PATIENT ID:",
          id
        );

        console.log(
          "SEND TO DOCTOR VISIT ID:",
          visitId
        );

        // ==========================================
        // GET PATIENT
        // ==========================================

        const patientResponse =
          await api.get(
            `/patients/${id}`
          );

        setPatient(
          patientResponse.data
        );

        // ==========================================
        // GET LATEST VITALS FOR THIS VISIT
        // ==========================================

        try {
          const vitalsResponse =
            await api.get(
              `/vitals/visit/${visitId}/latest`
            );

          console.log(
            "VISIT VITALS:",
            vitalsResponse.data
          );

          setVitals(
            vitalsResponse.data
          );

        } catch (vitalsError) {

          // Patient anaweza kuwa hana vitals bado
          if (
            vitalsError.response?.status === 404
          ) {
            setVitals(null);
          } else {
            throw vitalsError;
          }
        }

      } catch (error) {

        console.error(
          "Failed to load patient/send-to-doctor data:",
          error
        );

        if (
          error.response?.status === 404
        ) {
          setError(
            "Taarifa za mgonjwa au visit hazikupatikana kwenye database."
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

    loadPatientData();

  }, [id, visitId]);

  // ==========================================
  // FULL NAME
  // ==========================================

  const getFullName = () => {
    if (!patient) {
      return "";
    }

    return (
      `${patient.firstName || ""} ${
        patient.middleName || ""
      } ${patient.lastName || ""}`
    )
      .replace(/\s+/g, " ")
      .trim();
  };

  // ==========================================
  // SEND PATIENT TO DOCTOR
  // ==========================================

  const handleSendToDoctor = async () => {
    if (!patient) {
      return;
    }

    // ==========================================
    // VALIDATE VISIT ID
    // ==========================================

    if (!visitId) {
      setError(
        "Visit ID haijapatikana. Tafadhali rudi kwenye Vitals."
      );

      return;
    }

    try {
      setSending(true);
      setError("");

      // ==========================================
      // GET TODAY'S QUEUE
      // ==========================================

      const today = getTodayDate();

      const queueResponse =
        await api.get(
          `/patient-queue/date?date=${today}`
        );

      const queueList =
        Array.isArray(queueResponse.data)
          ? queueResponse.data
          : [];

      // ==========================================
      // FIND THIS PATIENT'S TODAY QUEUE
      // USING PATIENT ID + VISIT ID
      // ==========================================

      const patientQueue =
        queueList.find(
          (queue) =>
            Number(queue.patientId) ===
              Number(patient.id) &&
            Number(queue.visitId) ===
              Number(visitId)
        );

      console.log(
        "PATIENT QUEUE FOR VISIT:",
        patientQueue
      );

      // ==========================================
      // NO QUEUE FOUND
      // ==========================================

      if (!patientQueue) {
        setError(
          "Mgonjwa hana queue inayohusiana na visit hii ya leo. Tafadhali hakikisha queue na visit vinafanana."
        );

        return;
      }

      // ==========================================
      // CHECK CURRENT STATUS
      // ==========================================

      if (
        patientQueue.status ===
        "SENT_TO_DOCTOR"
      ) {
        setError(
          "Mgonjwa huyu tayari ametumwa kwa daktari."
        );

        return;
      }

      // ==========================================
      // UPDATE QUEUE
      // SENT_TO_DOCTOR
      // ==========================================

      await api.patch(
        `/patient-queue/${patientQueue.id}/status`,
        null,
        {
          params: {
            status: "SENT_TO_DOCTOR",
          },
        }
      );

      // ==========================================
      // SUCCESS
      // ==========================================

      alert(
        `Mgonjwa ${getFullName()} ametumwa kwa daktari kwa mafanikio.`
      );

      // ==========================================
      // RETURN TO NURSE DASHBOARD
      // ==========================================

      navigate("/nurse");

    } catch (error) {

      console.error(
        "Failed to send patient to doctor:",
        error
      );

      if (
        error.response?.status === 400
      ) {
        setError(
          "Taarifa za queue si sahihi. Tafadhali jaribu tena."
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
          "Queue au visit ya mgonjwa haikupatikana."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Imeshindikana kumtuma mgonjwa kwa daktari."
        );
      }

    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <div
            className="
              mx-auto h-12 w-12
              animate-spin rounded-full
              border-4 border-slate-200
              border-t-blue-600
            "
          />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Inapakia taarifa za mgonjwa...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // PATIENT NOT FOUND
  // ==========================================

  if (error && !patient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <div
            className="
              mx-auto flex h-16 w-16
              items-center justify-center
              rounded-full bg-red-50
            "
          >
            <User
              size={28}
              className="text-red-500"
            />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Patient Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <Link
            to="/nurse"
            className="
              mt-5 inline-flex
              rounded-xl bg-blue-600
              px-5 py-3
              text-sm font-bold text-white
              hover:bg-blue-700
            "
          >
            Back to Nurse Dashboard
          </Link>

        </div>
      </div>
    );
  }

  const recordedVitals =
    vitals || {};

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex items-center gap-3">

        <Link
          to={`/nurse/patients/${patient.id}/vitals?visitId=${visitId}`}
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
            Send Patient to Doctor
          </h1>

        </div>

      </div>

      {/* ==========================================
          ERROR MESSAGE
      ========================================== */}

      {error && (
        <div
          className="
            rounded-xl
            border border-red-200
            bg-red-50
            px-5 py-4
            text-sm font-medium
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* ==========================================
          SUCCESS INFORMATION
      ========================================== */}

      <div
        className="
          rounded-2xl
          border border-emerald-200
          bg-emerald-50
          p-6
        "
      >

        <div className="flex gap-4">

          <div
            className="
              flex h-12 w-12 shrink-0
              items-center justify-center
              rounded-full
              bg-emerald-100
            "
          >
            <CheckCircle2
              size={25}
              className="text-emerald-600"
            />
          </div>

          <div>

            <h2 className="text-lg font-bold text-emerald-800">
              Vital Signs Recorded
            </h2>

            <p className="mt-1 text-sm text-emerald-700">
              Taarifa za vital signs zimehifadhiwa.
              Kagua taarifa hapa chini kabla ya
              kumtuma mgonjwa kwa daktari.
            </p>

          </div>

        </div>

      </div>

      {/* ==========================================
          PATIENT INFORMATION
      ========================================== */}

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
            {getFullName()
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map(
                (name) =>
                  name.charAt(0)
              )
              .join("")
              .toUpperCase()}
          </div>

          <div>

            <h2 className="text-lg font-bold text-slate-800">
              {getFullName()}
            </h2>

            <div
              className="
                mt-1 flex flex-wrap
                gap-x-5 gap-y-1
                text-sm text-slate-500
              "
            >

              <span>
                Patient No:{" "}
                <strong className="text-slate-700">
                  {patient.patientNumber || "—"}
                </strong>
              </span>

              <span>
                Visit No:{" "}
                <strong className="text-slate-700">
                  {vitals?.visitNumber ||
                    `VIS-${String(
                      visitId
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

            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          VITAL SIGNS
      ========================================== */}

      <div
        className="
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-sm
        "
      >

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="text-lg font-bold text-slate-800">
            Recorded Vital Signs
          </h2>

        </div>

        {!vitals ? (

          <div className="p-6 text-sm text-slate-500">
            Hakuna vital signs zilizopatikana
            kwa visit hii.
          </div>

        ) : (

          <div
            className="
              grid grid-cols-1
              gap-4
              p-6
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >

            <VitalCard
              label="Temperature"
              value={recordedVitals.temperature}
              unit="°C"
              icon={Thermometer}
            />

            <VitalCard
              label="Blood Pressure"
              value={recordedVitals.bloodPressure}
              unit="mmHg"
              icon={Activity}
            />

            <VitalCard
              label="Pulse"
              value={recordedVitals.pulseRate}
              unit="bpm"
              icon={HeartPulse}
            />

            <VitalCard
              label="Respiratory Rate"
              value={
                recordedVitals.respiratoryRate
              }
              unit="breaths/min"
              icon={Wind}
            />

            <VitalCard
              label="SpO₂"
              value={
                recordedVitals.oxygenSaturation
              }
              unit="%"
              icon={Droplets}
            />

            <VitalCard
              label="Weight"
              value={recordedVitals.weight}
              unit="kg"
              icon={Weight}
            />

            <VitalCard
              label="Height"
              value={recordedVitals.height}
              unit="cm"
              icon={Activity}
            />

            <VitalCard
              label="BMI"
              value={recordedVitals.bmi}
              unit=""
              icon={Activity}
            />

          </div>

        )}

      </div>

      {/* ==========================================
          SEND TO DOCTOR
      ========================================== */}

      <div
        className="
          rounded-2xl
          border border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        <div
          className="
            flex flex-col gap-5
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          <div className="flex items-start gap-4">

            <div
              className="
                flex h-12 w-12 shrink-0
                items-center justify-center
                rounded-xl
                bg-purple-50
              "
            >
              <Stethoscope
                size={24}
                className="text-purple-600"
              />
            </div>

            <div>

              <h2 className="font-bold text-slate-800">
                Ready for Doctor Consultation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Mgonjwa huyu atatumwa kwenye
                Doctor Queue ya leo.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={handleSendToDoctor}
            disabled={sending}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-purple-600
              px-6 py-3
              text-sm font-bold
              text-white
              shadow-lg
              shadow-purple-500/20
              transition
              hover:bg-purple-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <Stethoscope size={18} />

            {sending
              ? "Inatuma..."
              : "Send to Doctor"}

          </button>

        </div>

      </div>

    </div>
  );
}

// ==========================================
// VITAL CARD
// ==========================================

function VitalCard({
  label,
  value,
  unit,
  icon: Icon,
}) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== "";

  return (
    <div
      className="
        rounded-xl
        border border-slate-200
        bg-slate-50/60
        p-4
      "
    >

      <div className="flex items-center gap-3">

        <div
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-lg
            bg-white
            shadow-sm
          "
        >
          <Icon
            size={18}
            className="text-blue-600"
          />
        </div>

        <div>

          <p
            className="
              text-xs font-semibold
              uppercase tracking-wide
              text-slate-400
            "
          >
            {label}
          </p>

          <p className="mt-1 text-lg font-bold text-slate-800">

            {hasValue
              ? value
              : "—"}

            {hasValue && unit && (
              <span
                className="
                  ml-1
                  text-xs font-semibold
                  text-slate-400
                "
              >
                {unit}
              </span>
            )}

          </p>

        </div>

      </div>

    </div>
  );
}