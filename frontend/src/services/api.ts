/**
 * API Service Layer
 * Centralized API communication with backend
 */
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait a moment.');
    }
    return Promise.reject(error);
  }
);

// =============================================
// APPOINTMENTS API
// =============================================

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface CreateAppointmentData {
  doctor_id: string;
  patient_id: string;
  date: string;
  time: string;
  reason: string;
}

export const appointmentsApi = {
  // Get all appointments for current user
  getAll: async (): Promise<Appointment[]> => {
    const response = await apiClient.get('/appointments');
    return response.data;
  },

  // Create new appointment
  create: async (data: CreateAppointmentData): Promise<Appointment> => {
    const response = await apiClient.post('/appointments', data);
    return response.data;
  },

  // Update appointment status
  updateStatus: async (
    appointmentId: string,
    status: Appointment['status']
  ): Promise<Appointment> => {
    const response = await apiClient.put(`/appointments/${appointmentId}`, null, {
      params: { status },
    });
    return response.data;
  },
};

// =============================================
// DOCTORS API
// =============================================

export interface Doctor {
  id: string;
  name: string;
  experience: string;
  qualifications: string;
  languages: string[];
  specialties: string[];
  gender: 'male' | 'female' | 'other';
  image_url?: string;
  locations: Array<{
    hospital: string;
    address: string;
  }>;
  timings: {
    hours: string;
    days: string;
  };
}

export interface DoctorStats {
  todays_appointments: number;
  total_patients: number;
  pending_appointments: number;
  completed_this_week: number;
}

export interface PatientInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  last_appointment_date?: string;
}

export interface AppointmentWithPatient extends Appointment {
  patient?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export const doctorsApi = {
  // Get all doctors
  getAll: async (specialty?: string): Promise<Doctor[]> => {
    const params = specialty ? { specialty } : {};
    const response = await apiClient.get('/doctors', { params });
    return response.data;
  },

  // Get specific doctor
  getById: async (doctorId: string): Promise<Doctor> => {
    const response = await apiClient.get(`/doctors/${doctorId}`);
    return response.data;
  },

  // Get current doctor's profile
  getMyProfile: async (): Promise<Doctor> => {
    const response = await apiClient.get('/doctors/me');
    return response.data;
  },

  // Get current doctor's statistics
  getMyStats: async (): Promise<DoctorStats> => {
    const response = await apiClient.get('/doctors/me/stats');
    return response.data;
  },

  // Get current doctor's patients
  getMyPatients: async (): Promise<PatientInfo[]> => {
    const response = await apiClient.get('/doctors/me/patients');
    return response.data;
  },

  // Get current doctor's schedule
  getMySchedule: async (
    startDate?: string,
    endDate?: string,
    status?: string
  ): Promise<AppointmentWithPatient[]> => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (status) params.status = status;

    const response = await apiClient.get('/doctors/me/schedule', { params });
    return response.data;
  },
};

// =============================================
// ANALYSIS API
// =============================================

export interface Analysis {
  id: string;
  user_id: string;
  disease_type?: string;
  confidence?: number;
  result?: {
    disease: string;
    confidence: number;
    predictions: Record<string, number>;
  };
  timestamp?: string;
  // Legacy fields
  file_path?: string;
  analysis_type?: 'audio' | 'file';
  status?: 'normal' | 'warning' | 'critical';
  message?: string;
  details?: string[];
  created_at?: string;
}

export const analysisApi = {
  // Get all analyses for current user
  getAll: async (): Promise<Analysis[]> => {
    const response = await apiClient.get('/analysis');
    return response.data;
  },

  // Upload audio file for lung disease analysis
  analyzeLungDisease: async (audioFile: File): Promise<Analysis['result']> => {
    const formData = new FormData();
    formData.append('audio_file', audioFile);

    const response = await apiClient.post('/api/analysis/lung-disease', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// =============================================
// USERS API
// =============================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'doctor' | 'user';
  username?: string;
  is_active: boolean;
  avatar_url?: string;
  doctor_profile?: Doctor;
}

export interface UserProfileUpdate {
  full_name: string;
  phone: string;
  username?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export const usersApi = {
  // Get current user profile
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // Update current user profile
  updateProfile: async (data: UserProfileUpdate): Promise<User> => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: PasswordChange): Promise<{ message: string }> => {
    const response = await apiClient.put('/users/me/password', data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatar_url: string; message: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all users (admin only)
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },
};

// =============================================
// ADMIN API
// =============================================

export interface AdminStats {
  total_users: number;
  total_doctors: number;
  total_patients: number;
  total_appointments: number;
  pending_appointments: number;
  confirmed_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  active_appointments: number;
  system_health: number;
}

export interface AdminUsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdminUsersParams {
  skip?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export interface EnrichedAppointment {
  id: string;
  doctor_id: string;
  doctor_name: string;
  patient_id: string;
  patient_name: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface AdminAppointmentsResponse {
  appointments: EnrichedAppointment[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdminAppointmentsParams {
  skip?: number;
  limit?: number;
  status?: string;
}

export const adminApi = {
  // Get admin dashboard statistics
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  // Get all users with pagination and filtering
  getUsers: async (params?: AdminUsersParams): Promise<AdminUsersResponse> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (
    userId: string,
    isActive: boolean
  ): Promise<{ message: string; user_id: string; is_active: boolean }> => {
    const response = await apiClient.put(`/admin/users/${userId}/status`, null, {
      params: { is_active: isActive },
    });
    return response.data;
  },

  // Delete user (soft delete)
  deleteUser: async (userId: string): Promise<{ message: string; user_id: string }> => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Get all appointments with pagination and filtering
  getAppointments: async (params?: AdminAppointmentsParams): Promise<AdminAppointmentsResponse> => {
    const response = await apiClient.get('/admin/appointments', { params });
    return response.data;
  },
};

// =============================================
// HOSPITALS API
// =============================================

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  specialties: string[];
  image_url?: string;
  timings: Record<string, string>;
  directions_url: string;
}

export const hospitalsApi = {
  // Get all hospitals
  getAll: async (): Promise<Hospital[]> => {
    const response = await apiClient.get('/hospitals');
    return response.data;
  },

  // Get specific hospital
  getById: async (hospitalId: string): Promise<Hospital> => {
    const response = await apiClient.get(`/hospitals/${hospitalId}`);
    return response.data;
  },
};

// =============================================
// AUTH API
// =============================================

export interface LoginData {
  username: string; // Actually email
  password: string;
}

export interface SignupData {
  email: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'doctor' | 'user';
  password: string;
  confirm_password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
  confirm_password: string;
}

export const authApi = {
  // Login
  login: async (data: LoginData): Promise<TokenResponse> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);

    const response = await apiClient.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Signup
  signup: async (data: SignupData): Promise<User> => {
    const response = await apiClient.post('/signup', data);
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};

// =============================================
// PAYMENTS API
// =============================================

export interface Payment {
  id: string;
  user_id: string;
  appointment_id: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  payment_method: string;
  created_at: string;
}

export interface PaymentCreate {
  amount: number;
  appointment_id: string;
  payment_method: 'card' | 'upi' | 'netbanking';
}

export const paymentsApi = {
  // Create payment
  create: async (data: PaymentCreate): Promise<Payment> => {
    const response = await apiClient.post('/payments', data);
    return response.data;
  },

  // Get all payments for current user
  getAll: async (): Promise<Payment[]> => {
    const response = await apiClient.get('/payments');
    return response.data;
  },

  // Get specific payment
  getById: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data;
  },
};

// Export the axios instance for custom requests
export default apiClient;
