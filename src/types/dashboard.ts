export interface DataRow {
  id: string;
  number: number;
  mod20002: number;
  mod350: number;
  mod8000: number;
  [key: string]: string | number;
}

export interface FilterOption {
  value: string | number;
  label: string;
  count: number;
  disabled?: boolean;
}

export interface ColumnFilter {
  column: string;
  selectedValues: (string | number)[];
  searchTerm: string;
  isOpen: boolean;
}

export interface FilterState {
  filters: Record<string, ColumnFilter>;
  filteredData: DataRow[];
  totalCount: number;
}

export interface DashboardContextType {
  data: DataRow[];
  filterState: FilterState;
  updateFilter: (column: string, selectedValues: (string | number)[]) => void;
  updateFilterSearch: (column: string, searchTerm: string) => void;
  toggleFilterDropdown: (column: string) => void;
  clearAllFilters: () => void;
  getFilterOptions: (column: string) => FilterOption[];
}

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: number;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}