// Master Configuration Types

export interface Company {
  id?: number;
  name: string;
  code?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  tin?: string;
  pan?: string;
  cin?: string;
  cst?: string;
  assetPrefix?: string;
  licenseNumber?: string;
  licenceDate?: string;
  licenseEndDate?: string;
  fileName?: string;
  active?: boolean;
}

export interface Currency {
  id?: number;
  name: string;
  code: string;
  symbol?: string;
  active?: boolean;
  remarks?: string;
}

export interface Department {
  id?: number;
  name: string;
  code: string;
  remarks?: string;
}

export interface UnitOfMeasure {
  id?: number;
  name: string;
  code?: string;
  symbol?: string;
  active?: boolean;
  remarks?: string;
}

export interface FinancialYear {
  id?: number;
  startDate: string;
  endDate: string;
  firstHalfStartDate: string;
  firstHalfEndDate: string;
  secondHalfStartDate: string;
  secondHalfEndDate: string;
  activeYear?: number; // 0 = inactive, 1 = active
  currentYear?: string;
}

export interface Budget {
  id?: number;
  financialYearId: number;
  departmentId: string;
  annualBudget: number;
  // Display fields
  departmentName?: string;
  financialYearDisplay?: string;
}

export interface PaymentTerm {
  id?: number;
  name: string;
}

export interface TermsAndConditions {
  id?: number;
  content: string;
  fileName?: string;
}

// Common types for master configuration
export interface MasterEntityFilters {
  name?: string;
  code?: string;
  active?: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface MasterConfigMenuItem {
  key: string;
  label: string;
  path: string;
  icon?: string;
  description?: string;
}
