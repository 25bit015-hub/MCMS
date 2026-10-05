import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import ModuleRoute from "./ModuleRoute";
import Dashboard from "../pages/Dashboard";

/* =========================
   RECEPTION
========================= */
import ReceptionDashboard from "../pages/reception/ReceptionDashboard";
import Patients from "../pages/reception/Patients";
import RegisterPatient from "../pages/reception/RegisterPatient";
import PatientProfile from "../pages/reception/PatientProfile";
import EditPatient from "../pages/reception/EditPatient";
import PatientQueue from "../pages/reception/PatientQueue";

/* =========================
   PROFILE / SETTINGS / USERS
========================= */
import Profile from "../pages/reception/profile/Profile";
import Settings from "../pages/settings/Settings";
import Users from "../pages/users/Users";
import AddUser from "../pages/users/AddUser";
import UserProfile from "../pages/users/UserProfile";
import EditUser from "../pages/users/EditUser";
import RolePermissions from "../pages/users/RolePermissions";

/* =========================
   NURSE
========================= */
import NurseDashboard from "../pages/nurse/NurseDashboard";
import Vitals from "../pages/nurse/Vitals";
import SendToDoctor from "../pages/nurse/SendToDoctor";

/* =========================
   DOCTOR
========================= */
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import Consultation from "../pages/doctor/Consultation";
import DoctorQueue from "../pages/doctor/DoctorQueue";

/* =========================
   LABORATORY
========================= */
import LaboratoryDashboard from "../pages/laboratory/LaboratoryDashboard";
import LaboratoryPatient from "../pages/laboratory/LaboratoryPatient";

/* =========================
   PHARMACY
========================= */
import PharmacyDashboard from "../pages/pharmacy/PharmacyDashboard";
import Medicines from "../pages/pharmacy/Medicines";
import AddMedicine from "../pages/pharmacy/AddMedicine";
import MedicineDetails from "../pages/pharmacy/MedicineDetails";
import EditMedicine from "../pages/pharmacy/EditMedicine";
import StockIn from "../pages/pharmacy/StockIn";
import StockAdjustment from "../pages/pharmacy/StockAdjustment";
import PharmacyPatient from "../pages/pharmacy/PharmacyPatient";
import Prescriptions from "../pages/pharmacy/Prescriptions";
import ExpiryManagement from "../pages/pharmacy/ExpiryManagement";
import DispensingHistory from "../pages/pharmacy/DispensingHistory";

/* =========================
   BILLING
========================= */
import BillingDashboard from "../pages/billing/BillingDashboard";
import CashBilling from "../pages/billing/CashBilling";
import InsuranceBilling from "../pages/billing/InsuranceBilling";
import Invoices from "../pages/billing/Invoices";
import CreateInvoice from "../pages/billing/CreateInvoice";
import InvoiceDetails from "../pages/billing/InvoiceDetails";
import InsuranceProviders from "../pages/billing/InsuranceProviders";
import InsuranceClaims from "../pages/billing/InsuranceClaims";
import Payments from "../pages/billing/Payments";
import Receipt from "../pages/billing/Receipt";

/* =========================
   MATERNITY
========================= */
import MaternityDashboard from "../pages/maternity/MaternityDashboard";
import Pregnancies from "../pages/maternity/Pregnancies";
import RegisterPregnancy from "../pages/maternity/RegisterPregnancy";
import PregnancyProfile from "../pages/maternity/PregnancyProfile";
import EditPregnancy from "../pages/maternity/EditPregnancy";
import ANCVisits from "../pages/maternity/ANCVisits";
import RegisterANCVisit from "../pages/maternity/RegisterANCVisit";
import ANCVisitProfile from "../pages/maternity/ANCVisitProfile";
import EditANCVisit from "../pages/maternity/EditANCVisit";
import LabourDashboard from "../pages/maternity/LabourDashboard";
import LabourRecords from "../pages/maternity/LabourRecords";
import LabourRecordProfile from "../pages/maternity/LabourRecordProfile";
import RegisterLabourRecord from "../pages/maternity/RegisterLabourRecord";
import EditLabourRecord from "../pages/maternity/EditLabourRecord";

/* =========================
   AUTH
========================= */
import Login from "../pages/auth/Login";

/* =========================
   PUBLIC
========================= */
import HospitalHome from "../pages/public/HospitalHome";

