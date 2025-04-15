import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Brain, BarChart3, RefreshCcw, AlertCircle, ChevronsUpDown, Moon, Sun } from 'lucide-react';
import { checkModelStatus, trainModels, makePrediction, makeMinimalPrediction } from './api';
import type { PredictionRequest, PredictionRequestMinimal, PredictionResult } from './types';

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

function App() {
  const [formData, setFormData] = useState<PredictionRequest>(initialFormData);
  const [minimalFormData, setMinimalFormData] = useState<PredictionRequestMinimal>(initialMinimalFormData);
  const [isMinimalMode, setIsMinimalMode] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    checkModelTrainingStatus();
    
    // Check for user preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode to HTML element
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark:bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <Toaster position="top-right" toastOptions={{
        className: 'dark:bg-gray-800 dark:text-white',
      }} />
      
      {/* Header */}
      <header className={`${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} shadow-sm transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className={`h-8 w-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <h1 className={`ml-3 text-2xl font-bold ${isDarkMode ? 'dark:text-white' : 'text-gray-900'}`}>
                Система прогнозирования спроса
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`flex items-center p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-200' : 'bg-gray-200 text-indigo-700'}`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleInputMode}
                className={`flex items-center px-4 py-2 rounded-md ${isDarkMode 
                  ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:dark:bg-gray-600' 
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} 
                  text-sm font-medium transition-colors duration-200`}
              >
                <ChevronsUpDown className="h-5 w-5 mr-2" />
                {isMinimalMode ? "Полная форма" : "Упрощенная форма"}
              </button>
              <button
                onClick={handleTrainModel}
                disabled={isLoading}
                className={`flex items-center px-4 py-2 rounded-md text-white transition-colors duration-200 ${
                  isModelTrained 
                    ? isDarkMode ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700' 
                    : isDarkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'
                } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <RefreshCcw className="h-5 w-5 animate-spin" />
                ) : isModelTrained ? (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Модель обучена
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Обучить модель
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className={`${isDarkMode ? 'dark:bg-gray-800 dark:text-white' : 'bg-white'} rounded-lg shadow-lg p-6 transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-4">
              {isMinimalMode ? "Базовые параметры прогноза" : "Параметры прогноза"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isMinimalMode ? (
                // Minimal Form - reorganized with required and optional fields separated
                <>
                  <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                    <h3 className="text-md font-medium mb-3">Обязательные поля</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Название продукта
                        </label>
                        <input
                          type="text"
                          name="product_name"
                          value={minimalFormData.product_name}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="Смартфон Xiaomi 14 Pro"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Регион
                        </label>
                        <input
                          type="text"
                          name="region"
                          value={minimalFormData.region}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="Москва"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Продавец
                        </label>
                        <input
                          type="text"
                          name="seller"
                          value={minimalFormData.seller}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="ИП «Некрасова, Фролов и Кириллова»"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-3">Дополнительные поля</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Дата прогноза
                        </label>
                        <input
                          type="datetime-local"
                          name="prediction_date"
                          value={minimalFormData.prediction_date || ''}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Цена
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={minimalFormData.price || ''}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="44977"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Исходная цена
                        </label>
                        <input
                          type="number"
                          name="original_price"
                          value={minimalFormData.original_price || ''}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="49999"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Уровень запасов
                        </label>
                        <input
                          type="number"
                          name="stock_level"
                          value={minimalFormData.stock_level || ''}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="120"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Рейтинг покупателей
                        </label>
                        <input
                          type="number"
                          name="customer_rating"
                          value={minimalFormData.customer_rating || ''}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="4.7"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Количество отзывов
                        </label>
                        <input
                          type="number"
                          name="review_count"
                          value={minimalFormData.review_count || ''}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="342"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Дни доставки
                        </label>
                        <input
                          type="number"
                          name="delivery_days"
                          value={minimalFormData.delivery_days || ''}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="2"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Full Form
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Название продукта
                      </label>
                      <input
                        type="text"
                        name="product_name"
                        value={formData.product_name}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="Джинсы Lee Rider"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Бренд
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="Lee"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Категория
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="Одежда"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Регион
                      </label>
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="Москва"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Продавец
                      </label>
                      <input
                        type="text"
                        name="seller"
                        value={formData.seller}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="АО «Шарапов»"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Цена
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="7500.0"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Исходная цена
                      </label>
                      <input
                        type="number"
                        name="original_price"
                        value={formData.original_price}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="7500.0"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Процент скидки
                      </label>
                      <input
                        type="number"
                        name="discount_percentage"
                        value={formData.discount_percentage}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="0.0"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Уровень запасов
                      </label>
                      <input
                        type="number"
                        name="stock_level"
                        value={formData.stock_level}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="229.0"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Рейтинг покупателей
                      </label>
                      <input
                        type="number"
                        name="customer_rating"
                        value={formData.customer_rating}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="4.5"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Количество отзывов
                      </label>
                      <input
                        type="number"
                        name="review_count"
                        value={formData.review_count}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="408.0"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Дни доставки
                      </label>
                      <input
                        type="number"
                        name="delivery_days"
                        value={formData.delivery_days}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="1.0"
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_weekend"
                        checked={formData.is_weekend}
                        onChange={handleInputChange}
                        className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} focus:ring-indigo-500 border-gray-300 rounded`}
                      />
                      <label className={`ml-2 block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Выходной день
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_holiday"
                        checked={formData.is_holiday}
                        onChange={handleInputChange}
                        className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} focus:ring-indigo-500 border-gray-300 rounded`}
                      />
                      <label className={`ml-2 block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Праздничный день
                      </label>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        День недели (0-6)
                      </label>
                      <input
                        type="number"
                        name="day_of_week"
                        value={formData.day_of_week}
                        onChange={handleInputChange}
                        min="0"
                        max="6"
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="3"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Месяц (1-12)
                      </label>
                      <input
                        type="number"
                        name="month"
                        value={formData.month}
                        onChange={handleInputChange}
                        min="1"
                        max="12"
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="3"
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Квартал (1-4)
                      </label>
                      <input
                        type="number"
                        name="quarter"
                        value={formData.quarter}
                        onChange={handleInputChange}
                        min="1"
                        max="4"
                        className={`mt-1 block w-full rounded-md ${isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                        placeholder="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-md font-medium mb-3">Исторические данные</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Продажи 1 день назад
                        </label>
                        <input
                          type="number"
                          name="sales_quantity_lag_1"
                          value={formData.sales_quantity_lag_1}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="11.0"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Цена 1 день назад
                        </label>
                        <input
                          type="number"
                          name="price_lag_1"
                          value={formData.price_lag_1}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="9700.0"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Продажи 3 дня назад
                        </label>
                        <input
                          type="number"
                          name="sales_quantity_lag_3"
                          value={formData.sales_quantity_lag_3}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="10.0"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Цена 3 дня назад
                        </label>
                        <input
                          type="number"
                          name="price_lag_3"
                          value={formData.price_lag_3}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="8590.0"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Продажи 7 дней назад
                        </label>
                        <input
                          type="number"
                          name="sales_quantity_lag_7"
                          value={formData.sales_quantity_lag_7}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="26.0"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Цена 7 дней назад
                        </label>
                        <input
                          type="number"
                          name="price_lag_7"
                          value={formData.price_lag_7}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="6320.0"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Средние продажи за 3 дня
                        </label>
                        <input
                          type="number"
                          name="sales_quantity_rolling_mean_3"
                          value={formData.sales_quantity_rolling_mean_3}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="7.0"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Средняя цена за 3 дня
                        </label>
                        <input
                          type="number"
                          name="price_rolling_mean_3"
                          value={formData.price_rolling_mean_3}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="7543.0"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Средние продажи за 7 дней
                        </label>
                        <input
                          type="number"
                          name="sales_quantity_rolling_mean_7"
                          value={formData.sales_quantity_rolling_mean_7}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="10.714"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Средняя цена за 7 дней
                        </label>
                        <input
                          type="number"
                          name="price_rolling_mean_7"
                          value={formData.price_rolling_mean_7}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-400 focus:border-indigo-400' 
                            : 'border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'} sm:text-sm transition-colors duration-200`}
                          placeholder="7396.14"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading || !isModelTrained}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${
                  isDarkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  (isLoading || !isModelTrained) ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <RefreshCcw className="h-5 w-5 animate-spin" />
                ) : (
                  'Получить прогноз'
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className={`${isDarkMode ? 'dark:bg-gray-800 dark:text-white' : 'bg-white'} rounded-lg shadow-lg p-6 transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-4">Результаты прогноза</h2>
            {predictionError ? (
              <div className={`${isDarkMode ? 'bg-red-900 border-red-800 text-red-200' : 'bg-red-50 border border-red-200 text-red-800'} rounded-lg p-4 transition-colors duration-200`}>
                <div className="flex items-center">
                  <AlertCircle className={`h-5 w-5 ${isDarkMode ? 'text-red-300' : 'text-red-600'} mr-2`} />
                  <span className="font-medium">{predictionError}</span>
                </div>
              </div>
            ) : prediction ? (
              <div className="space-y-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 transition-colors duration-200 border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart3 className={`h-5 w-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <span className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Прогноз цены через неделю
                      </span>
                    </div>
                    <span className={`text-lg font-semibold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {prediction.predicted_price.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 transition-colors duration-200 border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart3 className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Средний прогноз продаж за день
                      </span>
                    </div>
                    <span className={`text-lg font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {(prediction.predicted_sales / 7).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} шт.
                    </span>
                  </div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 transition-colors duration-200 border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart3 className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Общий прогноз продаж за неделю
                      </span>
                    </div>
                    <span className={`text-lg font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {prediction.predicted_sales.toLocaleString('ru-RU')} шт.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center h-64 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <AlertCircle className="h-12 w-12 mb-2" />
                <p>Заполните форму для получения прогноза</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;