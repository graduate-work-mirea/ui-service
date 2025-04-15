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

export interface PredictionResult {
  predicted_price: number;
  predicted_sales: number;
}

export interface ModelStatus {
  models_trained: boolean;
}