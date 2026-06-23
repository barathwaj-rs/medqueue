import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AppointmentPage from "./pages/AppointmentPage";
import QueuePage from "./pages/QueuePage";
import PatientPage from "./pages/PatientPage";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorQueuePage from "./pages/DoctorQueuePage";
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import PatientLayout from "./layouts/PatientLayout";
import BookAppointmentPage from "./pages/BookAppointmentPage";
import PatientAppointmentsPage from "./pages/PatientAppointmentsPage";
import PatientQueuePage from "./pages/PatientQueuePage";
import PatientProfilePage from "./pages/PatientProfilePage";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-black text-black min-h-screen">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PatientDashboard />} />

            <Route path="book" element={<BookAppointmentPage />} />

            <Route path="appointments" element={<PatientAppointmentsPage />} />

            <Route path="queue" element={<PatientQueuePage />} />

            <Route path="profile" element={<PatientProfilePage />} />
          </Route>
          <Route
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route path="doctor" element={<DoctorDashboard />} />
            <Route path="doctor/queue" element={<DoctorQueuePage />} />
            <Route
              path="doctor/appointments"
              element={<DoctorAppointmentsPage />}
            />
            <Route path="doctor/profile" element={<DoctorProfilePage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="appointments" element={<AppointmentPage />} />
            <Route path="queue" element={<QueuePage />} />
            <Route path="patients" element={<PatientPage />} />
            <Route path="doctors" element={<DoctorsPage />} />
          </Route>

       
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
