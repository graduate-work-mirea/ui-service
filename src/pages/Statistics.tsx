import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getUserStatistics, isAuthenticated } from '../api';
import type { UserStatistics, PredictionRequest, PredictionRequestMinimal } from '../types';
import { TrendingUp, TrendingDown, Package, Star, Truck, Tag, DollarSign, BarChart2 } from 'lucide-react';

const Statistics = () => {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    fetchStatistics();
  }, [navigate]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserStatistics();
      setStats(data);
    } catch (error) {
      setError('Ошибка при загрузке статистики');
      toast.error('Ошибка при загрузке статистики');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">История прогнозов</h1>
        <div className="bg-white dark:bg-gray-800 rounded-md shadow p-6 text-center">
          <p className="text-gray-700 dark:text-gray-300">Не удалось загрузить историю прогнозов</p>
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={fetchStatistics}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              Повторить попытку
            </button>
            <button
              onClick={() => navigate('/predict')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
            >
              Создать прогноз
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stats.predictions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">История прогнозов</h1>
        <div className="bg-white dark:bg-gray-800 rounded-md shadow p-6 text-center">
          <p className="text-gray-700 dark:text-gray-300">У вас пока нет истории прогнозов</p>
          <button
            onClick={() => navigate('/predict')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            Создать прогноз
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">История прогнозов</h1>
      
      <div className="space-y-6">
        {stats.predictions.map((prediction) => (
          <div key={prediction.id} className="bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Прогноз от {formatDate(prediction.created_at)}
              </h3>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Parameters */}
                <div>
                  <h4 className="text-md font-semibold mb-4 text-gray-700 dark:text-gray-300">Параметры запроса</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Товар:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{prediction.request.product_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Категория:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{prediction.request.category}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Текущая цена:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{formatPrice(prediction.request.current_price)}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Рейтинг:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{prediction.request.customer_rating} ({prediction.request.review_count} отзывов)</span>
                    </div>
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Срок доставки:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{prediction.request.delivery_days} дней</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Остаток на складе:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{prediction.request.stock_level} шт.</span>
                    </div>
                  </div>
                </div>

                {/* Prediction Results */}
                <div>
                  <h4 className="text-md font-semibold mb-4 text-gray-700 dark:text-gray-300">Результаты прогноза</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Прогнозируемая цена</span>
                        <div className="flex items-center">
                          <span className={`text-xl font-bold ${
                            prediction.result.predicted_price > prediction.request.current_price 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatPrice(prediction.result.predicted_price)}
                          </span>
                          {prediction.result.predicted_price > prediction.request.current_price ? (
                            <TrendingUp className="ml-2 h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="ml-2 h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Прогнозируемый рост спроса</span>
                        <div className="flex items-center">
                          <span className={`text-xl font-bold ${
                            prediction.result.demand_growth_percentage > 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {prediction.result.demand_growth_percentage > 0 ? '+' : ''}
                            {prediction.result.demand_growth_percentage}%
                          </span>
                          {prediction.result.demand_growth_percentage > 0 ? (
                            <TrendingUp className="ml-2 h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="ml-2 h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Доверительный интервал</span>
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {formatPrice(prediction.result.confidence_interval[0])} - {formatPrice(prediction.result.confidence_interval[1])}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start">
                        <BarChart2 className="h-5 w-5 text-gray-400 mr-2 mt-1" />
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block mb-1">Рекомендации</span>
                          <span className="text-gray-900 dark:text-white">{prediction.result.recommendations}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics; 