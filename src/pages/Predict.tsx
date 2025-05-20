import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Brain, BarChart3, RefreshCcw, ChevronDown, ChevronUp, HelpCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { checkModelStatus, trainModels, makePrediction, isAuthenticated } from '../api';
import type { PredictionRequest, PredictionResult } from '../types';

// Field descriptions for tooltips
const fieldDescriptions: Record<string, string> = {
  product_name: "Название продукта. Уникальный идентификатор товара для анализа (например, 'Смартфон Apple iPhone 13'). Обязателен, так как определяет, что именно прогнозируется.",
  category: "Категория продукта (например, 'Электроника', 'Одежда'). Нужна для классификации товара и выбора подходящей модели прогнозирования.",
  current_price: "Текущая цена продукта в рублях. Базовый показатель для анализа динамики цен.",
  region: "Регион анализа (например, 'Москва', 'Санкт-Петербург'). Учитывает региональные особенности спроса и предложения.",
  brand: "Бренд продукта (например, 'Apple', 'Samsung'). Помогает учесть влияние бренда на спрос и цену.",
  stock_level: "Текущий уровень запасов. Показывает доступность товара, что влияет на спрос.",
  customer_rating: "Средняя оценка покупателей (от 0 до 5). Отражает привлекательность товара для потребителей.",
  review_count: "Количество отзывов. Указывает на популярность товара, что коррелирует со спросом.",
  delivery_days: "Среднее время доставки в днях. Влияет на решение о покупке и спрос.",
  is_promo: "Находится ли товар на акции. Акции могут временно увеличивать спрос.",
  competitor_prices: "Цены конкурентов на аналогичный товар. Помогают оценить конкурентоспособность текущей цены.",
  historical_prices: "Исторические цены за последние дни (например, 7 дней). Используются для анализа трендов."
};

const initialFormData: PredictionRequest = {
  // Required fields
  product_name: "",
  category: "",
  current_price: 0,
  region: "",
  
  // Optional fields
  brand: "",
  stock_level: 0,
  customer_rating: 0,
  review_count: 0,
  delivery_days: 0,
  is_promo: false,
  competitor_prices: [],
  historical_prices: []
};

const Predict = () => {
  const [formData, setFormData] = useState<PredictionRequest>(initialFormData);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
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
      
      const result = await makePrediction(formData);
      setPrediction(result);
      toast.success('Прогноз успешно получен');
    } catch (error) {
      toast.error('Ошибка при получении прогноза');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev: PredictionRequest) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              value
    }));
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numbers = value.split(',').map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
    
    setFormData((prev: PredictionRequest) => ({
      ...prev,
      [name]: numbers
    }));
  };

  const renderFieldWithTooltip = (name: string, label: string, required: boolean = false) => (
    <div className="relative">
      <div className="flex items-center">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && '*'}
        </label>
        <div className="group relative ml-1">
          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-500 cursor-help" />
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
            {fieldDescriptions[name]}
          </div>
        </div>
      </div>
    </div>
  );

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
      
      <div className="flex gap-8">
        {/* Form Section */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Форма прогнозирования
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {/* Required Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {renderFieldWithTooltip('product_name', 'Название товара', true)}
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
                    {renderFieldWithTooltip('category', 'Категория', true)}
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
                    {renderFieldWithTooltip('current_price', 'Текущая цена (₽)', true)}
                    <input
                      type="number"
                      name="current_price"
                      id="current_price"
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      value={formData.current_price}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    {renderFieldWithTooltip('region', 'Регион', true)}
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
                </div>

                {/* Optional Fields Toggle */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-indigo-300 dark:hover:bg-gray-600"
                  >
                    {showOptionalFields ? (
                      <>
                        <ChevronUp className="h-5 w-5 mr-2" />
                        Скрыть дополнительные поля
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-5 w-5 mr-2" />
                        Показать дополнительные поля
                      </>
                    )}
                  </button>
                </div>

                {/* Optional Fields */}
                {showOptionalFields && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      {renderFieldWithTooltip('brand', 'Бренд')}
                      <input
                        type="text"
                        name="brand"
                        id="brand"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        value={formData.brand}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      {renderFieldWithTooltip('stock_level', 'Уровень запасов')}
                      <input
                        type="number"
                        name="stock_level"
                        id="stock_level"
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        value={formData.stock_level}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      {renderFieldWithTooltip('customer_rating', 'Рейтинг покупателей (0-5)')}
                      <input
                        type="number"
                        name="customer_rating"
                        id="customer_rating"
                        min="0"
                        max="5"
                        step="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        value={formData.customer_rating}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      {renderFieldWithTooltip('review_count', 'Количество отзывов')}
                      <input
                        type="number"
                        name="review_count"
                        id="review_count"
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        value={formData.review_count}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      {renderFieldWithTooltip('delivery_days', 'Срок доставки (дней)')}
                      <input
                        type="number"
                        name="delivery_days"
                        id="delivery_days"
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        value={formData.delivery_days}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_promo"
                        id="is_promo"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={formData.is_promo}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="is_promo" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Товар на акции
                      </label>
                      <div className="group relative ml-1">
                        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-500 cursor-help" />
                        <div className="absolute left-1/2 transform -translate-x-1/2 -top-2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                          {fieldDescriptions.is_promo}
                        </div>
                      </div>
                    </div>

                    <div>
                      {renderFieldWithTooltip('competitor_prices', 'Цены конкурентов (через запятую)')}
                      <input
                        type="text"
                        name="competitor_prices"
                        id="competitor_prices"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        value={formData.competitor_prices?.join(', ')}
                        onChange={handleArrayInputChange}
                        placeholder="78990, 80990, 79500"
                      />
                    </div>

                    <div>
                      {renderFieldWithTooltip('historical_prices', 'Исторические цены (через запятую)')}
                      <input
                        type="text"
                        name="historical_prices"
                        id="historical_prices"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        value={formData.historical_prices?.join(', ')}
                        onChange={handleArrayInputChange}
                        placeholder="79990, 79990, 80990, 79990, 78990"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                  >
                    {isLoading ? 'Получение прогноза...' : 'Получить прогноз'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {prediction && (
          <div className="w-96">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden sticky top-8">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Результаты прогноза
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="space-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Прогнозируемая цена</dt>
                    <dd className="mt-1 flex items-center text-2xl font-semibold">
                      <span className={prediction.predicted_price > formData.current_price ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {prediction.predicted_price.toLocaleString('ru-RU')} ₽
                      </span>
                      {prediction.predicted_price > formData.current_price ? (
                        <TrendingUp className="ml-2 h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="ml-2 h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Прогнозируемый рост спроса</dt>
                    <dd className="mt-1 flex items-center text-2xl font-semibold">
                      <span className={prediction.demand_growth_percentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {prediction.demand_growth_percentage > 0 ? '+' : ''}{prediction.demand_growth_percentage}%
                      </span>
                      {prediction.demand_growth_percentage > 0 ? (
                        <TrendingUp className="ml-2 h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="ml-2 h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Доверительный интервал</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-white">
                      {prediction.confidence_interval[0].toLocaleString('ru-RU')} ₽ - {prediction.confidence_interval[1].toLocaleString('ru-RU')} ₽
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Рекомендации</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-white">
                      {prediction.recommendations}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>

      {predictionError && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Ошибка прогноза
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{predictionError}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predict; 