import { useState } from "react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
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

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-muted-foreground">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-green-500/30 rounded hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-green-400"
        >
          Previous
        </button>
        
        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-1 text-sm border rounded ${
              page === currentPage
                ? 'bg-green-500 text-black border-green-500'
                : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
            } ${page === '...' ? 'cursor-default' : ''}`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-green-500/30 rounded hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-green-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  itemsPerPage?: number;
}

export const usePagination = ({ totalItems, initialPage = 1, itemsPerPage = 10 }: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(itemsPerPage);

  const totalPages = Math.ceil(totalItems / currentPageSize);
  const startIndex = (currentPage - 1) * currentPageSize;
  const endIndex = Math.min(startIndex + currentPageSize, totalItems);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const resetPage = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    currentPageSize,
    setCurrentPageSize,
    goToPage,
    nextPage,
    prevPage,
    resetPage
  };
};
