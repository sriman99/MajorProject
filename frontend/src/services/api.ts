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
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
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
};

// Export the axios instance for custom requests
export default apiClient;
