import * as XLSX from 'xlsx';
import type {
  PRReport,
  InvoiceReport,
  ThreeWayMatchReport,
  VendorReport,
  POReport,
  GRNReport,
  FloatRFPReport,
  SubmittedRFPReport,
} from '../types';

/**
 * Export PR Report to Excel
 */
export const exportPRReportToExcel = (
  data: PRReport[],
  filename = 'PR_Report.xlsx'
) => {
  const worksheetData = data.map((item, index) => ({
    'S No.': index + 1,
    'PR No.': item.prNumber,
    'PR Date': item.prDate,
    'Requested By': item.requestedByName || item.requestedBy,
    'Item Name': item.itemName,
    'Status of RM': item.statusOfRM,
    Quantity: item.quantity,
    'Approx Unit Price': item.approxUnitPrice,
    Department: item.department,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PR Report');
  XLSX.writeFile(workbook, filename);
};

/**
 * Export Invoice Report to Excel
 */
export const exportInvoiceReportToExcel = (
  data: InvoiceReport[],
  filename = 'Invoice_Report.xlsx'
) => {
  const worksheetData = data.map((item, index) => ({
    'S No.': index + 1,
    'Invoice No.': item.invoiceNumber,
    'Invoice Date': item.invoiceDate,
    'PO No.': item.poNumber,
    'PO Date': item.poDate,
    'Asset Name': item.assetName,
    Manufacturer: item.manufacturer,
    'Vendor Name': item.vendorName,
    Quantity: item.quantity,
    'Unit Price': item.unitPrice,
    'Total Cost': item.totalCost,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice Report');
  XLSX.writeFile(workbook, filename);
};

/**
 * Export Three Way Match Report to Excel
 */
export const exportThreeWayMatchReportToExcel = (
  data: ThreeWayMatchReport[],
  filename = 'Three_Way_Match_Report.xlsx'
) => {
  const worksheetData = data.map((item, index) => ({
    'S No.': index + 1,
    'PO No.': item.poNumber,
    'PO Date': item.poDate,
    'PO Value': item.poValue,
    'Invoice Value': item.invoiceValue,
    'Payment Value': item.paymentValue,
    'Remaining Amount': item.remainingAmount,
    Status: item.threeWayStatus,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Three Way Match');
  XLSX.writeFile(workbook, filename);
};

/**
 * Export Vendor Report to Excel
 */
export const exportVendorReportToExcel = (
  data: VendorReport[],
  filename = 'Vendor_Report.xlsx'
) => {
  const worksheetData = data.map((item, index) => ({
    'S No.': index + 1,
    'Vendor Name': item.vendorName,
    'Vendor Code': item.vendorCode,
    Address: item.address || '--',
    URL: item.url || '--',
    Phone: item.phoneNumber || '--',
    PAN: item.panNumber || '--',
    Contact: item.contactName || '--',
    'Total Invoice Amount': item.totalInvoiceAmount,
    'Total Payment Amount': item.totalPaymentAmount,
    'Remaining Amount': item.remainingAmount,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor Report');
  XLSX.writeFile(workbook, filename);
};

/**
 * Export PO Report to Excel
 */
export const exportPOReportToExcel = (
  data: POReport[],
  filename = 'PO_Report.xlsx'
) => {
  const worksheetData = data.map((item, index) => ({
    'S No.': index + 1,
    'PO Number': item.poNumber,
    'PO Date': item.poDate,
    'Vendor Name': item.vendorName,
    'Vendor Code': item.vendorCode,
    'PR Number': item.prNumber || '--',
    Status: item.status,
    'Total Amount': item.totalAmount,
    'Created By': item.createdByName || item.createdBy,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PO Report');
  XLSX.writeFile(workbook, filename);
};

/**
 * Export GRN Report to Excel
 */
export const exportGRNReportToExcel = (
  data: GRNReport[],
  filename = 'GRN_Report.xlsx'
) => {
  const worksheetData = data.map((item, index) => ({
    'S No.': index + 1,
    'GRN Number': item.grnNumber,
    'GRN Date': item.grnDate,
    'PO Number': item.poNumber,
    'Invoice Number': item.invoiceNumber,
    'Invoice Date': item.invoiceDate,
    'Vendor Name': item.vendorName,
    'Vendor Code': item.vendorCode,
    Status: item.status,
    'Total Received Value': item.totalReceivedValue,
    'Received By': item.receivedByName || item.receivedBy,
    'Quality Check Status': item.qualityCheckStatus || '--',
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'GRN Report');
  XLSX.writeFile(workbook, filename);
};

/**
 * Export Float RFP Report to Excel
 */
export const exportFloatRFPReportToExcel = (
  data: FloatRFPReport[],
  filename = 'Float_RFP_Report.xlsx'
) => {
  const worksheetData = data.map((item, index) => ({
    'S No.': index + 1,
    'RFQ No.': item.rfqNumber,
    'RFQ Date': item.rfqDate,
    'Vendor Name': item.vendorName,
    'Item Name': item.itemName,
    Quantity: item.quantity,
    'Unit Price': item.unitPrice,
    'Total Price': item.totalPrice,
    'Valid Till': item.validTillDate,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Float RFP Report');
  XLSX.writeFile(workbook, filename);
};

/**
 * Export Submitted RFP Report to Excel
 */
export const exportSubmittedRFPReportToExcel = (
  data: SubmittedRFPReport[],
  filename = 'Submitted_RFP_Report.xlsx'
) => {
  const worksheetData = data.map((item, index) => ({
    'S No.': index + 1,
    'Quotation No.': item.quotationNumber,
    'Quotation Date': item.quotationDate,
    'Vendor Name': item.vendorName,
    'Item Name': item.itemName,
    Quantity: item.quantity,
    'Unit Price': item.unitPrice,
    'Tax 1': item.tax1Name,
    'Tax 2': item.tax2Name,
    'Tax Value 1': item.tax1Value,
    'Tax Value 2': item.tax2Value,
    'Total Price': item.totalPrice,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Submitted RFP Report');
  XLSX.writeFile(workbook, filename);
};
