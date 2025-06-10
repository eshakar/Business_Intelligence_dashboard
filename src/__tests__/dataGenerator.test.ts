import { generateSampleData, calculateFilterOptions, applyFilters } from '../utils/dataGenerator';

describe('Data Generator Utils', () => {
  describe('generateSampleData', () => {
    it('should generate small dataset with correct size', () => {
      const data = generateSampleData('small');
      expect(data).toHaveLength(143);
    });

    it('should generate large dataset with correct size', () => {
      const data = generateSampleData('large');
      expect(data).toHaveLength(50001);
    });

    it('should generate data with correct structure', () => {
      const data = generateSampleData('small');
      const firstRow = data[0];
      
      expect(firstRow).toHaveProperty('id');
      expect(firstRow).toHaveProperty('number');
      expect(firstRow).toHaveProperty('mod20002');
      expect(firstRow).toHaveProperty('mod350');
      expect(firstRow).toHaveProperty('mod8000');
      
      expect(typeof firstRow.number).toBe('number');
      expect(typeof firstRow.mod20002).toBe('number');
      expect(typeof firstRow.mod350).toBe('number');
      expect(typeof firstRow.mod8000).toBe('number');
    });

    it('should generate correct modulo values', () => {
      const data = generateSampleData('small');
      
      data.forEach(row => {
        expect(row.mod20002).toBe(row.number % 20002);
        expect(row.mod350).toBe(row.number % 350);
        expect(row.mod8000).toBe(row.number % 8000);
      });
    });
  });

  describe('calculateFilterOptions', () => {
    const mockData = [
      { id: '1', number: 100, mod350: 100, mod8000: 100, mod20002: 100 },
      { id: '2', number: 200, mod350: 200, mod8000: 200, mod20002: 200 },
      { id: '3', number: 100, mod350: 100, mod8000: 100, mod20002: 100 },
    ];

    it('should calculate correct value counts', () => {
      const options = calculateFilterOptions(mockData, 'number');
      
      expect(options).toHaveLength(2);
      expect(options.find(opt => opt.value === 100)?.count).toBe(2);
      expect(options.find(opt => opt.value === 200)?.count).toBe(1);
    });

    it('should filter options by search term', () => {
      const options = calculateFilterOptions(mockData, 'number', '10');
      
      expect(options).toHaveLength(1);
      expect(options[0].value).toBe(100);
    });

    it('should sort numeric values in descending order', () => {
      const options = calculateFilterOptions(mockData, 'number');
      
      expect(options[0].value).toBe(200);
      expect(options[1].value).toBe(100);
    });
  });

  describe('applyFilters', () => {
    const mockData = [
      { id: '1', number: 100, mod350: 50, mod8000: 100, mod20002: 100 },
      { id: '2', number: 200, mod350: 100, mod8000: 200, mod20002: 200 },
      { id: '3', number: 150, mod350: 50, mod8000: 150, mod20002: 150 },
    ];

    it('should return all data when no filters applied', () => {
      const result = applyFilters(mockData, {});
      expect(result).toHaveLength(3);
    });

    it('should filter by single column', () => {
      const result = applyFilters(mockData, { mod350: [50] });
      expect(result).toHaveLength(2);
      expect(result.every(row => row.mod350 === 50)).toBe(true);
    });

    it('should filter by multiple columns', () => {
      const result = applyFilters(mockData, { 
        mod350: [50], 
        number: [100] 
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should handle multiple values in same filter', () => {
      const result = applyFilters(mockData, { number: [100, 200] });
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no matches', () => {
      const result = applyFilters(mockData, { number: [999] });
      expect(result).toHaveLength(0);
    });
  });
});