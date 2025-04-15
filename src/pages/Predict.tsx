import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Brain, BarChart3, RefreshCcw } from 'lucide-react';
import { checkModelStatus, trainModels, makePrediction, makeMinimalPrediction, isAuthenticated } from '../api';
import type { PredictionRequest, PredictionRequestMinimal, PredictionResult } from '../types';

const initialFormData: PredictionRequest = {
  product_name: "",
  brand: "",
  category: "",
  region: "",
  seller: "",
  price: 0,
  original_price: 0,
  discount_percentage: 0,
  stock_level: 0,
  customer_rating: 0,
  review_count: 0,
  delivery_days: 0,
  is_weekend: false,
  is_holiday: false,
  day_of_week: 0,
  month: 1,
  quarter: 1,
  sales_quantity_lag_1: 0,
  price_lag_1: 0,
  sales_quantity_lag_3: 0,
  price_lag_3: 0,
  sales_quantity_lag_7: 0,
  price_lag_7: 0,
  sales_quantity_rolling_mean_3: 0,
  price_rolling_mean_3: 0,
  sales_quantity_rolling_mean_7: 0,
  price_rolling_mean_7: 0
};

const initialMinimalFormData: PredictionRequestMinimal = {
  product_name: "",
  region: "",
  seller: "",
};

