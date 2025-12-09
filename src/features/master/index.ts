// Master Configuration Module Exports

// Main Components
export { default as MasterDashboard } from './components/MasterDashboard';
export { default as MasterConfigurationLayout } from './components/MasterConfigurationLayout';
export { default as MasterConfigurationMenu } from './components/MasterConfigurationMenu';

// Types - Export specific types to avoid conflicts
export type {
  Company,
  Currency,
  Department,
  UnitOfMeasure,
  MasterEntityFilters,
  PagedResponse,
  MasterConfigMenuItem,
} from './types';

// API Hooks
export * from './hooks/useCompanyAPI';
export * from './hooks/useDepartmentAPI';
export * from './hooks/useCurrencyAPI';
export * from './hooks/useLocationAPI';
export * from './hooks/useUOMAPI';
export * from './hooks/useTaxAPI';
export * from './hooks/useDesignationAPI';
export * from './hooks/useCostCenterAPI';
export * from './hooks/useBuildingAPI';
export * from './hooks/useCountryAPI';
export * from './hooks/useStateAPI';
export * from './hooks/useCityAPI';
export * from './hooks/useFloorAPI';
export * from './hooks/useCategoryAPI';
export * from './hooks/useSubCategoryAPI';
export * from './hooks/useItemAPI';
export * from './hooks/useVendorAPI';
export * from './hooks/useEmployeeAPI';
export * from './hooks/useAssignmentGroupAPI';

// Company Components
export { default as CompanyForm } from './components/company/CompanyForm';
export { default as CompanyPage } from './components/company/CompanyPage';
export { default as CompanyList } from './components/company/CompanyList';

// Currency Components
export { default as CurrencyForm } from './components/currency/CurrencyForm';
export { default as CurrencyPage } from './components/currency/CurrencyPage';
export { default as CurrencyList } from './components/currency/CurrencyList';

// Page Components (Simple implementations)
export { default as DepartmentPage } from './components/departments/DepartmentPage';
export { default as SupplierPage } from './components/suppliers/SupplierPage';
export { default as UOMPage } from './components/uom/UOMPage';
export { default as LocationPage } from './components/locations/LocationPage';
export { default as TaxPage } from './components/tax/TaxPage';
export { default as DesignationPage } from './components/designation/DesignationPage';
export { default as CostCenterPage } from './components/cost-center/CostCenterPage';
export { default as BuildingPage } from './components/building/BuildingPage';
export { default as CountryPage } from './components/country/CountryPage';
export { default as StatePage } from './components/state/StatePage';
export { default as CityPage } from './components/city/CityPage';
export { default as FloorPage } from './components/floor/FloorPage';
export { default as CategoryPage } from './components/category/CategoryPage';
export { default as SubCategoryPage } from './components/subcategory/SubCategoryPage';
export { default as ItemPage } from './components/item/ItemPage';
export { default as EmployeePage } from './components/employee/EmployeePage';
export { default as AssignmentGroupPage } from './components/group/AssignmentGroupPage';
