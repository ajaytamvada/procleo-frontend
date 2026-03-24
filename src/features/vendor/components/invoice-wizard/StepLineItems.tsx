import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import InvoiceSummaryCard from './InvoiceSummaryCard';

interface CalculatedItem {
  poItemId: number;
  itemName: string;
  itemCode?: string;
  hsnSacCode?: string;
  uom?: string;
  poQuantity: number;
  remainingQuantity: number;
  invoiceQuantity: number;
  unitPrice: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  otherTaxRate: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxAmount: number;
  totalAmount: number;
  remarks: string;
}

interface OcrLineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  hsnCode?: string;
  unit?: string;
  taxRate?: number;
  taxAmount?: number;
}

interface Totals {
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  taxAmount: number;
  grandTotal: number;
  calculatedItems: CalculatedItem[];
}

interface StepLineItemsProps {
  totals: Totals;
  ocrLineItems?: OcrLineItem[];
  onQuantityChange: (index: number, value: string) => void;
  onItemFieldChange: (
    index: number,
    field: string,
    value: string | number
  ) => void;
}

const StepLineItems: React.FC<StepLineItemsProps> = ({
  totals,
  ocrLineItems,
  onQuantityChange,
  onItemFieldChange,
}) => {
  const inputCls =
    'px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500';
  const fmt = (n: number) =>
    n.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className='space-y-6'>
      {/* PO Line Items */}
      <div className='bg-white border rounded-lg overflow-hidden shadow-sm'>
        <div className='p-4 border-b bg-gray-50 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Package className='w-5 h-5 text-violet-600' />
            <h2 className='text-lg font-semibold text-gray-900'>Line Items</h2>
          </div>
          <div className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
            {totals.calculatedItems.length} items from PO
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase'>
                  Item
                </th>
                <th className='px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase'>
                  HSN/SAC
                </th>
                <th className='px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase'>
                  Unit
                </th>
                <th className='px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase'>
                  Qty
                </th>
                <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                  Rate
                </th>
                <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                  Taxable Value
                </th>
                <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                  CGST%
                </th>
                <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                  CGST
                </th>
                <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                  SGST%
                </th>
                <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                  SGST
                </th>
                <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                  Total
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {totals.calculatedItems.map((item, index) => {
                const disabled = item.remainingQuantity <= 0;
                return (
                  <tr
                    key={item.poItemId}
                    className={
                      disabled ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                    }
                  >
                    <td className='px-3 py-2.5'>
                      <div className='font-medium text-gray-900 text-sm min-w-[120px]'>
                        {item.itemName}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {item.itemCode}
                      </div>
                      <div className='text-xs text-violet-500'>
                        Rem: {item.remainingQuantity}
                      </div>
                    </td>
                    <td className='px-3 py-2.5'>
                      <input
                        type='text'
                        value={item.hsnSacCode || ''}
                        onChange={e =>
                          onItemFieldChange(index, 'hsnSacCode', e.target.value)
                        }
                        className={`w-20 ${inputCls}`}
                        placeholder='HSN'
                        disabled={disabled}
                      />
                    </td>
                    <td className='px-3 py-2.5'>
                      <input
                        type='text'
                        value={item.uom || ''}
                        onChange={e =>
                          onItemFieldChange(index, 'uom', e.target.value)
                        }
                        className={`w-16 text-center ${inputCls}`}
                        placeholder='Unit'
                        disabled={disabled}
                      />
                    </td>
                    <td className='px-3 py-2.5'>
                      <input
                        type='number'
                        value={item.invoiceQuantity}
                        onChange={e => onQuantityChange(index, e.target.value)}
                        className={`w-20 text-center ${inputCls}`}
                        min='0'
                        max={item.remainingQuantity}
                        step='0.01'
                        disabled={disabled}
                      />
                    </td>
                    <td className='px-3 py-2.5'>
                      <input
                        type='number'
                        value={item.unitPrice}
                        onChange={e =>
                          onItemFieldChange(
                            index,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={`w-24 text-right ${inputCls}`}
                        min='0'
                        step='0.01'
                        disabled={disabled}
                      />
                    </td>
                    <td className='px-3 py-2.5 text-right font-medium text-gray-900'>
                      {fmt(item.taxableValue)}
                    </td>
                    <td className='px-3 py-2.5'>
                      <input
                        type='number'
                        value={item.cgstRate}
                        onChange={e =>
                          onItemFieldChange(
                            index,
                            'cgstRate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={`w-16 text-right ${inputCls}`}
                        min='0'
                        max='100'
                        step='0.5'
                        disabled={disabled}
                      />
                    </td>
                    <td className='px-3 py-2.5 text-right text-gray-600'>
                      {fmt(item.cgstAmount)}
                    </td>
                    <td className='px-3 py-2.5'>
                      <input
                        type='number'
                        value={item.sgstRate}
                        onChange={e =>
                          onItemFieldChange(
                            index,
                            'sgstRate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className={`w-16 text-right ${inputCls}`}
                        min='0'
                        max='100'
                        step='0.5'
                        disabled={disabled}
                      />
                    </td>
                    <td className='px-3 py-2.5 text-right text-gray-600'>
                      {fmt(item.sgstAmount)}
                    </td>
                    <td className='px-3 py-2.5 text-right font-bold text-gray-900'>
                      {fmt(item.totalAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scanned Items (Raw OCR Data) */}
      {ocrLineItems && ocrLineItems.length > 0 && (
        <div className='bg-white border rounded-lg overflow-hidden shadow-sm border-orange-200'>
          <div className='p-4 border-b bg-orange-50 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='w-5 h-5 text-orange-600' />
              <h2 className='text-lg font-semibold text-gray-900'>
                Scanned Items (Raw Data)
              </h2>
            </div>
            <div className='text-xs text-orange-800 bg-orange-100 px-2 py-1 rounded'>
              Verify & match manually
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase'>
                    Description
                  </th>
                  <th className='px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase'>
                    HSN/SAC
                  </th>
                  <th className='px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase'>
                    Unit
                  </th>
                  <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                    Qty
                  </th>
                  <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                    Rate
                  </th>
                  <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                    Taxable
                  </th>
                  <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                    Tax%
                  </th>
                  <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                    Tax Amt
                  </th>
                  <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {ocrLineItems.map((item, idx) => {
                  const taxable =
                    item.amount || (item.quantity || 0) * (item.unitPrice || 0);
                  const taxAmt =
                    item.taxAmount || (taxable * (item.taxRate || 0)) / 100;
                  const total = taxable + taxAmt;
                  return (
                    <tr key={idx} className='hover:bg-gray-50'>
                      <td className='px-3 py-2.5 text-gray-900'>
                        {item.description || '-'}
                      </td>
                      <td className='px-3 py-2.5 text-gray-600'>
                        {item.hsnCode || '-'}
                      </td>
                      <td className='px-3 py-2.5 text-center text-gray-600'>
                        {item.unit || '-'}
                      </td>
                      <td className='px-3 py-2.5 text-right text-gray-900'>
                        {item.quantity ?? '-'}
                      </td>
                      <td className='px-3 py-2.5 text-right text-gray-900'>
                        {item.unitPrice?.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        }) || '-'}
                      </td>
                      <td className='px-3 py-2.5 text-right text-gray-900'>
                        {fmt(taxable)}
                      </td>
                      <td className='px-3 py-2.5 text-right text-gray-600'>
                        {item.taxRate != null ? `${item.taxRate}%` : '-'}
                      </td>
                      <td className='px-3 py-2.5 text-right text-gray-600'>
                        {taxAmt > 0 ? fmt(taxAmt) : '-'}
                      </td>
                      <td className='px-3 py-2.5 text-right font-medium text-gray-900'>
                        {fmt(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className='flex justify-end'>
        <div className='w-full md:w-1/2'>
          <InvoiceSummaryCard totals={totals} />
        </div>
      </div>
    </div>
  );
};

export default StepLineItems;
