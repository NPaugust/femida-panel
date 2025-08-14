'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUser, FaEdit, FaTrash, FaFileCsv, FaPlus, FaFilter, FaEye, FaSearch, FaCalendarAlt, FaPhone, FaIdCard, FaMoneyBillWave, FaChartBar, FaCheckCircle, FaTimesCircle, FaUserPlus, FaBuilding, FaCreditCard } from 'react-icons/fa';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ExportConfirmModal from '../../components/ExportConfirmModal';
import HighlightedText from '../../components/HighlightedText';
import dynamic from 'next/dynamic';
import 'react-phone-input-2/lib/style.css';
import { API_URL, fetchWithAuth } from '../../shared/api';
import { useSearchParams } from 'next/navigation';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, setGuests, addGuest, updateGuest, removeGuest, setGuestsLoading, setGuestsError } from '../store';
import Breadcrumbs from '../../components/Breadcrumbs';
import GuestModal from '../../components/GuestModal';

interface Guest {
  id: number;
  full_name: string;
  inn: string;
  phone: string;
  notes: string;
  registration_date: string;
  total_spent: number;
  visits_count: number;
  status: string;
}

const PhoneInput: any = dynamic(() => import('react-phone-input-2').then(mod => mod.default), { ssr: false });

const GUEST_STATUSES = [
  { value: 'active', label: 'Активный', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Неактивный', color: 'bg-gray-100 text-gray-800' },
  { value: 'vip', label: 'ВИП', color: 'bg-purple-100 text-purple-800' },
  { value: 'blacklist', label: 'Чёрный список', color: 'bg-red-100 text-red-800' },
];



export default function GuestsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const guests = useSelector((state: RootState) => state.guests.guests);
  const loading = useSelector((state: RootState) => state.guests.loading);
  const error = useSelector((state: RootState) => state.guests.error);
  const access = useSelector((state: RootState) => state.auth.access);
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: '',
    spentFrom: '',
    spentTo: '',
  });
  const [selectedGuestIds, setSelectedGuestIds] = useState<number[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | number[] | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const guestsPerPage = 7; // 7 гостей на страницу для раздела Гости
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchGuests();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!access) {
      window.location.href = '/login';
    }
  }, [access]);

  if (!access) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  // Фильтры: закрытие по клику вне
  const filterPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (showFilters && filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    }
    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  // Загрузка гостей через Redux
  const fetchGuests = async () => {
    dispatch(setGuestsLoading(true));
    try {
      if (!access) {
        window.location.href = '/login';
        return;
      }
      const response = await fetchWithAuth(`${API_URL}/api/guests/`, {
        headers: { 'Authorization': `Bearer ${access}` },
      });
      if (response.ok) {
        const data = await response.json();
        dispatch(setGuests(data));
      } else {
        dispatch(setGuestsError('Ошибка загрузки гостей'));
      }
    } catch (error) {
      dispatch(setGuestsError('Ошибка сети'));
    }
    dispatch(setGuestsLoading(false));
  };

  const fetchBookings = async () => {
    try {
      if (!access) return;
      const response = await fetchWithAuth(`${API_URL}/api/bookings/`, {
        headers: { 'Authorization': `Bearer ${access}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch {}
  };

  // Добавление/редактирование гостя через Redux
  const handleSave = (guest: Guest) => {
    if (editingGuest) {
      dispatch(updateGuest(guest));
    } else {
      dispatch(addGuest(guest));
    }
    setShowModal(false);
    setEditingGuest(null);
    setCurrentPage(1);
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setShowModal(true);
  };

  const handleDelete = (guestId: number) => {
    setDeleteTarget(guestId);
    setShowConfirmDelete(true);
  };

  // Удаление гостя через Redux
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (!access) return;
      const ids = Array.isArray(deleteTarget) ? deleteTarget : [deleteTarget];
      await Promise.all(ids.map(id => fetchWithAuth(`${API_URL}/api/guests/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${access}` },
      })));
      ids.forEach(id => dispatch(removeGuest(id)));
      setSelectedGuestIds([]);
    } catch (error) {
      dispatch(setGuestsError('Ошибка при удалении'));
    } finally {
      setDeleteTarget(null);
      setShowConfirmDelete(false);
    }
  };

  const handleSelectGuest = (id: number) => {
    setSelectedGuestIds(prev => 
      prev.includes(id) 
        ? prev.filter(gId => gId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedGuestIds.length === paginatedGuests.length) {
      setSelectedGuestIds([]);
    } else {
      setSelectedGuestIds(paginatedGuests.map(g => g.id));
    }
  };

  const handleMassDelete = () => {
    setDeleteTarget(selectedGuestIds);
    setShowConfirmDelete(true);
  };

  const exportToCSV = () => {
    setShowExportModal(true);
  };

  const handleExportConfirm = () => {
    setExportLoading(true);
    setTimeout(() => {
      const headers = ['ID', 'ФИО', 'ИНН', 'Телефон', 'Статус', 'Посещений', 'Оплачено', 'Дата регистрации'];
      const csvContent = [
        headers.join(','),
        ...filteredGuests.map(guest => [
          guest.id,
          `"${guest.full_name}"`,
          guest.inn,
          guest.phone,
          GUEST_STATUSES.find(s => s.value === guest.status)?.label || guest.status,
          guest.visits_count || 0,
          guest.total_spent || 0,
          guest.registration_date || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `гости_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      setExportLoading(false);
      setShowExportModal(false);
    }, 1000);
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = !filters.search || 
      guest.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      guest.phone.includes(filters.search) ||
      guest.inn.includes(filters.search);
    
    const matchesStatus = !filters.status || guest.status === filters.status;
    
    const spent = guest.total_spent || 0;
    const matchesSpent = (!filters.spentFrom || spent >= parseInt(filters.spentFrom)) &&
                        (!filters.spentTo || spent <= parseInt(filters.spentTo));

    return matchesSearch && matchesStatus && matchesSpent;
  });

  // Пагинация
  const totalPages = Math.ceil(filteredGuests.length / guestsPerPage);
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * guestsPerPage,
    currentPage * guestsPerPage
  );

  const getGuestStatistics = () => {
    const total = guests.length;
    const active = guests.filter(g => g.status === 'active').length;
    const totalBookings = guests.reduce((sum, g) => sum + (g.visits_count || 0), 0);
    
    // Рассчитываем общую сумму оплаченных бронирований
    const totalPaid = bookings
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => {
        let amount = b.total_amount || (b as any).price || b.price_per_night || 0;
        
        // Если это строка, убираем пробелы и конвертируем
        if (typeof amount === 'string') {
          amount = (amount as string).replace(/\s/g, '').replace(',', '.');
        }
        
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        const validAmount = typeof numAmount === 'number' && !isNaN(numAmount) ? numAmount : 0;
        return sum + validAmount;
      }, 0);
    
    return { total, active, totalBookings, totalPaid };
  };

  // Для каждого гостя ищем его бронирования и сумму оплат
  const getGuestBookings = (guestId: number) => bookings.filter(b => 
    (typeof b.guest === 'object' ? b.guest.id : b.guest) === guestId
  );
  // Удаляю getGuestPaid и total_spent, amount_paid

  // Для карточки 'Забронированных гостей'
  const bookedGuestIds = new Set(
    bookings
      .filter(b => b.status === 'active')
      .map(b => typeof b.guest === 'object' ? b.guest.id : b.guest)
  );
  const bookedGuestsCount = guests.filter(g => bookedGuestIds.has(g.id)).length;

  // Используем totalPaid из статистики

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Загрузка гостей..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="text-red-600 text-2xl" />
          </div>
          <p className="text-red-600 mb-4 text-lg font-medium">{error}</p>
          <Button
            variant="primary"
          onClick={fetchGuests}
            icon={<FaUser />}
        >
          Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  const stats = getGuestStatistics();

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs />
      {/* Верхняя панель */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Гости</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaUser className="text-blue-600" />
              <span>{stats.total} гостей</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={showFilters ? "primary" : "ghost"}
              onClick={() => setShowFilters(!showFilters)}
              icon={<FaFilter />}
              className={showFilters ? "shadow-lg" : ""}
            >
              Фильтры
            </Button>
            
            <Button
              variant="success"
              onClick={exportToCSV}
              icon={<FaFileCsv />}
              className="shadow-lg hover:shadow-xl"
            >
              Экспорт
            </Button>
            
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              icon={<FaPlus />}
              className="shadow-lg hover:shadow-xl"
            >
              <span className="font-bold">Добавить</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FaUser className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-bold">Всего гостей</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-bold">Активных</p>
                <p className="text-3xl font-bold text-green-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-6 border border-orange-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FaCalendarAlt className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-orange-700 font-bold">Забронированных</p>
                <p className="text-3xl font-bold text-orange-900">{bookedGuestsCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 border border-purple-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FaCreditCard className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-bold">Оплачено</p>
                <p className="text-3xl font-bold text-purple-900">{Math.round(stats.totalPaid).toLocaleString()} сом</p>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Контент */}
      <div className="px-6 py-6">
        {paginatedGuests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUser className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Нет гостей</h3>
            <p className="text-gray-500 mb-6 text-lg">
              {filters.search || filters.status || filters.spentFrom
                ? 'Попробуйте изменить фильтры'
                : 'Добавьте первого гостя'
              }
            </p>
            {!filters.search && !filters.status && !filters.spentFrom && (
              <Button
                variant="primary"
                onClick={() => setShowModal(true)}
                icon={<FaPlus />}
                className="shadow-lg hover:shadow-xl"
              >
                Добавить гостя
              </Button>
            )}
          </div>
        ) : (
          <div className='rounded-xl shadow-lg bg-white w-full border border-gray-100 overflow-hidden'>
            <div className="overflow-x-auto">
              <table className='w-full text-sm min-w-[800px]'>
              <thead>
                <tr className='bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700 border-b border-gray-200'>
                  <th className='p-3 text-left '>
                    <input
                      type='checkbox'
                      checked={selectedGuestIds.length === paginatedGuests.length && paginatedGuests.length > 0}
                      onChange={handleSelectAll}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                  </th>
                              <th className='p-3 text-center font-bold'>Гость</th>
            <th className='p-3 text-center font-bold'>ПИН</th>
            <th className='p-3 text-center font-bold'>Контакты</th>
            <th className='p-3 text-center font-bold'>Примечания</th>
            <th className='p-3 text-center font-bold'>Бронирование</th>
            <th className='p-3 text-center font-bold'>Статус</th>
            <th className='p-3 text-center font-bold'>Оплачено</th>
            <th className='p-3 text-center font-bold'>Действия</th>
                </tr>
              </thead>
              <tbody>
                {paginatedGuests.map((guest, idx) => (
                  <tr key={guest.id} className={`transition-all duration-200 border-b border-gray-100 last:border-b-0 ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'} hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 group`}>
                    <td className='p-3 text-left '>
                      <input
                        type='checkbox'
                        checked={selectedGuestIds.includes(guest.id)}
                        onChange={() => handleSelectGuest(guest.id)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                    </td>
                    <td className='p-3 text-center '>
                      <HighlightedText 
                        text={guest.full_name} 
                        searchQuery={filters.search} 
                        className='font-medium text-gray-900' 
                      />
                      <div className='text-xs text-gray-500'>#{guest.id}</div>
                    </td>
                    <td className='p-3 text-center '>
                      <span className='text-sm font-mono'>{guest.inn}</span>
                    </td>
                    <td className='p-3 text-center '>
                      <span className='flex items-center gap-2 text-sm justify-center'>
                        <FaPhone className='text-gray-400' />
                        {guest.phone}
                      </span>
                    </td>
                    <td className='p-3 text-center '>
                      <span className='text-sm text-gray-600 max-w-xs truncate block' title={guest.notes}>
                        {guest.notes || '—'}
                      </span>
                    </td>
                    <td className='p-3 text-center'>
                      {(() => {
                        const guestBookings = bookings.filter(b => 
                          (typeof b.guest === 'object' ? b.guest.id : b.guest) === guest.id
                        );
                        if (guestBookings.length === 0) return 'Не забронирован';
                        
                        // Используем автоматическое определение статуса
                        const now = new Date();
                        const activeBooking = guestBookings.find(b => {
                          const checkIn = new Date(b.check_in);
                          const checkOut = new Date(b.check_out);
                          return now >= checkIn && now <= checkOut;
                        });
                        
                        if (activeBooking) return 'Забронирован';
                        
                        const futureBooking = guestBookings.find(b => {
                          const checkIn = new Date(b.check_in);
                          return now < checkIn;
                        });
                        
                        if (futureBooking) return 'Ожидает заезда';
                        
                        return 'Не забронирован';
                      })()}
                    </td>
                    <td className='p-3 text-center '>
                      <StatusBadge status={guest.status} size="sm" />
                    </td>
                    <td className='p-3 text-center'>
                      <span className='font-medium text-green-600'>
                        {(() => {
                          const guestBookings = bookings.filter(b => 
                            (typeof b.guest === 'object' ? b.guest.id : b.guest) === guest.id
                          );
                          
                          const paidBookings = guestBookings.filter(b => b.payment_status === 'paid');
                          
                          const totalPaid = paidBookings.reduce((sum, b) => {
                            let amount = b.total_amount || (b as any).price || b.price_per_night || 0;
                            
                            // Если это строка, убираем пробелы и конвертируем
                            if (typeof amount === 'string') {
                              amount = (amount as string).replace(/\s/g, '').replace(',', '.');
                            }
                            
                            const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
                            const validAmount = typeof numAmount === 'number' && !isNaN(numAmount) ? numAmount : 0;
                            return sum + validAmount;
                          }, 0);
                          return totalPaid > 0 ? `${Math.round(totalPaid).toLocaleString()} сом` : '0 сом';
                        })()}
                      </span>
                    </td>
                    <td className='p-3 text-center'>
                      <div className='flex items-center gap-2 justify-center'>
                        <button
                          onClick={() => handleEdit(guest)}
                          className='bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg font-semibold flex items-center gap-1 text-xs transition-all duration-200 hover:scale-105 shadow-sm'
                          title='Редактировать'
                        >
                          <FaEdit /> Ред.
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
                          className='bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg font-semibold flex items-center gap-1 text-xs transition-all duration-200 hover:scale-105 shadow-sm'
                          title='Удалить'
                        >
                          <FaTrash /> Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Показано {((currentPage - 1) * guestsPerPage) + 1} - {Math.min(currentPage * guestsPerPage, filteredGuests.length)} из {filteredGuests.length}
              </div>
              {/* Показываем пагинацию только если гостей больше 7 */}
              {filteredGuests.length > 7 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Массовые действия */}
      {selectedGuestIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-4 bg-white shadow-xl rounded-full px-6 py-3 border items-center animate-fade-in">
          <span className="font-semibold text-blue-700">Выбрано: {selectedGuestIds.length}</span>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow flex items-center gap-2"
            onClick={handleMassDelete}
          >
            <FaTrash /> Удалить
          </button>
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow flex items-center gap-2"
            onClick={() => { setSelectedGuestIds([]); }}
          >
            Отмена
          </button>
        </div>
      )}

      {/* Модалка */}
      <GuestModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingGuest(null);
        }}
        onSave={handleSave}
        initial={editingGuest}
        existingGuests={guests}
      />

      {/* Модалка подтверждения удаления */}
      <ConfirmModal
        open={showConfirmDelete}
        title="Удалить гостя?"
        description={
          Array.isArray(deleteTarget) 
            ? `Вы действительно хотите удалить ${deleteTarget.length} гостей? Это действие необратимо.`
            : "Вы действительно хотите удалить этого гостя? Это действие необратимо."
        }
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowConfirmDelete(false);
          setDeleteTarget(null);
        }}
      />

      {/* Модальное окно подтверждения экспорта */}
      <ExportConfirmModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={handleExportConfirm}
        title="Экспорт гостей"
        description={`Экспорт ${filteredGuests.length} гостей в CSV файл`}
        fileName={`гости_${new Date().toISOString().split('T')[0]}.csv`}
        loading={exportLoading}
      />

      {/* Выдвижная панель фильтров */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-xs bg-white shadow-2xl z-50 transition-transform duration-300 ${showFilters ? 'translate-x-0' : 'translate-x-full'}`} style={{minWidth: 320}} ref={filterPanelRef}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Фильтры</h2>
          <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none">×</button>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <label className="font-semibold">Поиск</label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ФИО, телефон, ИНН..."
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          </div>

          <label className="font-semibold">Статус</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Все статусы</option>
            {GUEST_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <label className="font-semibold">Оплачено от</label>
          <input
            type="number"
            value={filters.spentFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, spentFrom: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="От"
          />

          <label className="font-semibold">Оплачено до</label>
          <input
            type="number"
            value={filters.spentTo}
            onChange={(e) => setFilters(prev => ({ ...prev, spentTo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="До"
          />

          <div className="flex gap-2 mt-4">
            <button type="button" onClick={() => setFilters({ search: '', status: '', spentFrom: '', spentTo: '' })} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded font-semibold flex-1">Сбросить</button>
            <button type="button" onClick={() => setShowFilters(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow flex-1">Применить</button>
          </div>
        </div>
      </div>
    </div>
  );
}