import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';

// Mock the data generator
jest.mock('../utils/dataGenerator', () => ({
  generateSampleData: jest.fn(() => [
    { id: '1', number: 100, mod350: 100, mod8000: 100, mod20002: 100 },
    { id: '2', number: 200, mod350: 200, mod8000: 200, mod20002: 200 },
  ]),
  calculateFilterOptions: jest.fn(() => [
    { value: 100, label: '100', count: 1 },
    { value: 200, label: '200', count: 1 },
  ]),
  applyFilters: jest.fn((data, filters) => {
    if (Object.keys(filters).length === 0) return data;
    return data.filter(row => 
      Object.entries(filters).every(([column, values]) => 
        values.includes(row[column])
      )
    );
  }),
}));

function TestComponent() {
  const dashboard = useDashboard();
  
  return (
    <div>
      <div data-testid="data-count">{dashboard.data.length}</div>
      <div data-testid="filtered-count">{dashboard.filterState.filteredData.length}</div>
      <button 
        onClick={() => dashboard.updateFilter('number', [100])}
        data-testid="apply-filter"
      >
        Apply Filter
      </button>
      <button 
        onClick={() => dashboard.clearAllFilters()}
        data-testid="clear-filters"
      >
        Clear Filters
      </button>
    </div>
  );
}

describe('DashboardContext', () => {
  it('should provide dashboard data and functions', () => {
    render(
      <DashboardProvider>
        <TestComponent />
      </DashboardProvider>
    );

    expect(screen.getByTestId('data-count')).toHaveTextContent('2');
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');
  });

  it('should update filtered data when filter applied', async () => {
    render(
      <DashboardProvider>
        <TestComponent />
      </DashboardProvider>
    );

    const applyFilterButton = screen.getByTestId('apply-filter');
    
    act(() => {
      applyFilterButton.click();
    });

    // The mock applyFilters should return filtered data
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');
  });

  it('should clear filters when clearAllFilters called', async () => {
    render(
      <DashboardProvider>
        <TestComponent />
      </DashboardProvider>
    );

    const applyFilterButton = screen.getByTestId('apply-filter');
    const clearFiltersButton = screen.getByTestId('clear-filters');
    
    // Apply filter first
    act(() => {
      applyFilterButton.click();
    });

    // Then clear filters
    act(() => {
      clearFiltersButton.click();
    });

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useDashboard must be used within a DashboardProvider');
    
    consoleSpy.mockRestore();
  });
});