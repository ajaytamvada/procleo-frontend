/**
 * The fields/documents a reviewer can request a supplier to complete.
 * `key` is sent to the backend (stored in requestedInfoFields, comma-separated);
 * `label` is shown to both reviewer and supplier.
 */
export interface OnboardingFieldOption {
  key: string;
  label: string;
  group: 'Company details' | 'Statutory' | 'Documents';
}

export const ONBOARDING_FIELD_OPTIONS: OnboardingFieldOption[] = [
  // Company details
  { key: 'address1', label: 'Registered address', group: 'Company details' },
  { key: 'state', label: 'State', group: 'Company details' },
  { key: 'pinCode', label: 'Pin code', group: 'Company details' },
  { key: 'phone', label: 'Telephone', group: 'Company details' },
  { key: 'mobileNo', label: 'Mobile number', group: 'Company details' },
  { key: 'webLink', label: 'Website', group: 'Company details' },
  { key: 'industry', label: 'Industry', group: 'Company details' },
  {
    key: 'businessDescription',
    label: 'Business description',
    group: 'Company details',
  },
  {
    key: 'contactPhone',
    label: 'Contact person phone',
    group: 'Company details',
  },
  // Statutory identifiers
  { key: 'gst', label: 'GSTIN', group: 'Statutory' },
  { key: 'pan', label: 'PAN', group: 'Statutory' },
  { key: 'cin', label: 'CIN', group: 'Statutory' },
  { key: 'dunsNo', label: 'DUNS number', group: 'Statutory' },
  // Documents
  { key: 'gstFilePath', label: 'GST certificate', group: 'Documents' },
  { key: 'panFilePath', label: 'PAN card', group: 'Documents' },
  { key: 'tdsFilePath', label: 'TDS declaration', group: 'Documents' },
  { key: 'msmeFilePath', label: 'MSME declaration', group: 'Documents' },
  { key: 'isoFilePath', label: 'ISO certificate', group: 'Documents' },
  {
    key: 'incorporationFilePath',
    label: 'Incorporation certificate',
    group: 'Documents',
  },
];

const LABEL_BY_KEY: Record<string, string> = ONBOARDING_FIELD_OPTIONS.reduce(
  (acc, o) => {
    acc[o.key] = o.label;
    return acc;
  },
  {} as Record<string, string>
);

/** Human label for a stored field key (falls back to the key itself). */
export const labelForField = (key: string): string => LABEL_BY_KEY[key] || key;

export type OnboardingStatus =
  | 'PENDING_REVIEW'
  | 'INFO_REQUESTED'
  | 'APPROVED'
  | 'REJECTED';

export const STATUS_META: Record<
  OnboardingStatus,
  { label: string; className: string }
> = {
  PENDING_REVIEW: {
    label: 'Pending Review',
    className: 'bg-amber-100 text-amber-700',
  },
  INFO_REQUESTED: {
    label: 'Info Requested',
    className: 'bg-blue-100 text-blue-700',
  },
  APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};
