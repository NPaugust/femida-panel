'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaBuilding, FaBed, FaUser, FaCalendarCheck, FaChartBar, FaCheckCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Breadcrumbs from '../../components/Breadcrumbs';

interface InstructionStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
  linkText?: string;
  important?: boolean;
  tip?: string;
}

export default function InstructionsPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const access = auth.access;

  useEffect(() => {
    if (!access) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [access]);

  const instructions: InstructionStep[] = [
    {
      id: 1,
      title: "Создание здания/корпуса",
      description: "Первым шагом необходимо создать здание или корпус пансионата. Это основа для добавления номеров.",
      icon: <FaBuilding className="text-blue-600" />,
      link: "/buildings",
      linkText: "Перейти в раздел Здания",
      important: true,
      tip: "Укажите точный адрес и описание здания для удобства идентификации"
    },
    {
      id: 2,
      title: "Добавление номеров",
      description: "После создания здания добавьте номера с указанием класса, вместимости и цены за сутки.",
      icon: <FaBed className="text-purple-600" />,
      link: "/rooms",
      linkText: "Перейти в раздел Номера",
      important: true,
      tip: "Установите правильную цену и укажите все удобства номера"
    },
    {
      id: 3,
      title: "Регистрация гостей",
      description: "Зарегистрируйте гостей в системе с полной контактной информацией.",
      icon: <FaUser className="text-green-600" />,
      link: "/guests",
      linkText: "Перейти в раздел Гости",
      important: true,
      tip: "Введите корректные данные гостя для связи в случае необходимости"
    },
    {
      id: 4,
      title: "Создание бронирования",
      description: "Создайте бронирование, выбрав гостя, номер и указав даты заезда/выезда.",
      icon: <FaCalendarCheck className="text-orange-600" />,
      link: "/bookings",
      linkText: "Перейти в раздел Бронирования",
      important: true,
      tip: "Проверьте доступность номера на выбранные даты"
    },
    {
      id: 5,
      title: "Обработка оплаты",
      description: "Отметьте статус оплаты бронирования и выберите способ оплаты.",
      icon: <FaCheckCircle className="text-green-600" />,
      link: "/bookings",
      linkText: "Управление бронированиями",
      tip: "Регулярно обновляйте статус оплаты для точной отчетности"
    },
    {
      id: 6,
      title: "Просмотр отчетов",
      description: "Используйте раздел отчетов для анализа загрузки, доходов и статистики.",
      icon: <FaChartBar className="text-blue-600" />,
      link: "/reports",
      linkText: "Перейти в раздел Отчеты",
      tip: "Экспортируйте отчеты для предоставления руководству"
    },
    {
      id: 7,
      title: "Управление данными",
      description: "Редактируйте информацию о гостях, номерах и бронированиях по необходимости.",
      icon: <FaInfoCircle className="text-gray-600" />,
      tip: "Все изменения сохраняются в истории для аудита"
    },
    {
      id: 8,
      title: "Восстановление данных",
      description: "При необходимости восстановите удаленные данные через раздел Корзина.",
      icon: <FaExclamationTriangle className="text-red-600" />,
      link: "/trash",
      linkText: "Перейти в Корзину",
      tip: "Данные в корзине хранятся ограниченное время"
    }
  ];

  if (!access) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full px-2 md:px-6 xl:px-16 py-0 flex flex-col gap-1">
        <Breadcrumbs />
        
        {/* Заголовок */}
        <div className="flex items-center justify-between bg-gradient-to-r from-white/90 to-blue-50/90 rounded-2xl shadow-lg p-6 mb-6 mt-6 border border-blue-100/50">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Инструкция по админ-панели</h1>
            <p className="text-gray-600">Пошаговое руководство по работе с системой управления пансионатом</p>
          </div>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <FaArrowLeft className="text-sm" />
            Назад
          </Link>
        </div>

        {/* Инструкции */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {instructions.map((step) => (
            <div 
              key={step.id}
              className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                step.important 
                  ? 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white' 
                  : 'border-l-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md ${
                  step.important ? 'ring-2 ring-blue-200' : ''
                }`}>
                  {step.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Шаг {step.id}
                    </span>
                    {step.important && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        Важно
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {step.tip && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <FaInfoCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">
                          <strong>Совет:</strong> {step.tip}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {step.link && step.linkText && (
                    <Link 
                      href={step.link}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                    >
                      {step.linkText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Дополнительная информация */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-green-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaInfoCircle className="text-green-600" />
            Полезные советы
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Безопасность данных</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Регулярно сохраняйте важную информацию</li>
                <li>• Не передавайте доступы третьим лицам</li>
                <li>• Выходите из системы после работы</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Эффективная работа</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Используйте фильтры для быстрого поиска</li>
                <li>• Экспортируйте отчеты для анализа</li>
                <li>• Следите за статусами бронирований</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Контакты поддержки */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-200 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Нужна помощь?</h2>
          <p className="text-gray-600 mb-4">
            Если у вас возникли вопросы по работе с системой, обратитесь к администратору
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
