import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { 
  PredictionRequest, 
  PredictionResult, 
  ModelStatus, 
  TrainingResult,
  UserRegisterRequest,
  UserLoginRequest,
  AuthResponse,
  UserStatistics,
  TopProducts,
  PredictionHistory
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

// Mock data for predictions
const mockPredictionResult: PredictionResult = {
  predicted_price: 79462,
  demand_growth_percentage: 5.2,
  confidence_interval: [78572, 80352],
  recommendations: "Рассмотрите снижение цены на 500 рублей для стимулирования спроса в ближайшие 7 дней."
};

// Mock data for top products
const mockTopProducts: TopProducts = {
  top_demand_growth: [
    {
      id: "smartphone_apple_iphone_14",
      name: "Смартфон Apple iPhone 14",
      brand: "Apple",
      category: "Электроника",
      current_price: 79990.0,
      predicted_price: 82990.0,
      demand_growth_percentage: 35.0
    },
    {
      id: "laptop_dell_xps_13",
      name: "Ноутбук Dell XPS 13",
      brand: "Dell",
      category: "Электроника",
      current_price: 129990.0,
      predicted_price: 134990.0,
      demand_growth_percentage: 28.0
    },
    {
      id: "headphones_sony_wh1000xm5",
      name: "Наушники Sony WH-1000XM5",
      brand: "Sony",
      category: "Электроника",
      current_price: 29990.0,
      predicted_price: 31990.0,
      demand_growth_percentage: 25.0
    },
    {
      id: "sneakers_nike_air_max",
      name: "Кроссовки Nike Air Max",
      brand: "Nike",
      category: "Одежда",
      current_price: 12990.0,
      predicted_price: 13990.0,
      demand_growth_percentage: 22.0
    },
    {
      id: "jacket_zara_winter",
      name: "Зимняя куртка Zara",
      brand: "Zara",
      category: "Одежда",
      current_price: 8990.0,
      predicted_price: 9490.0,
      demand_growth_percentage: 20.0
    },
    {
      id: "refrigerator_bosch_kgn39",
      name: "Холодильник Bosch KGN39",
      brand: "Bosch",
      category: "Бытовая техника",
      current_price: 59990.0,
      predicted_price: 62990.0,
      demand_growth_percentage: 18.0
    },
    {
      id: "washing_machine_lg_f2j3",
      name: "Стиральная машина LG F2J3",
      brand: "LG",
      category: "Бытовая техника",
      current_price: 34990.0,
      predicted_price: 36990.0,
      demand_growth_percentage: 15.0
    },
    {
      id: "book_harry_potter",
      name: "Книга 'Гарри Поттер и философский камень'",
      brand: "Bloomsbury",
      category: "Книги",
      current_price: 990.0,
      predicted_price: 1090.0,
      demand_growth_percentage: 12.0
    },
    {
      id: "toy_lego_star_wars",
      name: "Конструктор LEGO Star Wars",
      brand: "LEGO",
      category: "Игрушки",
      current_price: 4990.0,
      predicted_price: 5290.0,
      demand_growth_percentage: 10.0
    },
    {
      id: "cosmetics_loreal_set",
      name: "Набор косметики L'Oreal",
      brand: "L'Oreal",
      category: "Косметика",
      current_price: 2990.0,
      predicted_price: 3190.0,
      demand_growth_percentage: 8.0
    }
  ],
  top_price_increase: [
    {
      id: "gaming_console_sony_ps5",
      name: "Игровая приставка Sony PlayStation 5",
      brand: "Sony",
      category: "Электроника",
      current_price: 49990.0,
      predicted_price: 54990.0,
      demand_growth_percentage: 15.0
    },
    {
      id: "tablet_apple_ipad_pro",
      name: "Планшет Apple iPad Pro",
      brand: "Apple",
      category: "Электроника",
      current_price: 89990.0,
      predicted_price: 94990.0,
      demand_growth_percentage: 20.0
    },
    {
      id: "smartwatch_samsung_galaxy_watch",
      name: "Умные часы Samsung Galaxy Watch",
      brand: "Samsung",
      category: "Электроника",
      current_price: 24990.0,
      predicted_price: 27990.0,
      demand_growth_percentage: 18.0
    },
    {
      id: "laptop_dell_xps_13",
      name: "Ноутбук Dell XPS 13",
      brand: "Dell",
      category: "Электроника",
      current_price: 129990.0,
      predicted_price: 134990.0,
      demand_growth_percentage: 28.0
    },
    {
      id: "refrigerator_bosch_kgn39",
      name: "Холодильник Bosch KGN39",
      brand: "Bosch",
      category: "Бытовая техника",
      current_price: 59990.0,
      predicted_price: 62990.0,
      demand_growth_percentage: 18.0
    },
    {
      id: "tv_samsung_qled_55",
      name: "Телевизор Samsung QLED 55\"",
      brand: "Samsung",
      category: "Электроника",
      current_price: 79990.0,
      predicted_price: 84990.0,
      demand_growth_percentage: 12.0
    },
    {
      id: "camera_canon_eos_r5",
      name: "Фотоаппарат Canon EOS R5",
      brand: "Canon",
      category: "Электроника",
      current_price: 349990.0,
      predicted_price: 359990.0,
      demand_growth_percentage: 10.0
    },
    {
      id: "sneakers_nike_air_max",
      name: "Кроссовки Nike Air Max",
      brand: "Nike",
      category: "Одежда",
      current_price: 12990.0,
      predicted_price: 13990.0,
      demand_growth_percentage: 22.0
    },
    {
      id: "jacket_zara_winter",
      name: "Зимняя куртка Zara",
      brand: "Zara",
      category: "Одежда",
      current_price: 8990.0,
      predicted_price: 9490.0,
      demand_growth_percentage: 20.0
    },
    {
      id: "smartphone_apple_iphone_14",
      name: "Смартфон Apple iPhone 14",
      brand: "Apple",
      category: "Электроника",
      current_price: 79990.0,
      predicted_price: 82990.0,
      demand_growth_percentage: 35.0
    }
  ]
};

// Prediction related endpoints
export const checkModelStatus = async (): Promise<ModelStatus> => {
  // Commented out actual API call
  // const response = await api.get(`/api/v1/status`);
  // return response.data;
  return { models_trained: true };
};

export const trainModels = async (): Promise<TrainingResult> => {
  // Commented out actual API call
  // const response = await api.post(`/api/v1/train`);
  // return response.data;
  return {
    price_model: { best_iteration: 100, best_score: 0.95 },
    sales_model: { best_iteration: 100, best_score: 0.95 }
  };
};

export const makePrediction = async (data: PredictionRequest): Promise<PredictionResult> => {
  // Commented out actual API call
  // const response = await api.post(`/api/v1/predict`, data);
  // return response.data;
  return mockPredictionResult;
};

// Statistics
export const getUserStatistics = async (): Promise<UserStatistics> => {
  // Commented out actual API call
  // const response = await api.get(`/api/v1/statistics/user`);
  // return response.data;
  
  // Generate mock data with realistic timestamps
  const now = new Date();
  const mockPredictions: PredictionHistory[] = [
    {
      id: "pred_001",
      user_id: "mock_user_id",
      request: {
        product_name: "Смартфон Apple iPhone 14",
        category: "Электроника",
        current_price: 79990,
        region: "Москва",
        brand: "Apple",
        stock_level: 45,
        customer_rating: 4.8,
        review_count: 1250,
        delivery_days: 2,
        is_promo: false,
        competitor_prices: [78990, 80990, 79500],
        historical_prices: [79990, 79990, 80990, 79990, 78990]
      },
      result: {
        predicted_price: 79462,
        demand_growth_percentage: 5.2,
        confidence_interval: [78572, 80352] as [number, number],
        recommendations: "Рассмотрите снижение цены на 500 рублей для стимулирования спроса в ближайшие 7 дней."
      },
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    {
      id: "pred_002",
      user_id: "mock_user_id",
      request: {
        product_name: "Ноутбук Dell XPS 13",
        category: "Электроника",
        current_price: 129990,
        region: "Санкт-Петербург",
        brand: "Dell",
        stock_level: 15,
        customer_rating: 4.9,
        review_count: 850,
        delivery_days: 3,
        is_promo: true,
        competitor_prices: [134990, 127990, 131990],
        historical_prices: [129990, 134990, 129990, 129990, 129990]
      },
      result: {
        predicted_price: 134990,
        demand_growth_percentage: 28.0,
        confidence_interval: [132990, 136990] as [number, number],
        recommendations: "Текущая цена оптимальна. Рекомендуется увеличить запас товара на 20%."
      },
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    },
    {
      id: "pred_003",
      user_id: "mock_user_id",
      request: {
        product_name: "Наушники Sony WH-1000XM5",
        category: "Электроника",
        current_price: 29990,
        region: "Москва",
        brand: "Sony",
        stock_level: 30,
        customer_rating: 4.7,
        review_count: 2100,
        delivery_days: 1,
        is_promo: false,
        competitor_prices: [28990, 30990, 29990],
        historical_prices: [29990, 29990, 29990, 29990, 29990]
      },
      result: {
        predicted_price: 31990,
        demand_growth_percentage: 25.0,
        confidence_interval: [30990, 32990] as [number, number],
        recommendations: "Рекомендуется повысить цену на 2000 рублей в связи с высоким спросом."
      },
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
    },
    {
      id: "pred_004",
      user_id: "mock_user_id",
      request: {
        product_name: "Кроссовки Nike Air Max",
        category: "Одежда",
        current_price: 12990,
        region: "Москва",
        brand: "Nike",
        stock_level: 100,
        customer_rating: 4.5,
        review_count: 3500,
        delivery_days: 2,
        is_promo: true,
        competitor_prices: [11990, 13990, 12990],
        historical_prices: [12990, 11990, 12990, 12990, 12990]
      },
      result: {
        predicted_price: 13990,
        demand_growth_percentage: 22.0,
        confidence_interval: [13490, 14490] as [number, number],
        recommendations: "Рекомендуется завершить акцию и установить цену 13990 рублей."
      },
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 72).toISOString() // 3 days ago
    },
    {
      id: "pred_005",
      user_id: "mock_user_id",
      request: {
        product_name: "Зимняя куртка Zara",
        category: "Одежда",
        current_price: 8990,
        region: "Санкт-Петербург",
        brand: "Zara",
        stock_level: 50,
        customer_rating: 4.3,
        review_count: 1200,
        delivery_days: 4,
        is_promo: false,
        competitor_prices: [8490, 9490, 8990],
        historical_prices: [8990, 8990, 8990, 8990, 8990]
      },
      result: {
        predicted_price: 9490,
        demand_growth_percentage: 20.0,
        confidence_interval: [9190, 9790] as [number, number],
        recommendations: "Рекомендуется повысить цену на 500 рублей в связи с сезонным спросом."
      },
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 96).toISOString() // 4 days ago
    }
  ];

  return {
    user_id: "mock_user_id",
    predictions: mockPredictions
  };
};

export const getTopProducts = async (): Promise<TopProducts> => {
  // Commented out actual API call
  // const response = await api.get(`/api/v1/top-products`);
  // return response.data;
  return mockTopProducts;
};