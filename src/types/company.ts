/**
 * Company/Organization types
 */

export interface Company {
  id: number;
  name: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  phone?: string;
  fax?: string;
  email?: string;
  tin?: string;
  pan?: string;
  cin?: string;
  cst?: string; // GST number
  assetPrefix?: string;
  licenseNumber?: string;
  licenceDate?: string;
  licenseEndDate?: string;
  fileName?: string; // Logo file path
}
