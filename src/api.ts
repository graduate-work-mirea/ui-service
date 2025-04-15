import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { 
  PredictionRequest, 
  PredictionRequestMinimal, 
  PredictionResult, 
  ModelStatus, 
  TrainingResult,
  UserRegisterRequest,
  UserLoginRequest,
  AuthResponse,
  UserStatistics
} from './types';

// Update to use API gateway
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with interceptors for auth
const api = axios.create({
  baseURL: API_BASE_URL
});

// Add request interceptor to include the token in requests
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Authentication
export const register = async (data: UserRegisterRequest): Promise<AuthResponse> => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
  // Store tokens in localStorage
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
  return response.data;
};

export const login = async (data: UserLoginRequest): Promise<AuthResponse> => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
  // Store tokens in localStorage
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};

// Prediction related endpoints
export const checkModelStatus = async (): Promise<ModelStatus> => {
  const response = await api.get(`/api/v1/status`);
  return response.data;
};

export const trainModels = async (): Promise<TrainingResult> => {
  const response = await api.post(`/api/v1/train`);
  return response.data;
};

export const makePrediction = async (data: PredictionRequest): Promise<PredictionResult> => {
  const response = await api.post(`/api/v1/predict`, data);
  return response.data;
};

export const makeMinimalPrediction = async (data: PredictionRequestMinimal): Promise<PredictionResult> => {
  const response = await api.post(`/api/v1/predict/minimal`, data);
  return response.data;
};

// Statistics
export const getUserStatistics = async (): Promise<UserStatistics> => {
  const response = await api.get(`/api/v1/statistics/user`);
  return response.data;
};