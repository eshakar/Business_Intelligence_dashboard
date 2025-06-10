import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { DashboardContextType, FilterState, DataRow, ColumnFilter, FilterOption } from '../types/dashboard';
import { generateSampleData, calculateFilterOptions, applyFilters } from '../utils/dataGenerator';

interface DashboardState {
  data: DataRow[];
  filterState: FilterState;
}

type DashboardAction =
  | { type: 'UPDATE_FILTER'; column: string; selectedValues: (string | number)[] }
  | { type: 'UPDATE_FILTER_SEARCH'; column: string; searchTerm: string }
  | { type: 'TOGGLE_FILTER_DROPDOWN'; column: string }
  | { type: 'CLEAR_ALL_FILTERS' }
  | { type: 'SET_DATA'; data: DataRow[] };

const initialFilterState: FilterState = {
  filters: {},
  filteredData: [],
  totalCount: 0,
};

const initialState: DashboardState = {
  data: [],
  filterState: initialFilterState,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_DATA': {
      const filters: Record<string, ColumnFilter> = {};
      const columns = ['number', 'mod20002', 'mod350', 'mod8000'];
      
      columns.forEach(column => {
        filters[column] = {
          column,
          selectedValues: [],
          searchTerm: '',
          isOpen: false,
        };
      });

      return {
        ...state,
        data: action.data,
        filterState: {
          filters,
          filteredData: action.data,
          totalCount: action.data.length,
        },
      };
    }

    case 'UPDATE_FILTER': {
      const newFilters = {
        ...state.filterState.filters,
        [action.column]: {
          ...state.filterState.filters[action.column],
          selectedValues: action.selectedValues,
        },
      };

      const activeFilters = Object.fromEntries(
        Object.entries(newFilters)
          .filter(([, filter]) => filter.selectedValues.length > 0)
          .map(([column, filter]) => [column, filter.selectedValues])
      );

      const filteredData = applyFilters(state.data, activeFilters);

      return {
        ...state,
        filterState: {
          filters: newFilters,
          filteredData,
          totalCount: filteredData.length,
        },
      };
    }

    case 'UPDATE_FILTER_SEARCH': {
      return {
        ...state,
        filterState: {
          ...state.filterState,
          filters: {
            ...state.filterState.filters,
            [action.column]: {
              ...state.filterState.filters[action.column],
              searchTerm: action.searchTerm,
            },
          },
        },
      };
    }

    case 'TOGGLE_FILTER_DROPDOWN': {
      return {
        ...state,
        filterState: {
          ...state.filterState,
          filters: {
            ...state.filterState.filters,
            [action.column]: {
              ...state.filterState.filters[action.column],
              isOpen: !state.filterState.filters[action.column]?.isOpen,
            },
          },
        },
      };
    }

    case 'CLEAR_ALL_FILTERS': {
      const clearedFilters = Object.fromEntries(
        Object.entries(state.filterState.filters).map(([column, filter]) => [
          column,
          { ...filter, selectedValues: [], searchTerm: '', isOpen: false },
        ])
      );

      return {
        ...state,
        filterState: {
          filters: clearedFilters,
          filteredData: state.data,
          totalCount: state.data.length,
        },
      };
    }

    default:
      return state;
  }
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Initialize data on mount
  React.useEffect(() => {
    const data = generateSampleData('small');
    dispatch({ type: 'SET_DATA', data });
  }, []);

  const updateFilter = useCallback((column: string, selectedValues: (string | number)[]) => {
    dispatch({ type: 'UPDATE_FILTER', column, selectedValues });
  }, []);

  const updateFilterSearch = useCallback((column: string, searchTerm: string) => {
    dispatch({ type: 'UPDATE_FILTER_SEARCH', column, searchTerm });
  }, []);

  const toggleFilterDropdown = useCallback((column: string) => {
    dispatch({ type: 'TOGGLE_FILTER_DROPDOWN', column });
  }, []);

  const clearAllFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_FILTERS' });
  }, []);

  const getFilterOptions = useCallback((column: string): FilterOption[] => {
    const filter = state.filterState.filters[column];
    if (!filter) return [];

    // Get data that would be available if this filter wasn't applied
    const otherActiveFilters = Object.fromEntries(
      Object.entries(state.filterState.filters)
        .filter(([col, f]) => col !== column && f.selectedValues.length > 0)
        .map(([col, f]) => [col, f.selectedValues])
    );

    const availableData = applyFilters(state.data, otherActiveFilters);
    return calculateFilterOptions(availableData, column, filter.searchTerm);
  }, [state.data, state.filterState.filters]);

  const value = useMemo<DashboardContextType>(() => ({
    data: state.data,
    filterState: state.filterState,
    updateFilter,
    updateFilterSearch,
    toggleFilterDropdown,
    clearAllFilters,
    getFilterOptions,
  }), [
    state.data,
    state.filterState,
    updateFilter,
    updateFilterSearch,
    toggleFilterDropdown,
    clearAllFilters,
    getFilterOptions,
  ]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}