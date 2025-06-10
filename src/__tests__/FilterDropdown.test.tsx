import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterDropdown } from '../components/FilterDropdown';

const mockProps = {
  column: 'test',
  label: 'Test Filter',
  selectedValues: [],
  options: [
    { value: 1, label: '1', count: 10 },
    { value: 2, label: '2', count: 5 },
    { value: 3, label: '3', count: 3 },
  ],
  searchTerm: '',
  isOpen: false,
  onSelectionChange: jest.fn(),
  onSearchChange: jest.fn(),
  onToggle: jest.fn(),
};

describe('FilterDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render filter button with label', () => {
    render(<FilterDropdown {...mockProps} />);
    expect(screen.getByText('Test Filter')).toBeInTheDocument();
  });

  it('should show selected count when multiple items selected', () => {
    render(<FilterDropdown {...mockProps} selectedValues={[1, 2]} />);
    expect(screen.getByText('Test Filter (2)')).toBeInTheDocument();
  });

  it('should show single selected value', () => {
    render(<FilterDropdown {...mockProps} selectedValues={[1]} />);
    expect(screen.getByText('Test Filter: 1')).toBeInTheDocument();
  });

  it('should call onToggle when button clicked', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...mockProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockProps.onToggle).toHaveBeenCalledTimes(1);
  });

  it('should render dropdown options when open', () => {
    render(<FilterDropdown {...mockProps} isOpen={true} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show option counts', () => {
    render(<FilterDropdown {...mockProps} isOpen={true} />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should call onSelectionChange when option clicked', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...mockProps} isOpen={true} />);
    
    const checkbox = screen.getByRole('checkbox', { name: /1/ });
    await user.click(checkbox);
    
    expect(mockProps.onSelectionChange).toHaveBeenCalledWith([1]);
  });

  it('should handle search input', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...mockProps} isOpen={true} />);
    
    const searchInput = screen.getByPlaceholderText('Type to search...');
    await user.type(searchInput, 'test');
    
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('test');
  });

  it('should show clear button when items selected', () => {
    render(<FilterDropdown {...mockProps} selectedValues={[1]} />);
    expect(screen.getByTitle('Clear selection')).toBeInTheDocument();
  });

  it('should call onSelectionChange with empty array when clear clicked', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...mockProps} selectedValues={[1]} />);
    
    const clearButton = screen.getByTitle('Clear selection');
    await user.click(clearButton);
    
    expect(mockProps.onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('should show "No options found" when no options available', () => {
    render(<FilterDropdown {...mockProps} isOpen={true} options={[]} />);
    expect(screen.getByText('No options found')).toBeInTheDocument();
  });
});