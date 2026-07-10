import * as XLSX from 'xlsx';
import type { AssetHistory } from '../types';
import { ASSET_EVENT_LABELS } from '../types';

/** Renders an ISO timestamp as a readable, sortable local string. */
const formatTimestamp = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

/**
 * Export the asset audit trail to Excel. Column order mirrors the on-screen
 * table so an auditor comparing the two sees the same thing.
 */
export const exportAssetTrailToExcel = (
  data: AssetHistory[],
  filename = 'Asset_Audit_Trail.xlsx'
) => {
  const worksheetData = data.map((event, index) => ({
    'S No.': index + 1,
    'Date & Time': formatTimestamp(event.performedDate),
    'Asset Tag': event.assetTag || '',
    'Asset ID': event.assetId,
    Event: ASSET_EVENT_LABELS[event.eventType] || event.eventType,
    'From Status': event.fromStatus || '',
    'To Status': event.toStatus || '',
    'Performed By': event.performedBy || '',
    'Reference Type': event.referenceType || '',
    'Reference No.': event.referenceNumber || '',
    Description: event.description || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 16 },
    { wch: 10 },
    { wch: 22 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 60 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Audit Trail');
  XLSX.writeFile(workbook, filename);
};