export default function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================
            PUBLIC ROUTES
        ====================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/"
          element={<HospitalHome />}
        />


        {/* =====================================
            PROTECTED SYSTEM ROUTES
        ====================================== */}

        <Route
          path="/*"
          element={
            <ProtectedRoute>

              <AppLayout>

                <Routes>

                  {/* =========================
                      DEFAULT / MAIN DASHBOARD
                  ========================== */}

                  <Route
                    path="/"
                    element={<HospitalHome />}
                  />

                  {/* =========================
                      MAIN DASHBOARD
                  ========================== */}

                  <Route
                    path="/dashboard"
                    element={<Dashboard />}
                  />

                  {/* =========================
                      PROFILE
                  ========================== */}

                  <Route
                    path="/profile"
                    element={<Profile />}
                  />

                  {/* =========================
                      USERS
                  ========================== */}

                  <Route
                    path="/users"
                    element={<Users />}
                  />

                  <Route
                    path="/users/add"
                    element={<AddUser />}
                  />

                  <Route
                    path="/users/:id"
                    element={<UserProfile />}
                  />

                  <Route
                    path="/users/:id/edit"
                    element={<EditUser />}
                  />

                  <Route
                    path="/users/permissions"
                    element={<RolePermissions />}
                  />

                  {/* =========================
                      SETTINGS
                  ========================== */}

                  <Route
                    path="/settings"
                    element={<Settings />}
                  />

                  {/* =========================
                      RECEPTION
                  ========================== */}

                  <Route
                    path="/reception"
                    element={
                      <ModuleRoute moduleName="RECEPTION">
                        <ReceptionDashboard />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/reception/patients"
                    element={
                      <ModuleRoute moduleName="RECEPTION">
                        <Patients />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/reception/patients/register"
                    element={
                      <ModuleRoute moduleName="RECEPTION">
                        <RegisterPatient />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/reception/register-patient"
                    element={
                      <ModuleRoute moduleName="RECEPTION">
                        <RegisterPatient />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/reception/patients/:id"
                    element={
                      <ModuleRoute moduleName="RECEPTION">
                        <PatientProfile />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/reception/patients/:id/edit"
                    element={
                      <ModuleRoute moduleName="RECEPTION">
                        <EditPatient />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/reception/queue"
                    element={
                      <ModuleRoute moduleName="RECEPTION">
                        <PatientQueue />
                      </ModuleRoute>
                    }
                  />

                  {/* =========================
                      NURSE
                  ========================== */}

                  <Route
                    path="/nurse"
                    element={
                      <ModuleRoute moduleName="NURSE">
                        <NurseDashboard />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/nurse/patients/:id/vitals"
                    element={
                      <ModuleRoute moduleName="NURSE">
                        <Vitals />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/nurse/patients/:id/send-doctor"
                    element={
                      <ModuleRoute moduleName="NURSE">
                        <SendToDoctor />
                      </ModuleRoute>
                    }
                  />

                  {/* =========================
                      DOCTOR
                  ========================== */}

                  <Route
                    path="/doctor"
                    element={
                      <ModuleRoute moduleName="DOCTOR">
                        <DoctorDashboard />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/doctor/patients/:id/consultation"
                    element={
                      <ModuleRoute moduleName="DOCTOR">
                        <Consultation />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/doctor/queue"
                    element={
                      <ModuleRoute moduleName="DOCTOR">
                        <DoctorQueue />
                      </ModuleRoute>
                    }
                  />

                  {/* =========================
                      LABORATORY
                  ========================== */}

                  <Route
                    path="/laboratory"
                    element={
                      <ModuleRoute moduleName="LABORATORY">
                        <LaboratoryDashboard />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/laboratory/patients/:id"
                    element={
                      <ModuleRoute moduleName="LABORATORY">
                        <LaboratoryPatient />
                      </ModuleRoute>
                    }
                  />

                  {/* =========================
                      PHARMACY
                  ========================== */}

                  <Route
                    path="/pharmacy"
                    element={<PharmacyDashboard />}
                  />

                  <Route
                    path="/pharmacy/prescriptions"
                    element={<Prescriptions />}
                  />

                  <Route
                    path="/pharmacy/patients/:id"
                    element={<PharmacyPatient />}
                  />

                  <Route
                    path="/pharmacy/medicines"
                    element={<Medicines />}
                  />

                  <Route
                    path="/pharmacy/medicines/add"
                    element={<AddMedicine />}
                  />

                  <Route
                    path="/pharmacy/medicines/:id"
                    element={<MedicineDetails />}
                  />

                  <Route
                    path="/pharmacy/medicines/:id/edit"
                    element={<EditMedicine />}
                  />

                  <Route
                    path="/pharmacy/stock-in"
                    element={<StockIn />}
                  />

                  <Route
                    path="/pharmacy/stock-adjustment"
                    element={<StockAdjustment />}
                  />

                  <Route
                    path="/pharmacy/expiry-management"
                    element={<ExpiryManagement />}
                  />

                  <Route
                    path="/pharmacy/dispensing-history"
                    element={<DispensingHistory />}
                  />

                  {/* =========================
                      BILLING
                  ========================== */}

                  <Route
                    path="/billing"
                    element={<BillingDashboard />}
                  />

                  <Route
                    path="/billing/cash"
                    element={<CashBilling />}
                  />

                  <Route
                    path="/billing/insurance"
                    element={<InsuranceBilling />}
                  />

                  <Route
                    path="/billing/invoices"
                    element={<Invoices />}
                  />

                  <Route
                    path="/billing/invoices/new"
                    element={<CreateInvoice />}
                  />

                  <Route
                    path="/billing/invoices/:id"
                    element={<InvoiceDetails />}
                  />

                  <Route
                    path="/billing/insurance-providers"
                    element={<InsuranceProviders />}
                  />

                  <Route
                    path="/billing/insurance-claims"
                    element={<InsuranceClaims />}
                  />

                  <Route
                    path="/billing/payments"
                    element={<Payments />}
                  />

                  <Route
                    path="/billing/receipts/:paymentId"
                    element={<Receipt />}
                  />

                  {/* =========================
                      MATERNITY
                  ========================== */}

                  <Route
                    path="/maternity"
                    element={
                      <ModuleRoute moduleName="MATERNITY">
                        <MaternityDashboard />
                      </ModuleRoute>
                    }
                  />

                  {/* =========================
                      LABOUR & DELIVERY
                  ========================== */}

                  <Route
                    path="/maternity/labour"
                    element={
                      <ModuleRoute moduleName="MATERNITY">
                        <LabourDashboard />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/maternity/pregnancies"
                    element={
                      <ModuleRoute moduleName="MATERNITY">
                        <Pregnancies />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/maternity/pregnancies/register"
                    element={
                      <ModuleRoute moduleName="MATERNITY">
                        <RegisterPregnancy />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/maternity/pregnancies/:id"
                    element={
                      <ModuleRoute moduleName="MATERNITY">
                        <PregnancyProfile />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/maternity/pregnancies/:id/edit"
                    element={
                      <ModuleRoute moduleName="MATERNITY">
                        <EditPregnancy />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/maternity/pregnancies/:id/anc"
                    element={
                      <ModuleRoute moduleName="MATERNITY">
                        <ANCVisits />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/maternity/pregnancies/:id/anc/register"
                    element={
                      <ModuleRoute moduleName="MATERNITY">
                        <RegisterANCVisit />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/maternity/anc-visits/:id"
                    element={
                      <ModuleRoute moduleName="MATERNITY">
                        <ANCVisitProfile />
                      </ModuleRoute>
                    }
                  />

                  <Route
                    path="/maternity/anc-visits/:id/edit"
                    element={
                      <ModuleRoute moduleName="MATERNITY">
                        <EditANCVisit />
                      </ModuleRoute>
                    }
                  />
                  <Route 
                    path="/maternity/labour-records"
                    element={
                       <ModuleRoute moduleName="MATERNITY">
                         <LabourRecords />
                       </ModuleRoute>
                    }
                  />
                  <Route 
                    path="/maternity/labour-records/:id"
                    element={
                        <ModuleRoute moduleName="MATERNITY">
                          <LabourRecordProfile />
                        </ModuleRoute>
                   }
                  />
                  <Route
                    path="/maternity/labour-records/register"
                    element={
                        <ModuleRoute moduleName="MATERNITY">
                          <RegisterLabourRecord />
                        </ModuleRoute>
                  }
                  />
                  <Route
                    path="/maternity/labour-records/:id/edit"
                    element={
                        <ModuleRoute moduleName="MATERNITY">
                          <EditLabourRecord />
                        </ModuleRoute>
            }
                  />

                </Routes>

              </AppLayout>

            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}