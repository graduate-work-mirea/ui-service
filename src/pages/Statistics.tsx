import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getUserStatistics, isAuthenticated } from '../api';
import type { UserStatistics } from '../types';

const Statistics = () => {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      const data = await getUserStatistics();
      setStats(data);
    } catch (error) {
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

  if (!stats || stats.predictions.length === 0) {
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Прогноз от {formatDate(prediction.created_at)}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-md ${prediction.minimal ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                  {prediction.minimal ? 'Минимальный режим' : 'Полный режим'}
                </span>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Параметры запроса</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 overflow-auto max-h-96">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(prediction.request, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Результаты прогноза</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Прогноз цены</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(prediction.result.predicted_price)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Прогноз продаж</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {Math.round(prediction.result.predicted_sales)} шт.
                        </p>
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