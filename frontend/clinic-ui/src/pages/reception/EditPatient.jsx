import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

const initialFormData = {
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  address: "",
  emergencyContact: "",
  emergencyPhone: "",
};

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [patient, setPatient] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/patients/${id}`);

        const data = response.data;

        setPatient(data);

        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          emergencyContact: data.emergencyContact || "",
          emergencyPhone: data.emergencyPhone || "",
        });
      } catch (err) {
        console.error("LOAD PATIENT ERROR:", err);

        if (err.response?.status === 404) {
          setError("Mgonjwa hakupatikana.");
        } else if (err.response?.status === 401) {
          setError("Session yako imekwisha. Tafadhali login tena.");
        } else if (err.response?.status === 403) {
          setError("Huna ruhusa ya kuona taarifa hizi.");
        } else {
          setError(
            "Imeshindikana kupata taarifa za mgonjwa. Tafadhali jaribu tena."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPatient();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.firstName.trim()) {
      setError("Jina la kwanza linahitajika.");
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Jina la mwisho linahitajika.");
      return;
    }

    if (!formData.gender) {
      setError("Tafadhali chagua jinsia.");
      return;
    }

    if (!formData.dateOfBirth) {
      setError("Tarehe ya kuzaliwa inahitajika.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Namba ya simu inahitajika.");
      return;
    }

    try {
      setSaving(true);

      const patientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,

        phone: formData.phone.trim(),

        email: formData.email.trim()
          ? formData.email.trim()
          : null,

        address: formData.address.trim()
          ? formData.address.trim()
          : null,

        emergencyContact: formData.emergencyContact.trim()
          ? formData.emergencyContact.trim()
          : null,

        emergencyPhone: formData.emergencyPhone.trim()
          ? formData.emergencyPhone.trim()
          : null,
      };

      console.log("PATIENT DATA TO UPDATE:", patientData);

      const response = await api.put(
        `/patients/${id}`,
        patientData
      );

      const updatedPatient = response.data;

      console.log(
        "PATIENT UPDATED SUCCESSFULLY:",
        updatedPatient
      );

      alert("Taarifa za mgonjwa zimehaririwa kwa mafanikio!");

      navigate(
        `/reception/patients/${updatedPatient.id}`
      );
    } catch (err) {
      console.error("UPDATE PATIENT ERROR:", err);

      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
            "Taarifa ulizoingiza hazijakubalika. Tafadhali hakikisha taarifa zote ni sahihi."
        );
      } else if (err.response?.status === 401) {
        setError(
          "Session yako imekwisha. Tafadhali login tena."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Huna ruhusa ya kuhariri taarifa za mgonjwa."
        );
      } else if (err.response?.status === 404) {
        setError("Mgonjwa hakupatikana.");
      } else if (err.response?.status === 409) {
        setError(
          "Namba ya simu au email tayari inatumika na mgonjwa mwingine."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Imeshindikana kuhariri taarifa za mgonjwa. Tafadhali jaribu tena."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-slate-600">
            Inapakia taarifa za mgonjwa...
          </p>
        </div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">

          <Link
            to="/reception/patients"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft size={18} />
            Rudi kwa Wagonjwa
          </Link>

          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} />
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Imeshindikana
            </h2>

            <p className="text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">

      <div className="max-w-5xl mx-auto">

        {/* Back Button */}
        <div className="mb-6">
          <Link
            to={`/reception/patients/${id}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition"
          >
            <ArrowLeft size={18} />
            Rudi kwenye Profile
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <User size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Hariri Taarifa za Mgonjwa
                </h1>

                <p className="text-slate-500 mt-1">
                  Rekebisha taarifa za mgonjwa kwenye mfumo.
                </p>
              </div>

            </div>

            {patient && (
              <div className="bg-slate-100 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-500">
                  Patient ID
                </p>

                <p className="font-bold text-slate-800">
                  {patient.patientNumber || patient.id}
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">

              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <User size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Taarifa Binafsi
                </h2>

                <p className="text-sm text-slate-500">
                  Taarifa muhimu za msingi za mgonjwa.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jina la Kwanza
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Mfano: Ali"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jina la Mwisho
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Mfano: Rajab"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jinsia
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">
                    Chagua jinsia
                  </option>

                  <option value="Male">
                    Mwanaume
                  </option>

                  <option value="Female">
                    Mwanamke
                  </option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tarehe ya Kuzaliwa
                </label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">

              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Phone size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Taarifa za Mawasiliano
                </h2>

                <p className="text-sm text-slate-500">
                  Mawasiliano ya sasa ya mgonjwa.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Namba ya Simu
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Mfano: 0712345678"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Mfano: patient@email.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Anuani
                </label>

                <div className="relative">

                  <MapPin
                    size={18}
                    className="absolute left-4 top-4 text-slate-400"
                  />

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Mfano: Mbuzini, Dar es Salaam"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />

                </div>

              </div>

            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">

              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Ndugu wa Karibu / Emergency Contact
                </h2>

                <p className="text-sm text-slate-500">
                  Mtu wa kuwasiliana naye wakati wa dharura.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Emergency Contact */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jina la Ndugu wa Karibu
                </label>

                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Mfano: Ali Salum"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

              </div>

              {/* Emergency Phone */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Simu ya Ndugu wa Karibu
                </label>

                <div className="relative">

                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    placeholder="Mfano: 0712345678"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                </div>

              </div>

            </div>
          </div>

          {/* Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              <Link
                to={`/reception/patients/${id}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition text-center"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={18} />

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