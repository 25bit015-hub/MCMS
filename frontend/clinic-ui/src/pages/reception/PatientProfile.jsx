import { useEffect, useState } from "react";

import {
  ArrowLeft,
  User,
  Phone,
  CalendarDays,
  ShieldCheck,
  Activity,
  Stethoscope,
  FlaskConical,
  Pill,
  CreditCard,
  Pencil,
  MapPin,
  ClipboardCheck,
  Syringe,
  Clock,
  RefreshCw,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../services/api";

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [todayQueue, setTodayQueue] = useState(null);

  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const [error, setError] = useState("");
  const [queueError, setQueueError] = useState("");

  // =====================================================
  // LOAD PATIENT + TODAY QUEUE
  // =====================================================

  useEffect(() => {
    async function fetchPatientProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/patients/${id}`);

        console.log("PATIENT PROFILE:", response.data);

        setPatient(response.data);

        // Load today's queue for this patient
        await fetchTodayQueue(response.data.id);
      } catch (err) {
        console.error("PATIENT PROFILE ERROR:", err);

        if (err.response?.status === 404) {
          setError(
            "Patient huyu hakupatikana kwenye database."
          );
        } else {
          setError(
            "Imeshindikana kupata taarifa za mgonjwa."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPatientProfile();
    }
  }, [id]);

  // =====================================================
  // GET TODAY'S QUEUE FOR THIS PATIENT
  // =====================================================

  async function fetchTodayQueue(patientId) {
    try {
      setQueueLoading(true);
      setQueueError("");

      const today = new Date()
        .toISOString()
        .split("T")[0];

      const response = await api.get(
        `/patient-queue/date?date=${today}`
      );

      const queues = Array.isArray(response.data)
        ? response.data
        : [];

      const patientQueue = queues.find(
        (queue) =>
          Number(queue.patientId) === Number(patientId)
      );

      setTodayQueue(patientQueue || null);

      console.log(
        "TODAY PATIENT QUEUE:",
        patientQueue || "No queue today"
      );
    } catch (err) {
      console.error(
        "TODAY QUEUE ERROR:",
        err
      );

      setQueueError(
        "Imeshindikana kupata queue ya leo."
      );
    } finally {
      setQueueLoading(false);
    }
  }

  // =====================================================
  // CHECK-IN PATIENT
  // =====================================================

  async function handleCheckIn() {
    if (!patient?.id) {
      return;
    }

    try {
      setCheckingIn(true);
      setQueueError("");

      const response = await api.post(
        "/patient-queue",
        {
          patientId: Number(patient.id),
          notes: "Patient checked in from reception",
        }
      );

      console.log(
        "PATIENT CHECK-IN RESPONSE:",
        response.data
      );

      const queue = response.data;

      setTodayQueue(queue);

      alert(
        `Mgonjwa ameingizwa kwenye queue kwa mafanikio.\n\n` +
        `Patient Number: ${
          queue.patientNumber || patient.patientNumber || patient.id
        }\n` +
        `Visit Number: ${
          queue.visitNumber || "—"
        }\n` +
        `Queue Number: ${
          queue.queueNumber || "—"
        }`
      );
    } catch (err) {
      console.error(
        "PATIENT CHECK-IN ERROR:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Imeshindikana kumuingiza mgonjwa kwenye queue.";

      setQueueError(message);

      alert(message);

      // Refresh queue in case backend says
      // patient is already in today's queue.
      await fetchTodayQueue(patient.id);
    } finally {
      setCheckingIn(false);
    }
  }

  // =====================================================
  // GO TO VITALS
  // =====================================================

  function handleVitals() {
    if (!patient?.id || !todayQueue?.visitId) {
      alert(
        "Visit ya mgonjwa haijapatikana. Tafadhali hakikisha mgonjwa ameingizwa kwenye queue kwanza."
      );
      return;
    }

    navigate(
      `/nurse/patients/${patient.id}/vitals?visitId=${todayQueue.visitId}`
    );
  }

  // =====================================================
  // REFRESH QUEUE
  // =====================================================

  async function handleRefreshQueue() {
    if (!patient?.id) {
      return;
    }

    await fetchTodayQueue(patient.id);
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        className="
          flex min-h-[60vh]
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-10 w-10
              animate-spin
              rounded-full
              border-4
              border-blue-100
              border-t-blue-600
            "
          />

          <p
            className="
              mt-4
              text-sm font-semibold
              text-slate-500
            "
          >
            Loading patient...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (error || !patient) {
    return (
      <div
        className="
          flex min-h-[60vh]
          items-center
          justify-center
        "
      >
        <div
          className="
            rounded-3xl
            border border-slate-200
            bg-white
            p-10
            text-center
            shadow-lg
          "
        >
          <div
            className="
              mx-auto
              flex h-16 w-16
              items-center justify-center
              rounded-2xl
              bg-red-50
            "
          >
            <User
              size={28}
              className="text-red-500"
            />
          </div>

          <h2
            className="
              mt-5
              text-xl font-bold
              text-slate-800
            "
          >
            Patient Not Found
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            {error ||
              `Patient ID "${id}" haikupatikana.`}
          </p>

          <Link
            to="/reception/patients"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5 py-3
              text-sm font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            <ArrowLeft size={17} />
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // HELPERS
  // =====================================================

  const fullName = [
    patient.firstName,
    patient.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const initials =
    `${patient.firstName?.charAt(0) || ""}${
      patient.lastName?.charAt(0) || ""
    }`.toUpperCase();

  function calculateAge(dateOfBirth) {
    if (!dateOfBirth) {
      return "—";
    }

    const birth = new Date(dateOfBirth);
    const today = new Date();

    let age =
      today.getFullYear() -
      birth.getFullYear();

    const monthDifference =
      today.getMonth() -
      birth.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() < birth.getDate()
      )
    ) {
      age--;
    }

    return age;
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatTime(dateTime) {
    if (!dateTime) {
      return "—";
    }

    return new Date(dateTime).toLocaleTimeString(
      "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function getQueueStatusLabel(status) {
    const labels = {
      WAITING: "Waiting for Nurse",
      IN_CONSULTATION: "In Consultation",
      SENT_TO_DOCTOR: "Sent to Doctor",
      LAB_PENDING: "Laboratory Pending",
      LAB_COMPLETED: "Laboratory Completed",
      RETURNED_TO_DOCTOR: "Returned to Doctor",
      PHARMACY_PENDING: "Pharmacy Pending",
      PHARMACY_COMPLETED: "Pharmacy Completed",
      INJECTION_PENDING: "Injection Pending",
      INJECTION_COMPLETED: "Injection Completed",
      COMPLETED: "Completed",
    };

    return labels[status] || status || "—";
  }

  function getServiceLabel(service) {
    const labels = {
      RECEPTION: "Reception",
      NURSE: "Nurse",
      DOCTOR: "Doctor",
      LABORATORY: "Laboratory",
      PHARMACY: "Pharmacy",
      INJECTION: "Injection",
      COMPLETED: "Completed",
    };

    return labels[service] || service || "—";
  }

  const age = calculateAge(
    patient.dateOfBirth
  );

  const hasQueueToday = Boolean(
    todayQueue
  );

  const canRecordVitals =
    hasQueueToday &&
    Boolean(todayQueue?.visitId) &&
    (
      todayQueue?.service === "NURSE" ||
      todayQueue?.status === "WAITING" ||
      todayQueue?.status === "IN_CONSULTATION"
    );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex flex-col
          justify-between
          gap-5
          lg:flex-row
          lg:items-center
        "
      >
        <div
          className="
            flex items-center gap-4
          "
        >
          <Link
            to="/reception/patients"
            className="
              flex h-11 w-11
              items-center
              justify-center
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
            <ArrowLeft size={20} />
          </Link>

          <div>
            <div
              className="
                flex flex-wrap
                items-center gap-3
              "
            >
              <h1
                className="
                  text-2xl
                  font-extrabold
                  tracking-tight
                  text-slate-800
                "
              >
                Patient Profile
              </h1>

              <span
                className="
                  rounded-full
                  bg-emerald-50
                  px-3 py-1
                  text-xs font-bold
                  text-emerald-600
                "
              >
                Active
              </span>
            </div>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Patient ID:{" "}
              <span
                className="
                  font-semibold
                  text-slate-700
                "
              >
                {patient.patientNumber ||
                  patient.id}
              </span>
            </p>
          </div>
        </div>

        {/* HEADER ACTIONS */}

        <div
          className="
            flex flex-wrap
            items-center
            gap-3
          "
        >
          <button
            type="button"
            onClick={handleRefreshQueue}
            disabled={queueLoading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border border-slate-200
              bg-white
              px-4 py-3
              text-sm font-bold
              text-slate-600
              shadow-sm
              transition
              hover:bg-slate-50
              hover:text-blue-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={17}
              className={
                queueLoading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/reception/patients/${patient.id}/edit`
              )
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              px-5 py-3
              text-sm font-bold
              text-white
              shadow-lg
              shadow-blue-500/20
              transition
              hover:-translate-y-0.5
              hover:shadow-xl
            "
          >
            <Pencil size={17} />
            Edit Patient
          </button>
        </div>
      </div>


      {/* =================================================
          QUEUE / CHECK-IN PANEL
      ================================================== */}

      <section
        className="
          overflow-hidden
          rounded-3xl
          border border-blue-100
          bg-gradient-to-r
          from-blue-50
          via-white
          to-cyan-50
          shadow-[0_10px_35px_rgba(30,64,175,0.07)]
        "
      >
        <div
          className="
            flex flex-col
            gap-5
            p-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div
            className="
              flex items-start gap-4
            "
          >
            <div
              className="
                flex h-14 w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-blue-600
                text-white
                shadow-lg
                shadow-blue-500/20
              "
            >
              <ClipboardCheck size={25} />
            </div>

            <div>
              <div
                className="
                  flex flex-wrap
                  items-center gap-3
                "
              >
                <h2
                  className="
                    text-lg
                    font-extrabold
                    text-slate-800
                  "
                >
                  Today's Visit & Queue
                </h2>

                {hasQueueToday && (
                  <span
                    className="
                      rounded-full
                      bg-emerald-100
                      px-3 py-1
                      text-xs font-bold
                      text-emerald-700
                    "
                  >
                    Checked In
                  </span>
                )}
              </div>

              <p
                className="
                  mt-1
                  max-w-2xl
                  text-sm
                  text-slate-500
                "
              >
                Mgonjwa anatakiwa kuingia
                kwenye queue kabla ya kuanza
                hatua ya Nurse na Vital Signs.
              </p>
            </div>
          </div>


          {/* QUEUE ACTION */}

          {!hasQueueToday ? (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={checkingIn || queueLoading}
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                px-6 py-3.5
                text-sm font-extrabold
                text-white
                shadow-lg
                shadow-blue-500/20
                transition
                hover:-translate-y-0.5
                hover:shadow-xl
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {checkingIn ? (
                <>
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                  Checking In...
                </>
              ) : (
                <>
                  <ClipboardCheck size={18} />
                  Check-in Patient
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVitals}
              disabled={!canRecordVitals}
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-gradient-to-r
                from-emerald-600
                to-teal-500
                px-6 py-3.5
                text-sm font-extrabold
                text-white
                shadow-lg
                shadow-emerald-500/20
                transition
                hover:-translate-y-0.5
                hover:shadow-xl
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Activity size={18} />
              Record Vital Signs
            </button>
          )}
        </div>


        {/* QUEUE DETAILS */}

        {hasQueueToday && (
          <div
            className="
              border-t
              border-blue-100
              bg-white/70
              px-6 py-5
            "
          >
            <div
              className="
                grid
                gap-4
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >

              <QueueInfo
                icon={ClipboardCheck}
                label="Queue Number"
                value={
                  todayQueue.queueNumber ||
                  "—"
                }
              />

              <QueueInfo
                icon={CalendarDays}
                label="Visit Number"
                value={
                  todayQueue.visitNumber ||
                  "—"
                }
              />

              <QueueInfo
                icon={Clock}
                label="Check-in Time"
                value={formatTime(
                  todayQueue.checkInTime
                )}
              />

              <QueueInfo
                icon={Stethoscope}
                label="Service"
                value={getServiceLabel(
                  todayQueue.service
                )}
              />
            </div>


            <div
              className="
                mt-4
                flex flex-col
                gap-3
                rounded-2xl
                border border-slate-100
                bg-white
                p-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Queue Status
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-extrabold
                    text-slate-700
                  "
                >
                  {getQueueStatusLabel(
                    todayQueue.status
                  )}
                </p>
              </div>

              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  bg-blue-50
                  px-4 py-2
                  text-xs
                  font-bold
                  text-blue-700
                "
              >
                <Syringe size={15} />

                {getServiceLabel(
                  todayQueue.service
                )}
              </div>
            </div>
          </div>
        )}


        {/* QUEUE ERROR */}

        {queueError && (
          <div
            className="
              border-t
              border-red-100
              bg-red-50
              px-6 py-4
            "
          >
            <p
              className="
                text-sm
                font-semibold
                text-red-600
              "
            >
              {queueError}
            </p>
          </div>
        )}

      </section>


      {/* =================================================
          PATIENT HERO
      ================================================== */}

      <div
        className="
          overflow-hidden
          rounded-3xl
          border border-white/80
          bg-white/75
          shadow-[0_10px_35px_rgba(30,64,175,0.07)]
          backdrop-blur-xl
        "
      >
        <div
          className="
            h-28
            bg-gradient-to-r
            from-blue-700
            via-blue-600
            to-cyan-500
          "
        />

        <div
          className="
            -mt-12
            px-6
            pb-7
          "
        >
          <div
            className="
              flex flex-col
              gap-5
              md:flex-row
              md:items-end
              md:justify-between
            "
          >
            <div
              className="
                flex items-end gap-4
              "
            >
              <div
                className="
                  flex h-24 w-24
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border-4
                  border-white
                  bg-gradient-to-br
                  from-blue-400
                  to-blue-600
                  text-2xl
                  font-extrabold
                  text-white
                  shadow-lg
                "
              >
                {initials}
              </div>

              <div className="pb-1">
                <h2
                  className="
                    text-xl
                    font-extrabold
                    text-slate-800
                  "
                >
                  {fullName}
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  {patient.gender || "—"}
                  {" • "}
                  {age} years old
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                pb-1
                text-sm
                text-slate-500
              "
            >
              <CalendarDays size={17} />

              Registered{" "}
              {formatDate(
                patient.registeredAt
              )}
            </div>
          </div>
        </div>
      </div>


      {/* =================================================
          QUICK INFORMATION
      ================================================== */}

      <div
        className="
          grid grid-cols-1
          gap-4
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <QuickInfo
          icon={User}
          label="Patient ID"
          value={
            patient.patientNumber ||
            patient.id
          }
          iconClass="text-blue-600"
          bgClass="bg-blue-50"
        />

        <QuickInfo
          icon={Activity}
          label="Age"
          value={`${age} Years`}
          iconClass="text-purple-600"
          bgClass="bg-purple-50"
        />

        <QuickInfo
          icon={Phone}
          label="Phone"
          value={patient.phone || "—"}
          iconClass="text-green-600"
          bgClass="bg-green-50"
        />

        <QuickInfo
          icon={ShieldCheck}
          label="Status"
          value="Active"
          iconClass="text-orange-600"
          bgClass="bg-orange-50"
          valueClass="text-emerald-600"
        />
      </div>


      {/* =================================================
          PERSONAL INFORMATION
      ================================================== */}

      <Section
        title="Personal Information"
        icon={User}
      >
        <div
          className="
            grid gap-6
            md:grid-cols-2
            lg:grid-cols-4
          "
        >
          <InfoItem
            icon={User}
            label="First Name"
            value={patient.firstName}
          />

          <InfoItem
            icon={User}
            label="Last Name"
            value={patient.lastName}
          />

          <InfoItem
            icon={User}
            label="Gender"
            value={
              patient.gender === "Male"
                ? "Mwanaume"
                : patient.gender === "Female"
                ? "Mwanamke"
                : patient.gender
            }
          />

          <InfoItem
            icon={CalendarDays}
            label="Date of Birth"
            value={formatDate(
              patient.dateOfBirth
            )}
          />

          <InfoItem
            icon={Activity}
            label="Age"
            value={`${age} Years`}
          />

          <InfoItem
            icon={ShieldCheck}
            label="Patient Number"
            value={
              patient.patientNumber ||
              patient.id
            }
          />
        </div>
      </Section>


      {/* =================================================
          CONTACT INFORMATION
      ================================================== */}

      <Section
        title="Contact Information"
        icon={Phone}
      >
        <div
          className="
            grid gap-6
            md:grid-cols-2
            lg:grid-cols-4
          "
        >
          <InfoItem
            icon={Phone}
            label="Phone Number"
            value={patient.phone}
          />

          <InfoItem
            icon={User}
            label="Email"
            value={patient.email}
          />

          <InfoItem
            icon={MapPin}
            label="Address"
            value={patient.address}
          />

          <InfoItem
            icon={User}
            label="Emergency Contact"
            value={
              patient.emergencyContact
            }
          />

          <InfoItem
            icon={Phone}
            label="Emergency Phone"
            value={
              patient.emergencyPhone
            }
          />
        </div>
      </Section>


      {/* =================================================
          MEDICAL ACTIVITY
      ================================================== */}

      <Section
        title="Medical Activity"
        icon={Activity}
      >
        <div
          className="
            grid gap-4
            md:grid-cols-2
            lg:grid-cols-4
          "
        >
          <ActivityCard
            icon={Stethoscope}
            title="Doctor Visits"
            value="0"
          />

          <ActivityCard
            icon={FlaskConical}
            title="Lab Results"
            value="0"
          />

          <ActivityCard
            icon={Pill}
            title="Prescriptions"
            value="0"
          />

          <ActivityCard
            icon={CreditCard}
            title="Payments"
            value="0"
          />
        </div>
      </Section>


      {/* =================================================
          MEDICAL HISTORY
      ================================================== */}

      <Section
        title="Medical History"
        icon={Stethoscope}
      >
        <div
          className="
            rounded-2xl
            border border-dashed
            border-slate-200
            bg-slate-50/60
            px-6 py-12
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex h-14 w-14
              items-center
              justify-center
              rounded-2xl
              bg-white
              shadow-sm
            "
          >
            <Activity
              size={24}
              className="text-slate-400"
            />
          </div>

          <h3
            className="
              mt-4
              text-sm font-bold
              text-slate-700
            "
          >
            No Medical Records
          </h3>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-sm
              text-slate-400
            "
          >
            Medical history, diagnoses,
            laboratory results, prescriptions
            and visits will appear here.
          </p>
        </div>
      </Section>

    </div>
  );
}


/* =========================================================
   QUEUE INFO
========================================================= */

function QueueInfo({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-slate-100
        bg-white
        p-4
      "
    >
      <div
        className="
          flex items-center gap-3
        "
      >
        <div
          className="
            flex h-10 w-10
            items-center
            justify-center
            rounded-xl
            bg-blue-50
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
              text-xs
              font-semibold
              text-slate-400
            "
          >
            {label}
          </p>

          <p
            className="
              mt-1
              text-sm
              font-extrabold
              text-slate-700
            "
          >
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   SECTION
========================================================= */

function Section({
  title,
  icon: Icon,
  children,
}) {
  return (
    <section
      className="
        rounded-3xl
        border border-white/80
        bg-white/75
        p-6
        shadow-[0_10px_35px_rgba(30,64,175,0.07)]
        backdrop-blur-xl
      "
    >
      <div
        className="
          mb-6
          flex items-center gap-3
          border-b
          border-slate-100
          pb-4
        "
      >
        <div
          className="
            flex h-11 w-11
            items-center
            justify-center
            rounded-xl
            bg-blue-50
          "
        >
          <Icon
            size={20}
            className="text-blue-600"
          />
        </div>

        <h2
          className="
            text-base
            font-bold
            text-slate-800
          "
        >
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}


/* =========================================================
   QUICK INFO
========================================================= */

function QuickInfo({
  icon: Icon,
  label,
  value,
  iconClass,
  bgClass,
  valueClass = "text-slate-700",
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-white/80
        bg-white/75
        p-5
        shadow-sm
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex items-center gap-3
        "
      >
        <div
          className={`
            flex h-11 w-11
            items-center
            justify-center
            rounded-xl
            ${bgClass}
          `}
        >
          <Icon
            size={19}
            className={iconClass}
          />
        </div>

        <div>
          <p
            className="
              text-xs
              text-slate-400
            "
          >
            {label}
          </p>

          <p
            className={`
              mt-1
              text-sm
              font-bold
              ${valueClass}
            `}
          >
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div>
      <div
        className="
          mb-2
          flex items-center gap-2
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        <Icon size={14} />

        {label}
      </div>

      <p
        className="
          break-words
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {value || "—"}
      </p>
    </div>
  );
}


/* =========================================================
   ACTIVITY CARD
========================================================= */

function ActivityCard({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-100
        bg-slate-50/60
        p-5
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <div
          className="
            flex h-11 w-11
            items-center
            justify-center
            rounded-xl
            bg-white
            shadow-sm
          "
        >
          <Icon
            size={19}
            className="text-blue-600"
          />
        </div>

        <span
          className="
            text-2xl
            font-extrabold
            text-slate-800
          "
        >
          {value}
        </span>
      </div>

      <p
        className="
          mt-4
          text-sm
          font-semibold
          text-slate-600
        "
      >
        {title}
      </p>
    </div>
  );
}