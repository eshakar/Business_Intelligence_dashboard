import React from 'react';
import { BarChart3, Filter, X } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { FilterDropdown } from './FilterDropdown';
import { DataTable } from './DataTable';
import { DataTableColumn } from '../types/dashboard';

const columns: DataTableColumn[] = [
  { key: 'number', label: 'number', sortable: true },
  { key: 'mod20002', label: 'mod20002', sortable: true },
  { key: 'mod350', label: 'mod350', sortable: true },
  { key: 'mod8000', label: 'mod8000', sortable: true },
];

export function Dashboard() {
  const {
    filterState,
    updateFilter,
    updateFilterSearch,
    toggleFilterDropdown,
    clearAllFilters,
    getFilterOptions,
  } = useDashboard();

  const hasActiveFilters = Object.values(filterState.filters).some(
    filter => filter.selectedValues.length > 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Advanced data filtering and analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Active
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-150"
              >
                <X className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((column) => {
              const filter = filterState.filters[column.key];
              if (!filter) return null;

              return (
                <FilterDropdown
                  key={column.key}
                  column={column.key}
                  label={column.label}
                  selectedValues={filter.selectedValues}
                  options={getFilterOptions(column.key)}
                  searchTerm={filter.searchTerm}
                  isOpen={filter.isOpen}
                  onSelectionChange={(values) => updateFilter(column.key, values)}
                  onSearchChange={(searchTerm) => updateFilterSearch(column.key, searchTerm)}
                  onToggle={() => toggleFilterDropdown(column.key)}
                />
              );
            })}
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">{filterState.totalCount.toLocaleString()}</span> results
              {hasActiveFilters && (
                <span className="text-gray-500"> (filtered)</span>
              )}
            </div>
            {hasActiveFilters && (
              <div className="text-sm text-blue-600">
                {Object.values(filterState.filters).reduce(
                  (count, filter) => count + filter.selectedValues.length,
                  0
                )} filters applied
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <DataTable data={filterState.filteredData} columns={columns} />
      </div>
    </div>
  );
}