export interface PredictionRequest {
  product_name: string;
  brand: string;
  category: string;
  region: string;
  seller: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  stock_level: number;
  customer_rating: number;
  review_count: number;
  delivery_days: number;
  is_weekend: boolean;
  is_holiday: boolean;
  day_of_week: number;
  month: number;
  quarter: number;
  sales_quantity_lag_1: number;
  price_lag_1: number;
  sales_quantity_lag_3: number;
  price_lag_3: number;
  sales_quantity_lag_7: number;
  price_lag_7: number;
  sales_quantity_rolling_mean_3: number;
  price_rolling_mean_3: number;
  sales_quantity_rolling_mean_7: number;
  price_rolling_mean_7: number;
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
  predicted_sales: number;
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

// New types for authentication
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
  request: PredictionRequest | PredictionRequestMinimal;
  result: PredictionResult;
  created_at: string;
  endpoint_type: string;
  minimal: boolean;
}

export interface UserStatistics {
  user_id: string;
  predictions: PredictionHistory[];
}