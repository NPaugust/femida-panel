'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Новая логика пагинации
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Если страниц много, показываем умную пагинацию
      if (currentPage <= 3) {
        // В начале: 1, 2, 3, 4, 5, ..., последняя
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // В конце: 1, ..., предпоследние 5
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // В середине: 1, ..., текущая-1, текущая, текущая+1, ..., последняя
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center gap-1 select-none">
      {/* Кнопка "Первая страница" */}
      <button
        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        title="Первая страница"
      >
        ««
      </button>

      {/* Кнопка "Предыдущая" */}
      <button
        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="Предыдущая страница"
      >
        «
      </button>

      {/* Номера страниц */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span 
              key={`dots-${index}`} 
              className="px-3 py-2 text-gray-400 font-medium"
            >
              ...
            </span>
          );
        }
        
        const pageNumber = page as number;
        const isActive = currentPage === pageNumber;
        
        return (
          <button
            key={`page-${pageNumber}`}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              isActive 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300'
            }`}
            onClick={() => onPageChange(pageNumber)}
            disabled={isActive}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Кнопка "Следующая" */}
      <button
        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="Следующая страница"
      >
        »
      </button>

      {/* Кнопка "Последняя страница" */}
      <button
        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        title="Последняя страница"
      >
        »»
      </button>
    </div>
  );
};

export default Pagination; 