const Predict = () => {
  const [formData, setFormData] = useState<PredictionRequest>(initialFormData);
  const [minimalFormData, setMinimalFormData] = useState<PredictionRequestMinimal>(initialMinimalFormData);
  const [isMinimalMode, setIsMinimalMode] = useState(true);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    checkModelTrainingStatus();
  }, [navigate]);

  const checkModelTrainingStatus = async () => {
    try {
      const status = await checkModelStatus();
      setIsModelTrained(status.models_trained);
    } catch (error) {
      toast.error('Ошибка при проверке статуса модели');
    }
  };

  const handleTrainModel = async () => {
    try {
      setIsLoading(true);
      await trainModels();
      toast.success('Модель успешно переобучена');
      setIsModelTrained(true);
    } catch (error) {
      toast.error('Ошибка при обучении модели');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isModelTrained) {
      toast.error('Пожалуйста, сначала обучите модель');
      return;
    }
    
    try {
      setIsLoading(true);
      setPredictionError(null);
      
      let result;
      let attempts = 0;
      let maxAttempts = 8;
      let hasValidResult = false;
      
      while (attempts < maxAttempts && !hasValidResult) {
        try {
          if (isMinimalMode) {
            result = await makeMinimalPrediction(minimalFormData);
          } else {
            result = await makePrediction(formData);
          }
          
          // Check if we got zero values
          if (result.predicted_price !== 0 || result.predicted_sales !== 0) {
            hasValidResult = true;
          } else {
            attempts++;
            if (attempts === maxAttempts) {
              break;
            }
            // Small delay before retry
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          attempts++;
          if (attempts === maxAttempts) {
            throw error;
          }
          // Small delay before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (!hasValidResult && attempts === maxAttempts) {
        setPredictionError("Невозможно сделать прогноз с текущими данными. Требуется дообучение модели.");
        setPrediction(null);
        toast.error('Прогноз невозможен с текущими данными');
      } else {
        setPrediction(result);
        toast.success('Прогноз успешно получен');
      }
    } catch (error) {
      toast.error('Ошибка при получении прогноза');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (isMinimalMode) {
      setMinimalFormData((prev: PredictionRequestMinimal) => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : 
                type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                value
      }));
    } else {
      setFormData((prev: PredictionRequest) => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : 
                type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                value
      }));
    }
  };

  const toggleInputMode = () => {
    setIsMinimalMode(!isMinimalMode);
    setPrediction(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Brain className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
            Система прогнозирования спроса
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/statistics')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-gray-700"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            История прогнозов
          </button>
          
          <button
            onClick={handleTrainModel}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            <RefreshCcw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Обучение...' : 'Обучить модель'}
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {isMinimalMode ? 'Упрощенный режим прогнозирования' : 'Расширенный режим прогнозирования'}
            </h3>
            <button
              onClick={toggleInputMode}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {isMinimalMode ? 'Расширенный режим' : 'Упрощенный режим'}
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isMinimalMode ? (
              // Minimal mode inputs
              <>
                <div>
                  <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Название товара *
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    id="product_name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={minimalFormData.product_name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Регион *
                  </label>
                  <input
                    type="text"
                    name="region"
                    id="region"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={minimalFormData.region}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="seller" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Продавец *
                  </label>
                  <input
                    type="text"
                    name="seller"
                    id="seller"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={minimalFormData.seller}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Цена
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={minimalFormData.price || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Исходная цена
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    id="original_price"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={minimalFormData.original_price || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="stock_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Уровень запасов
                  </label>
                  <input
                    type="number"
                    name="stock_level"
                    id="stock_level"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={minimalFormData.stock_level || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            ) : (
              // Full mode inputs (showing only a subset for brevity)
              <>
                <div>
                  <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Название товара *
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    id="product_name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.product_name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Бренд *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    id="brand"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Категория *
                  </label>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.category}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Регион *
                  </label>
                  <input
                    type="text"
                    name="region"
                    id="region"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.region}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="seller" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Продавец *
                  </label>
                  <input
                    type="text"
                    name="seller"
                    id="seller"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.seller}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Цена *
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Исходная цена *
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    id="original_price"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.original_price}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Процент скидки *
                  </label>
                  <input
                    type="number"
                    name="discount_percentage"
                    id="discount_percentage"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="stock_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Уровень запасов *
                  </label>
                  <input
                    type="number"
                    name="stock_level"
                    id="stock_level"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.stock_level}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="customer_rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Рейтинг покупателя *
                  </label>
                  <input
                    type="number"
                    name="customer_rating"
                    id="customer_rating"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.customer_rating}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="review_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Количество отзывов *
                  </label>
                  <input
                    type="number"
                    name="review_count"
                    id="review_count"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.review_count}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="delivery_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Дни доставки *
                  </label>
                  <input
                    type="number"
                    name="delivery_days"
                    id="delivery_days"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.delivery_days}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="is_weekend" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Выходной день *
                  </label>
                  <input
                    type="checkbox"
                    name="is_weekend"
                    id="is_weekend"
                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    checked={formData.is_weekend}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="is_holiday" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Праздничный день *
                  </label>
                  <input
                    type="checkbox"
                    name="is_holiday"
                    id="is_holiday"
                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    checked={formData.is_holiday}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    День недели (0-6) *
                  </label>
                  <input
                    type="number"
                    name="day_of_week"
                    id="day_of_week"
                    min="0"
                    max="6"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.day_of_week}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Месяц (1-12) *
                  </label>
                  <input
                    type="number"
                    name="month"
                    id="month"
                    min="1"
                    max="12"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.month}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="quarter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Квартал (1-4) *
                  </label>
                  <input
                    type="number"
                    name="quarter"
                    id="quarter"
                    min="1"
                    max="4"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.quarter}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="sales_quantity_lag_1" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Количество продаж лаг 1 *
                  </label>
                  <input
                    type="number"
                    name="sales_quantity_lag_1"
                    id="sales_quantity_lag_1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.sales_quantity_lag_1}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="price_lag_1" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Цена лаг 1 *
                  </label>
                  <input
                    type="number"
                    name="price_lag_1"
                    id="price_lag_1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.price_lag_1}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="sales_quantity_lag_3" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Количество продаж лаг 3 *
                  </label>
                  <input
                    type="number"
                    name="sales_quantity_lag_3"
                    id="sales_quantity_lag_3"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.sales_quantity_lag_3}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="price_lag_3" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Цена лаг 3 *
                  </label>
                  <input
                    type="number"
                    name="price_lag_3"
                    id="price_lag_3"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.price_lag_3}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="sales_quantity_lag_7" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Количество продаж лаг 7 *
                  </label>
                  <input
                    type="number"
                    name="sales_quantity_lag_7"
                    id="sales_quantity_lag_7"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.sales_quantity_lag_7}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="price_lag_7" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Цена лаг 7 *
                  </label>
                  <input
                    type="number"
                    name="price_lag_7"
                    id="price_lag_7"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.price_lag_7}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="sales_quantity_rolling_mean_3" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Скользящее среднее продаж 3 *
                  </label>
                  <input
                    type="number"
                    name="sales_quantity_rolling_mean_3"
                    id="sales_quantity_rolling_mean_3"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.sales_quantity_rolling_mean_3}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="price_rolling_mean_3" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Скользящее среднее цены 3 *
                  </label>
                  <input
                    type="number"
                    name="price_rolling_mean_3"
                    id="price_rolling_mean_3"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.price_rolling_mean_3}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="sales_quantity_rolling_mean_7" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Скользящее среднее продаж 7 *
                  </label>
                  <input
                    type="number"
                    name="sales_quantity_rolling_mean_7"
                    id="sales_quantity_rolling_mean_7"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.sales_quantity_rolling_mean_7}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="price_rolling_mean_7" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Скользящее среднее цены 7 *
                  </label>
                  <input
                    type="number"
                    name="price_rolling_mean_7"
                    id="price_rolling_mean_7"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    value={formData.price_rolling_mean_7}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-600 w-full sm:w-auto"
            >
              {isLoading ? 'Обработка...' : 'Получить прогноз'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Display prediction results */}
      {prediction && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Результаты прогнозирования
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Основано на данных модели машинного обучения
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Прогноз цены</h4>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(prediction.predicted_price)}
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Рекомендуемая цена на основе анализа рынка и спроса
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Прогноз продаж (неделя)</h4>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(prediction.predicted_sales)} шт.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Ожидаемое количество продаж в неделю
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Прогноз продаж (день)</h4>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {(prediction.predicted_sales / 7).toFixed(1)} шт.
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Ожидаемое количество продаж в день
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Display prediction error */}
      {predictionError && (
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 mt-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">
                {predictionError}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predict; 