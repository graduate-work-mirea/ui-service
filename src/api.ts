import axios from 'axios';
import { PredictionRequest, PredictionResult, ModelStatus } from './types';

const API_BASE_URL = 'http://localhost:6785/api/v1';

export const checkModelStatus = async (): Promise<ModelStatus> => {
  const response = await axios.get(`${API_BASE_URL}/status`);
  return response.data;
};

export const trainModels = async () => {
  const response = await axios.post(`${API_BASE_URL}/train`);
  return response.data;
};

export const makePrediction = async (data: PredictionRequest): Promise<PredictionResult> => {
  const response = await axios.post(`${API_BASE_URL}/predict`, data);
  return response.data;
};