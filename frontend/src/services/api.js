import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

/**
 * Send login credentials to the backend.
 * @param {{ email: string, password: string }} credentials
 */
export function loginUser(credentials) {
  return apiClient.post("/auth/login", credentials);
}

/**
 * Send registration data to the backend.
 * @param {{ name: string, email: string, password: string, role: string }} userData
 */
export function registerUser(userData) {
  return apiClient.post("/auth/register", userData);
}

/**
 * Retrieve the full departments list from the backend.
 */
export function getDepartments() {
  return apiClient.get("/departments");
}

/**
 * Create a new department.
 * @param {{ name: string, description: string }} data
 */
export function createDepartment(data) {
  return apiClient.post("/departments", data);
}

/**
 * Update an existing department by id.
 * @param {string} id
 * @param {{ name?: string, description?: string }} data
 */
export function updateDepartment(id, data) {
  return apiClient.put(`/departments/${id}`, data);
}

/**
 * Delete a department by id.
 * @param {string} id
 */
export function deleteDepartment(id) {
  return apiClient.delete(`/departments/${id}`);
}

/**
 * Retrieve the full doctors list from the backend.
 */
export function getDoctors() {
  return apiClient.get("/doctors");
}

export function getDoctorById(id) {
  return apiClient.get(`/doctors/${id}`);
}

export function getPatients() {
  return apiClient.get("/patients");
}

export function getPatientById(id) {
  return apiClient.get(`/patients/${id}`);
}

export function createPatient(data) {
  return apiClient.post("/patients", data);
}

export function updatePatient(id, data) {
  return apiClient.put(`/patients/${id}`, data);
}

export function deletePatient(id) {
  return apiClient.delete(`/patients/${id}`);
}

/**
 * Create a new doctor.
 * @param {{ name: string, specialization: string, department: string, experience?: number, email?: string, phone?: string }} data
 */
export function createDoctor(data) {
  return apiClient.post("/doctors", data);
}

/**
 * Update a doctor by id.
 * @param {string} id
 * @param {object} data
 */
export function updateDoctor(id, data) {
  return apiClient.put(`/doctors/${id}`, data);
}

/**
 * Delete a doctor by id.
 * @param {string} id
 */
export function deleteDoctor(id) {
  return apiClient.delete(`/doctors/${id}`);
}

/**
 * Retrieve the full appointments list from the backend.
 */
export function getAppointments() {
  return apiClient.get("/appointments");
}

/**
 * Create a new appointment.
 * @param {{ patient: string, doctor: string, appointmentDate: string }} data
 */
export function createAppointment(data) {
  return apiClient.post("/appointments", data);
}

/**
 * Cancel an appointment by id.
 * @param {string} id
 */
export function cancelAppointment(id) {
  return apiClient.put(`/appointments/${id}/cancel`);
}

/**
 * Complete an appointment by id.
 * @param {string} id
 * @param {string} notes
 */
export function completeAppointment(id, notes = "") {
  return apiClient.put(`/appointments/${id}/complete`, { notes });
}

// Queue endpoints
export function getCurrentPatient(doctorId) {
  return apiClient.get(`/queue/${doctorId}/current`);
}

export function getRemainingQueue(doctorId) {
  return apiClient.get(`/queue/${doctorId}/remaining`);
}

export function completeCurrentPatient(doctorId) {
  return apiClient.put(`/queue/${doctorId}/complete`);
}

export function skipCurrentPatient(doctorId) {
  return apiClient.put(`/queue/${doctorId}/skip`);
}

export function getDoctorByUser(userId) {
  return apiClient.get(`/doctors/user/${userId}`);
}

export function getDoctorStats(id) {
  return apiClient.get(`/doctors/${id}/stats`);
}

export function getPatientQueue(patientId) {
  return apiClient.get(`/queue/patient/${patientId}`);
}

export function changePassword(id, data) {
  return apiClient.put(`/patients/${id}/change-password`, data);
}

export default apiClient;
