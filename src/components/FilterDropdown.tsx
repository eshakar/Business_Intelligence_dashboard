import React, { useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { FilterOption } from '../types/dashboard';
import { formatNumber } from '../utils/dataGenerator';

interface FilterDropdownProps {
  column: string;
  label: string;
  selectedValues: (string | number)[];
  options: FilterOption[];
  searchTerm: string;
  isOpen: boolean;
  onSelectionChange: (values: (string | number)[]) => void;
  onSearchChange: (searchTerm: string) => void;
  onToggle: () => void;
}

export function FilterDropdown({
  column,
  label,
  selectedValues,
  options,
  searchTerm,
  isOpen,
  onSelectionChange,
  onSearchChange,
  onToggle,
}: FilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleOption = (value: string | number) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    onSelectionChange(newSelection);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return label;
    if (selectedValues.length === 1) return `${label}: ${selectedValues[0]}`;
    return `${label} (${selectedValues.length})`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`
          flex items-center justify-between w-full px-4 py-2 text-left bg-white border rounded-lg shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
          ${selectedValues.length > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <span className={`truncate ${selectedValues.length > 0 ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
          {getDisplayText()}
        </span>
        <div className="flex items-center space-x-2">
          {selectedValues.length > 0 && (
            <button
              onClick={handleClearSelection}
              className="p-1 hover:bg-blue-200 rounded-full transition-colors duration-150"
              title="Clear selection"
            >
              <X className="h-3 w-3 text-blue-600" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No options found</div>
            ) : (
              options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleToggleOption(option.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">{option.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {formatNumber(option.count)}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}