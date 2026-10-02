import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const initialProviders = [
  {
    id: 1,
    name: "Strategis Insurance",
    code: "STR",
    phone: "0800 750 123",
    email: "info@strategis.co.tz",
    address: "Dar es Salaam",
    status: "Active",
  },
  {
    id: 2,
    name: "Jubilee Insurance",
    code: "JUB",
    phone: "0800 711 111",
    email: "info@jubilee.co.tz",
    address: "Dar es Salaam",
    status: "Active",
  },
  {
    id: 3,
    name: "NHIF",
    code: "NHIF",
    phone: "0800 110 001",
    email: "info@nhif.or.tz",
    address: "Dodoma",
    status: "Active",
  },
  {
    id: 4,
    name: "AAR Insurance",
    code: "AAR",
    phone: "0800 110 020",
    email: "info@aar.co.tz",
    address: "Dar es Salaam",
    status: "Inactive",
  },
];

const emptyForm = {
  name: "",
  code: "",
  phone: "",
  email: "",
  address: "",
  status: "Active",
};

export default function InsuranceProviders() {
  const [providers, setProviders] = useState(initialProviders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [deleteProvider, setDeleteProvider] = useState(null);

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        provider.name.toLowerCase().includes(searchText) ||
        provider.code.toLowerCase().includes(searchText) ||
        provider.phone.toLowerCase().includes(searchText) ||
        provider.email.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        provider.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [providers, search, statusFilter]);

  const activeCount = providers.filter(
    (provider) => provider.status === "Active"
  ).length;

  const inactiveCount = providers.filter(
    (provider) => provider.status === "Inactive"
  ).length;

  const openAddModal = () => {
    setEditingProvider(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (provider) => {
    setEditingProvider(provider);
    setForm({
      name: provider.name,
      code: provider.code,
      phone: provider.phone,
      email: provider.email,
      address: provider.address,
      status: provider.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProvider(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.code.trim()) {
      alert("Please enter insurance provider name and code.");
      return;
    }

    if (editingProvider) {
      setProviders((prev) =>
        prev.map((provider) =>
          provider.id === editingProvider.id
            ? {
                ...provider,
                ...form,
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
              }
            : provider
        )
      );
    } else {
      const newProvider = {
        id: Date.now(),
        ...form,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
      };

      setProviders((prev) => [newProvider, ...prev]);
    }

    closeModal();
  };

  const confirmDelete = () => {
    if (!deleteProvider) return;

    setProviders((prev) =>
      prev.filter((provider) => provider.id !== deleteProvider.id)
    );

    setDeleteProvider(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              to="/billing"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={18} />
              Back to Billing
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-3">
                <Building2
                  size={24}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Insurance Providers
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage insurance companies and healthcare insurance providers
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Insurance Provider
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Providers
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {providers.length}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3">
                <Building2
                  size={22}
                  className="text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Providers
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {activeCount}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3">
                <CheckCircle2
                  size={22}
                  className="text-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inactive Providers
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {inactiveCount}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3">
                <XCircle
                  size={22}
                  className="text-red-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search provider, code, phone or email..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Providers Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Provider
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Address
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProviders.length > 0 ? (
                  filteredProviders.map((provider) => (
                    <tr
                      key={provider.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      {/* Provider */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                            <Building2
                              size={19}
                              className="text-slate-600"
                            />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {provider.name}
                            </p>

                            <p className="mt-1 text-xs font-medium text-slate-500">
                              Code: {provider.code}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={14} />
                            {provider.phone}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail size={14} />
                            {provider.email}
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin size={15} />
                          {provider.address}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            provider.status === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {provider.status === "Active" ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}

                          {provider.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(provider)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Edit size={15} />
                            Edit
                          </button>

                          <button
                            onClick={() => setDeleteProvider(provider)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-14 text-center"
                    >
                      <Building2
                        size={42}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <h3 className="font-semibold text-slate-900">
                        No insurance providers found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or status filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingProvider
                    ? "Edit Insurance Provider"
                    : "Add Insurance Provider"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter insurance provider information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 p-6 sm:grid-cols-2">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Provider Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Strategic Insurance"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                    required
                  />
                </div>

                {/* Code */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Provider Code *
                  </label>

                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. STR"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm uppercase outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0800 750 123"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="provider@example.com"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="e.g. Dar es Salaam"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {editingProvider
                    ? "Save Changes"
                    : "Add Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-50 p-3">
                <Trash2
                  size={22}
                  className="text-red-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Delete Provider?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-700">
                    {deleteProvider.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteProvider(null)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}