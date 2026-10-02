import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  HeartPulse,
  ShieldAlert,
  ClipboardList,
  Save,
  RotateCcw,
  Users,
} from "lucide-react";

import api from "../../services/api";

const initialForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  age: "",

  phone: "",
  email: "",
  address: "",

  emergencyContact: "",
  emergencyPhone: "",

  bloodGroup: "",
  allergies: "",
  medicalConditions: "",
  notes: "",
  service: "General Consultation",
};

export default function RegisterPatient() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    // =====================================================
    // FRONTEND VALIDATION
    // =====================================================

    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!form.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!form.gender) {
      setError("Please select gender.");
      return;
    }

    if (!form.dateOfBirth) {
      setError("Date of birth is required.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setLoading(true);

    try {
      // ===================================================
      // 1. CHECK POSSIBLE DUPLICATES
      // ===================================================

      const duplicateResponse = await api.get(
        "/patients/possible-duplicates",
        {
          params: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            dateOfBirth: form.dateOfBirth,
          },
        }
      );

      const duplicates = duplicateResponse.data || [];

      // ===================================================
      // 2. DUPLICATE WARNING
      // ===================================================

      if (duplicates.length > 0) {
        const duplicate = duplicates[0];

        const duplicateName = [
          duplicate.firstName,
          duplicate.lastName,
        ]
          .filter(Boolean)
          .join(" ");

        const duplicateNumber =
          duplicate.patientNumber ||
          duplicate.id ||
          "-";

        const duplicatePhone =
          duplicate.phone || "-";

        const continueRegistration = window.confirm(
          `⚠️ Possible Duplicate Patient\n\n` +
            `Name: ${duplicateName || "-"}\n` +
            `Patient Number: ${duplicateNumber}\n` +
            `Phone: ${duplicatePhone}\n\n` +
            `A patient with the same name and date of birth already exists.\n\n` +
            `Do you still want to continue registering this patient?`
        );

        if (!continueRegistration) {
          setLoading(false);
          return;
        }
      }

      // ===================================================
      // 3. PREPARE DATA FOR SPRING BOOT
      // ===================================================

      const patientData = {
        firstName: form.firstName.trim(),

        lastName: form.lastName.trim(),

        gender: form.gender,

        dateOfBirth: form.dateOfBirth,

        phone: form.phone.trim(),

        email: form.email.trim()
          ? form.email.trim()
          : null,

        address: form.address.trim()
          ? form.address.trim()
          : null,

        emergencyContact:
          form.emergencyContact.trim()
            ? form.emergencyContact.trim()
            : null,

        emergencyPhone:
          form.emergencyPhone.trim()
            ? form.emergencyPhone.trim()
            : null,
      };

      console.log(
        "PATIENT DATA TO API:",
        patientData
      );

      // ===================================================
      // 4. SAVE TO SPRING BOOT
      // ===================================================

      const response = await api.post(
        "/patients",
        patientData
      );

      const savedPatient = response.data;

      console.log(
        "PATIENT CREATED:",
        savedPatient
      );

      // ===================================================
      // 5. SUCCESS MESSAGE
      // ===================================================

      alert(
        `Patient registered successfully!\n\n` +
          `Patient Number: ${
            savedPatient.patientNumber ||
            savedPatient.id
          }`
      );

      // ===================================================
      // 6. OPEN PATIENT PROFILE
      // ===================================================

      navigate(
        `/reception/patients/${savedPatient.id}`
      );
    } catch (err) {
      console.error(
        "REGISTER PATIENT ERROR:",
        err
      );

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      if (
        typeof backendMessage === "string"
      ) {
        setError(backendMessage);
      } else if (
        err.response?.status === 400
      ) {
        setError(
          "Taarifa za mgonjwa si sahihi. Tafadhali kagua taarifa ulizoingiza."
        );
      } else if (
        err.response?.status === 409
      ) {
        setError(
          "Mgonjwa mwenye taarifa hizi tayari yupo kwenye mfumo."
        );
      } else {
        setError(
          "Imeshindikana kusajili mgonjwa. Tafadhali hakikisha Spring Boot server inaendelea."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm(initialForm);
    setError("");
  }

  return (
    <div className="space-y-6">

      {/* ===================================================
          HEADER
      ==================================================== */}

      <div className="
        flex flex-col gap-4
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">

        <div className="flex items-center gap-4">

          <Link
            to="/reception/patients"
            className="
              flex h-11 w-11 shrink-0
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
            <ArrowLeft size={20} />
          </Link>

          <div>

            <h1 className="
              text-2xl font-extrabold
              tracking-tight
              text-slate-800
            ">
              Register Patient
            </h1>

            <p className="
              mt-1 text-sm
              text-slate-500
            ">
              Register a new patient into the clinic system.
            </p>

          </div>

        </div>

      </div>


      {/* ===================================================
          ERROR
      ==================================================== */}

      {error && (
        <div className="
          rounded-2xl
          border border-red-200
          bg-red-50
          px-5 py-4
          text-sm font-semibold
          text-red-600
        ">
          {error}
        </div>
      )}


      {/* ===================================================
          FORM
      ==================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* =================================================
            PERSONAL INFORMATION
        ================================================== */}

        <section className="
          rounded-3xl
          border border-white/80
          bg-white/80
          p-6
          shadow-[0_10px_35px_rgba(30,64,175,0.07)]
          backdrop-blur-xl
        ">

          <SectionHeader
            icon={User}
            title="Personal Information"
            description="Basic information about the patient."
          />

          <div className="
            mt-6
            grid grid-cols-1
            gap-5
            md:grid-cols-2
            lg:grid-cols-3
          ">

            <InputField
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              required
            />

            <InputField
              label="Middle Name"
              name="middleName"
              value={form.middleName}
              onChange={handleChange}
              placeholder="Enter middle name"
            />

            <InputField
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              required
            />

            <SelectField
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              options={[
                {
                  value: "Male",
                  label: "Male",
                },
                {
                  value: "Female",
                  label: "Female",
                },
                {
                  value: "Other",
                  label: "Other",
                },
              ]}
            />

            <InputField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
            />

            <InputField
              label="Age"
              name="age"
              type="number"
              min="0"
              value={form.age}
              onChange={handleChange}
              placeholder="Enter age"
            />

          </div>

        </section>


        {/* =================================================
            CONTACT INFORMATION
        ================================================== */}

        <section className="
          rounded-3xl
          border border-white/80
          bg-white/80
          p-6
          shadow-[0_10px_35px_rgba(30,64,175,0.07)]
          backdrop-blur-xl
        ">

          <SectionHeader
            icon={Phone}
            title="Contact Information"
            description="Patient contact and address details."
          />

          <div className="
            mt-6
            grid grid-cols-1
            gap-5
            md:grid-cols-2
          ">

            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 0712 345 678"
              required
            />

            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="patient@example.com"
            />

            <div className="md:col-span-2">

              <TextAreaField
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter patient address"
                rows={3}
                icon={MapPin}
              />

            </div>

          </div>

        </section>


        {/* =================================================
            EMERGENCY CONTACT
        ================================================== */}

        <section className="
          rounded-3xl
          border border-white/80
          bg-white/80
          p-6
          shadow-[0_10px_35px_rgba(30,64,175,0.07)]
          backdrop-blur-xl
        ">

          <SectionHeader
            icon={Users}
            title="Emergency Contact"
            description="Person to contact in case of emergency."
          />

          <div className="
            mt-6
            grid grid-cols-1
            gap-5
            md:grid-cols-2
          ">

            <InputField
              label="Emergency Contact Name"
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={handleChange}
              placeholder="Enter emergency contact name"
            />

            <InputField
              label="Emergency Phone"
              name="emergencyPhone"
              type="tel"
              value={form.emergencyPhone}
              onChange={handleChange}
              placeholder="e.g. 0712 345 678"
            />

          </div>

        </section>


        {/* =================================================
            MEDICAL INFORMATION
        ================================================== */}

        <section className="
          rounded-3xl
          border border-white/80
          bg-white/80
          p-6
          shadow-[0_10px_35px_rgba(30,64,175,0.07)]
          backdrop-blur-xl
        ">

          <SectionHeader
            icon={HeartPulse}
            title="Medical Information"
            description="Basic medical information and history."
          />

          <div className="
            mt-6
            grid grid-cols-1
            gap-5
            md:grid-cols-2
          ">

            <SelectField
              label="Blood Group"
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              options={[
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
              ]}
            />

            <SelectField
              label="Service"
              name="service"
              value={form.service}
              onChange={handleChange}
              options={[
                {
                  value: "General Consultation",
                  label: "General Consultation",
                },
                {
                  value: "Emergency",
                  label: "Emergency",
                },
                {
                  value: "Follow Up",
                  label: "Follow Up",
                },
                {
                  value: "Specialist Consultation",
                  label: "Specialist Consultation",
                },
              ]}
            />

            <TextAreaField
              label="Allergies"
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              placeholder="Enter known allergies or leave blank"
              rows={3}
              icon={ShieldAlert}
            />

            <TextAreaField
              label="Medical Conditions"
              name="medicalConditions"
              value={form.medicalConditions}
              onChange={handleChange}
              placeholder="Enter existing medical conditions"
              rows={3}
              icon={HeartPulse}
            />

            <div className="md:col-span-2">

              <TextAreaField
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional notes about the patient..."
                rows={4}
                icon={ClipboardList}
              />

            </div>

          </div>

        </section>


        {/* =================================================
            ACTIONS
        ================================================== */}

        <div className="
          flex flex-col-reverse
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-end
        ">

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border border-slate-200
              bg-white
              px-5 py-3
              text-sm font-semibold
              text-slate-600
              shadow-sm
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RotateCcw size={17} />
            Reset
          </button>


          <Link
            to="/reception/patients"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border border-slate-200
              bg-white
              px-5 py-3
              text-sm font-semibold
              text-slate-600
              shadow-sm
              transition
              hover:bg-slate-50
            "
          >
            Cancel
          </Link>


          <button
            type="submit"
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              px-6 py-3
              text-sm font-bold
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

            {loading ? (
              <>
                <span className="
                  h-4 w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-white/30
                  border-t-white
                " />

                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Register Patient
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  );
}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="
      flex items-start gap-3
      border-b border-slate-100
      pb-4
    ">

      <div className="
        flex h-11 w-11
        shrink-0
        items-center justify-center
        rounded-xl
        bg-blue-50
      ">
        <Icon
          size={20}
          className="text-blue-600"
        />
      </div>

      <div>

        <h2 className="
          text-base font-bold
          text-slate-800
        ">
          {title}
        </h2>

        <p className="
          mt-1 text-xs
          text-slate-400
        ">
          {description}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="
          mb-2 block
          text-xs font-bold
          uppercase tracking-wide
          text-slate-500
        "
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

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
        className="
          h-12 w-full
          rounded-xl
          border border-slate-200
          bg-white
          px-4
          text-sm
          text-slate-700
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-blue-400
          focus:ring-4
          focus:ring-blue-500/10
        "
      />

    </div>
  );
}


/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="
          mb-2 block
          text-xs font-bold
          uppercase tracking-wide
          text-slate-500
        "
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="
          h-12 w-full
          rounded-xl
          border border-slate-200
          bg-white
          px-4
          text-sm
          text-slate-700
          outline-none
          transition
          focus:border-blue-400
          focus:ring-4
          focus:ring-blue-500/10
        "
      >

        <option value="">
          Select {label}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}

      </select>

    </div>
  );
}


/* =========================================================
   TEXTAREA
========================================================= */

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  icon: Icon,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="
          mb-2 block
          text-xs font-bold
          uppercase tracking-wide
          text-slate-500
        "
      >
        {label}
      </label>

      <div className="relative">

        {Icon && (
          <Icon
            size={17}
            className="
              absolute
              left-4 top-4
              text-slate-400
            "
          />
        )}

        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`
            w-full
            resize-none
            rounded-xl
            border border-slate-200
            bg-white
            px-4 py-3
            text-sm
            text-slate-700
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-blue-400
            focus:ring-4
            focus:ring-blue-500/10
            ${Icon ? "pl-11" : ""}
          `}
        />

      </div>

    </div>
  );
}