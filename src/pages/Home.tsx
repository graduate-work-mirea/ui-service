import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, BarChart3, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { getTopProducts } from '../api';
import type { TopProduct } from '../types';

const Home = () => {
  const [topProducts, setTopProducts] = useState<{ top_demand_growth: TopProduct[], top_price_increase: TopProduct[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const data = await getTopProducts();
        setTopProducts(data);
      } catch (error) {
        console.error('Error fetching top products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  const renderProductCard = (product: TopProduct, index: number) => {
    const priceChange = ((product.predicted_price - product.current_price) / product.current_price) * 100;
    
    return (
      <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {index + 1}. {product.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>{product.brand}</span>
              <span>•</span>
              <span>{product.category}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Текущая цена</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {product.current_price.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Прогноз цены</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {product.predicted_price.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end ml-4 space-y-4">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Изменение цены</span>
              <div className="flex items-center">
                {priceChange > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
                )}
                <span className={`text-lg font-semibold ${priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>{priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Рост спроса</span>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                <span className="text-lg font-semibold text-green-500">+{product.demand_growth_percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Brain className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
            Аналитика рынка
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
            onClick={() => navigate('/predict')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            Сделать прогноз
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Demand Growth */}
        <div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Топ товаров по росту спроса
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Товары с наибольшим прогнозируемым ростом спроса
              </p>
            </div>
            <div className="p-4 space-y-4">
              {topProducts?.top_demand_growth.map((product, index) => renderProductCard(product, index))}
            </div>
          </div>
        </div>

        {/* Top Price Increase */}
        <div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Топ товаров по росту цены
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Товары с наибольшим прогнозируемым ростом цены
              </p>
            </div>
            <div className="p-4 space-y-4">
              {topProducts?.top_price_increase.map((product, index) => renderProductCard(product, index))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 