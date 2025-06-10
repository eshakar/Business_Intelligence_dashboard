import React, { useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { DataRow, DataTableColumn } from '../types/dashboard';

interface DataTableProps {
  data: DataRow[];
  columns: DataTableColumn[];
  pageSize?: number;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function DataTable({ data, columns, pageSize = 100 }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, data.length);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = paginatedData[index];
    const isEven = index % 2 === 0;

    return (
      <div
        style={style}
        className={`flex items-center border-b border-gray-200 ${
          isEven ? 'bg-white' : 'bg-gray-50'
        } hover:bg-blue-50 transition-colors duration-150`}
      >
        <div className="w-12 px-4 py-3 text-sm text-gray-500 font-medium text-center">
          {startIndex + index}.
        </div>
        {columns.map((column) => (
          <div
            key={column.key}
            className="flex-1 px-4 py-3 text-sm text-gray-900"
            style={{ width: column.width }}
          >
            {typeof row[column.key] === 'number'
              ? row[column.key].toLocaleString()
              : String(row[column.key])}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="w-12 px-4 py-3 text-sm font-medium text-gray-600 text-center">
          #
        </div>
        {columns.map((column) => (
          <div
            key={column.key}
            className="flex-1 px-4 py-3"
            style={{ width: column.width }}
          >
            {column.sortable !== false ? (
              <button
                onClick={() => handleSort(column.key)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-150"
              >
                <span>{column.label}</span>
                {getSortIcon(column.key)}
              </button>
            ) : (
              <span className="text-sm font-medium text-gray-700">{column.label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Data rows */}
      <div className="relative">
        {paginatedData.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">No data found</div>
              <div className="text-gray-500 text-sm">Try adjusting your filters</div>
            </div>
          </div>
        ) : (
          <List
            height={Math.min(paginatedData.length * 52, 20 * 52)} // Show max 20 rows
            itemCount={paginatedData.length}
            itemSize={52}
            width="100%"
          >
            {Row}
          </List>
        )}
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-700">
            <span className="font-medium">{startIndex}</span>
            {' - '}
            <span className="font-medium">{endIndex}</span>
            {' / '}
            <span className="font-medium">{data.length.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}