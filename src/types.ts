export interface PredictionRequest {
  // Required fields
  product_name: string;
  category: string;
  current_price: number;
  region: string;
  
  // Optional fields
  brand?: string;
  stock_level?: number;
  customer_rating?: number;
  review_count?: number;
  delivery_days?: number;
  is_promo?: boolean;
  competitor_prices?: number[];
  historical_prices?: number[];
}

export interface PredictionRequestMinimal {
  product_name: string;
  region: string;
  seller: string;
  prediction_date?: string;
  price?: number;
  original_price?: number;
  stock_level?: number;
  customer_rating?: number;
  review_count?: number;
  delivery_days?: number;
}

export interface PredictionResult {
  predicted_price: number;
  demand_growth_percentage: number;
  confidence_interval: [number, number];
  recommendations: string;
}

export interface ModelStatus {
  models_trained: boolean;
}

export interface TrainingResult {
  price_model: {
    best_iteration: number;
    best_score: number;
  };
  sales_model: {
    best_iteration: number;
    best_score: number;
  };
}

// Authentication types
export interface UserRegisterRequest {
  email: string;
  password: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user_id: string;
  email: string;
  role: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  created_at?: string;
  last_login_at?: string;
}

// Statistics types
export interface PredictionHistory {
  id: string;
  user_id: string;
  request: PredictionRequest;
  result: PredictionResult;
  created_at: string;
}

export interface UserStatistics {
  user_id: string;
  predictions: PredictionHistory[];
}

export interface TopProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  current_price: number;
  predicted_price: number;
  demand_growth_percentage: number;
}

export interface TopProducts {
  top_demand_growth: TopProduct[];
  top_price_increase: TopProduct[];
}