/**
 * Vendor/Supplier types
 */

export interface Vendor {
  id: number;
  name: string;
  code: string;
  legalForm?: string;
  webLink?: string;
  gst?: string;
  pan?: string;
  cin?: string;
  dunsNo?: string;
  industry?: string;
  email?: string;
  businessDescription?: string;
  address1?: string;
  address2?: string;
  pinCode?: string;
  state?: string;
  phone?: string;
  mobileNo?: string;
  countryIds?: string;
  stateIds?: string;
  cityId?: number;
  contactFirstName?: string;
  contactLastName?: string;
  contactDesignation?: string;
  contactPhone?: string;
  contactMobile?: string;
  contactEmail?: string;
  categoryIds?: string;
  subCategoryIds?: string;
  approvalLevel1?: number;
  approvalRemarks?: string;
}

export interface VendorListItem {
  id: number;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  industry?: string;
}
