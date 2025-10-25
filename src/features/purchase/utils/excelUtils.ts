import * as XLSX from 'xlsx';

export interface ExcelLineItem {
  model: string;
  make: string;
  category: string;
  subCategory: string;
  uom: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Generates and downloads an Excel template for line items
 */
export const downloadExcelTemplate = () => {
  // Define template headers
  const headers = [
    'Model *',
    'Make',
    'Category',
    'Sub Category',
    'UOM',
    'Description',
    'Quantity *',
    'Unit Price'
  ];

  // Create sample data row to show format
  const sampleData = [
    'Laptop Dell Latitude 5420',
    'Dell',
    'Electronics',
    'Laptops',
    'Piece',
    'Dell Latitude 5420 14" FHD i5-1145G7 8GB 256GB SSD',
    '10',
    '45000.00'
  ];

  // Instructions row
  const instructions = [
    'Enter the model name (search will happen based on this)',
    'Will be auto-filled if model is found',
    'Will be auto-filled if model is found',
    'Will be auto-filled if model is found',
    'Will be auto-filled if model is found',
    'Optional description or specifications',
    'Number of units required',
    'Price per unit'
  ];

  // Create worksheet data
  const wsData = [
    headers,
    instructions,
    [], // Empty row for separation
    sampleData,
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 35 }, // Model
    { wch: 15 }, // Make
    { wch: 20 }, // Category
    { wch: 20 }, // Sub Category
    { wch: 10 }, // UOM
    { wch: 50 }, // Description
    { wch: 10 }, // Quantity
    { wch: 12 }, // Unit Price
  ];

  // Style the header row (bold)
  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'E7E6E6' } },
    };
  }

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Line Items Template');

  // Add instructions sheet
  const instructionsWs = XLSX.utils.aoa_to_sheet([
    ['Purchase Request Line Items - Upload Instructions'],
    [],
    ['How to use this template:'],
    ['1. Fill in the required fields marked with * (asterisk)'],
    ['2. Model field is mandatory - this will be used to search for the item in the system'],
    ['3. If the model is found in the system, Make, Category, Sub Category, and UOM will be auto-filled'],
    ['4. If the model is not found, you need to manually enter all fields'],
    ['5. Quantity is mandatory numeric field'],
    ['6. Unit Price is optional and can be left blank or set to 0'],
    ['7. Description is optional but recommended for clarity'],
    ['8. Delete the sample row and instruction row before adding your data'],
    ['9. You can add as many rows as needed'],
    ['10. Save the file and upload it in the application'],
    [],
    ['Field Descriptions:'],
    ['Model: Item model/name that exists in the master data'],
    ['Make: Manufacturer or brand name'],
    ['Category: Item category (e.g., Electronics, Furniture)'],
    ['Sub Category: Item sub-category (e.g., Laptops, Desks)'],
    ['UOM: Unit of Measure (e.g., Piece, Box, KG)'],
    ['Description: Additional details or specifications'],
    ['Quantity: Number of units to purchase (must be > 0)'],
    ['Unit Price: Price per unit (optional, can be blank or 0)'],
  ]);

  instructionsWs['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

  // Generate Excel file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `PR_LineItems_Template_${timestamp}.xlsx`);
};

/**
 * Parses an uploaded Excel file and extracts line items
 */
export const parseExcelFile = (file: File): Promise<ExcelLineItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        // Read workbook
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: [
            'model',
            'make',
            'category',
            'subCategory',
            'uom',
            'description',
            'quantity',
            'unitPrice',
          ],
          defval: '',
          range: 3, // Skip first 3 rows (header, instructions, empty row)
        });

        // Filter out empty rows and map to ExcelLineItem
        const lineItems: ExcelLineItem[] = jsonData
          .filter((row) => {
            // Skip if model is empty or is the header text
            return row.model &&
                   row.model.trim() !== '' &&
                   !row.model.toString().toLowerCase().includes('model');
          })
          .map((row) => ({
            model: String(row.model || '').trim(),
            make: String(row.make || '').trim(),
            category: String(row.category || '').trim(),
            subCategory: String(row.subCategory || '').trim(),
            uom: String(row.uom || '').trim(),
            description: String(row.description || '').trim(),
            quantity: parseFloat(row.quantity) || 0,
            unitPrice: parseFloat(row.unitPrice) || 0,
          }));

        resolve(lineItems);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Validates parsed line items
 */
export const validateLineItems = (items: ExcelLineItem[]): {
  valid: boolean;
  errors: string[]
} => {
  const errors: string[] = [];

  if (items.length === 0) {
    errors.push('No valid line items found in the Excel file');
    return { valid: false, errors };
  }

  items.forEach((item, index) => {
    const rowNumber = index + 4; // Adjust for header and instruction rows

    if (!item.model || item.model.trim() === '') {
      errors.push(`Row ${rowNumber}: Model is required`);
    }

    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Row ${rowNumber}: Quantity must be greater than 0`);
    }

    if (isNaN(item.quantity)) {
      errors.push(`Row ${rowNumber}: Quantity must be a valid number`);
    }

    // Unit price is optional, but if provided, it must be a valid number
    if (item.unitPrice && isNaN(item.unitPrice)) {
      errors.push(`Row ${rowNumber}: Unit price must be a valid number`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};
