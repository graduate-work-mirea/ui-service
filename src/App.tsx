import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Brain, BarChart3, RefreshCcw, AlertCircle } from 'lucide-react';
import { checkModelStatus, trainModels, makePrediction } from './api';
import type { PredictionRequest, PredictionResult } from './types';

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

function App() {
  const [formData, setFormData] = useState<PredictionRequest>(initialFormData);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkModelTrainingStatus();
  }, []);

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
      toast.success('Модель успешно обучена');
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Система прогнозирования спроса
              </h1>
            </div>
            <button
              onClick={handleTrainModel}
              disabled={isLoading}
              className={`flex items-center px-4 py-2 rounded-md text-white ${
                isModelTrained ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
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
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Параметры прогноза</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Название продукта
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Бренд
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Категория
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Регион
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Продавец
                  </label>
                  <input
                    type="text"
                    name="seller"
                    value={formData.seller}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Цена
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Исходная цена
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Процент скидки
                  </label>
                  <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Уровень запасов
                  </label>
                  <input
                    type="number"
                    name="stock_level"
                    value={formData.stock_level}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Рейтинг покупателей
                  </label>
                  <input
                    type="number"
                    name="customer_rating"
                    value={formData.customer_rating}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Количество отзывов
                  </label>
                  <input
                    type="number"
                    name="review_count"
                    value={formData.review_count}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Дни доставки
                  </label>
                  <input
                    type="number"
                    name="delivery_days"
                    value={formData.delivery_days}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_weekend"
                    checked={formData.is_weekend}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">
                    Выходной день
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_holiday"
                    checked={formData.is_holiday}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">
                    Праздничный день
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    День недели (0-6)
                  </label>
                  <input
                    type="number"
                    name="day_of_week"
                    value={formData.day_of_week}
                    onChange={handleInputChange}
                    min="0"
                    max="6"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Месяц (1-12)
                  </label>
                  <input
                    type="number"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    min="1"
                    max="12"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Квартал (1-4)
                  </label>
                  <input
                    type="number"
                    name="quarter"
                    value={formData.quarter}
                    onChange={handleInputChange}
                    min="1"
                    max="4"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-md font-medium mb-3">Исторические данные</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Продажи 1 день назад
                    </label>
                    <input
                      type="number"
                      name="sales_quantity_lag_1"
                      value={formData.sales_quantity_lag_1}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Цена 1 день назад
                    </label>
                    <input
                      type="number"
                      name="price_lag_1"
                      value={formData.price_lag_1}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Продажи 3 дня назад
                    </label>
                    <input
                      type="number"
                      name="sales_quantity_lag_3"
                      value={formData.sales_quantity_lag_3}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Цена 3 дня назад
                    </label>
                    <input
                      type="number"
                      name="price_lag_3"
                      value={formData.price_lag_3}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Продажи 7 дней назад
                    </label>
                    <input
                      type="number"
                      name="sales_quantity_lag_7"
                      value={formData.sales_quantity_lag_7}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Цена 7 дней назад
                    </label>
                    <input
                      type="number"
                      name="price_lag_7"
                      value={formData.price_lag_7}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Средние продажи за 3 дня
                    </label>
                    <input
                      type="number"
                      name="sales_quantity_rolling_mean_3"
                      value={formData.sales_quantity_rolling_mean_3}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Средняя цена за 3 дня
                    </label>
                    <input
                      type="number"
                      name="price_rolling_mean_3"
                      value={formData.price_rolling_mean_3}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Средние продажи за 7 дней
                    </label>
                    <input
                      type="number"
                      name="sales_quantity_rolling_mean_7"
                      value={formData.sales_quantity_rolling_mean_7}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Средняя цена за 7 дней
                    </label>
                    <input
                      type="number"
                      name="price_rolling_mean_7"
                      value={formData.price_rolling_mean_7}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isModelTrained}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Результаты прогноза</h2>
            {prediction ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Прогноз цены через неделю
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-indigo-600">
                      {prediction.predicted_price.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Прогноз продаж за неделю
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-green-600">
                      {prediction.predicted_sales.toLocaleString('ru-RU')} шт.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
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