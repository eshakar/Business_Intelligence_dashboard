import { DataRow } from '../types/dashboard';

export function generateSampleData(size: 'small' | 'large' = 'small'): DataRow[] {
  const count = size === 'small' ? 143 : 50001;
  const data: DataRow[] = [];

  for (let i = 0; i < count; i++) {
    const number = size === 'small' ? 50000 - (i * 350) : 50000 - i;
    
    data.push({
      id: `row-${i}`,
      number,
      mod20002: number % 20002,
      mod350: number % 350,
      mod8000: number % 8000,
    });
  }

  return data;
}

export function calculateFilterOptions(
  data: DataRow[],
  column: string,
  searchTerm: string = ''
): { value: string | number; label: string; count: number }[] {
  const valueCounts = new Map<string | number, number>();

  // Count occurrences of each value
  data.forEach(row => {
    const value = row[column];
    if (value !== undefined && value !== null) {
      valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
    }
  });

  // Convert to options array and filter by search term
  const options = Array.from(valueCounts.entries())
    .map(([value, count]) => ({
      value,
      label: value.toString(),
      count,
    }))
    .filter(option => 
      searchTerm === '' || 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort numerically if both are numbers, otherwise alphabetically
      if (typeof a.value === 'number' && typeof b.value === 'number') {
        return b.value - a.value; // Descending order for numbers
      }
      return a.label.localeCompare(b.label);
    });

  return options;
}

export function applyFilters(data: DataRow[], filters: Record<string, (string | number)[]>): DataRow[] {
  return data.filter(row => {
    return Object.entries(filters).every(([column, selectedValues]) => {
      if (selectedValues.length === 0) return true;
      return selectedValues.includes(row[column]);
    });
  });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}