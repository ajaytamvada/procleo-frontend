import React from 'react';
import { FileText, Building2, Package, Pencil, Sparkles } from 'lucide-react';
import InvoiceSummaryCard from './InvoiceSummaryCard';

interface ReviewData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  paymentTerms: string;
  remarks: string;
  supplierGstin: string;
  supplierPan: string;
  billingAddress: string;
  shippingAddress: string;
}

interface CalculatedItem {
  poItemId: number;
  itemName: string;
  itemCode?: string;
  hsnSacCode?: string;
  uom?: string;
  invoiceQuantity: number;
  unitPrice: number;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  totalAmount: number;
  remainingQuantity: number;
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

interface StepReviewProps {
  data: ReviewData;
  totals: Totals;
  ocrFilledFields: Set<string>;
  isPending: boolean;
  onSubmit: () => void;
  onEditStep: (step: number) => void;
}

const StepReview: React.FC<StepReviewProps> = ({
  data,
  totals,
  ocrFilledFields,
  isPending,
  onSubmit,
  onEditStep,
}) => {
  const fmt = (n: number) =>
    n.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const renderField = (label: string, value: string, fieldName: string) => {
    if (!value) return null;
    const isOcr = ocrFilledFields.has(fieldName);
    return (
      <div>
        <dt className='text-xs text-gray-500 flex items-center gap-1'>
          {label}
          {isOcr && <Sparkles className='w-3 h-3 text-violet-500' />}
        </dt>
        <dd className='text-sm font-medium text-gray-900 mt-0.5'>{value}</dd>
      </div>
    );
  };

  const activeItems = totals.calculatedItems.filter(i => i.invoiceQuantity > 0);

  return (
    <div className='max-w-5xl mx-auto space-y-6'>
      {/* Invoice Details Review */}
      <div className='bg-white border rounded-lg overflow-hidden shadow-sm'>
        <div className='p-4 border-b bg-gray-50 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FileText className='w-5 h-5 text-violet-600' />
            <h2 className='text-lg font-semibold text-gray-900'>
              Invoice Details
            </h2>
          </div>
          <button
            type='button'
            onClick={() => onEditStep(2)}
            className='text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1'
          >
            <Pencil className='w-3.5 h-3.5' /> Edit
          </button>
        </div>
        <div className='p-6'>
          <dl className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {renderField('Invoice Number', data.invoiceNumber, 'invoiceNumber')}
            {renderField('Invoice Date', data.invoiceDate, 'invoiceDate')}
            {renderField('Due Date', data.dueDate, 'dueDate')}
            {renderField('Currency', data.currency, 'currency')}
            {renderField('Payment Terms', data.paymentTerms, 'paymentTerms')}
            {renderField('Remarks', data.remarks, '')}
          </dl>
        </div>
      </div>

      {/* Supplier Details Review */}
      {(data.supplierGstin ||
        data.supplierPan ||
        data.billingAddress ||
        data.shippingAddress) && (
        <div className='bg-white border rounded-lg overflow-hidden shadow-sm'>
          <div className='p-4 border-b bg-gray-50 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Building2 className='w-5 h-5 text-violet-600' />
              <h2 className='text-lg font-semibold text-gray-900'>
                Supplier & Address
              </h2>
            </div>
            <button
              type='button'
              onClick={() => onEditStep(2)}
              className='text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1'
            >
              <Pencil className='w-3.5 h-3.5' /> Edit
            </button>
          </div>
          <div className='p-6'>
            <dl className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {renderField('GSTIN', data.supplierGstin, 'supplierGstin')}
              {renderField('PAN', data.supplierPan, 'supplierPan')}
              {renderField(
                'Billing Address',
                data.billingAddress,
                'billingAddress'
              )}
              {renderField(
                'Shipping Address',
                data.shippingAddress,
                'shippingAddress'
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Line Items Review */}
      <div className='bg-white border rounded-lg overflow-hidden shadow-sm'>
        <div className='p-4 border-b bg-gray-50 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Package className='w-5 h-5 text-violet-600' />
            <h2 className='text-lg font-semibold text-gray-900'>Line Items</h2>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
              {activeItems.length} item{activeItems.length !== 1 ? 's' : ''}
            </span>
            <button
              type='button'
              onClick={() => onEditStep(3)}
              className='text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1'
            >
              <Pencil className='w-3.5 h-3.5' /> Edit
            </button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase'>
                  Item
                </th>
                <th className='px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase'>
                  Qty
                </th>
                <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                  Rate
                </th>
                <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                  Taxable
                </th>
                <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                  Tax
                </th>
                <th className='px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase'>
                  Total
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {activeItems.map(item => (
                <tr key={item.poItemId} className='hover:bg-gray-50'>
                  <td className='px-3 py-2.5'>
                    <div className='font-medium text-gray-900'>
                      {item.itemName}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {item.itemCode}{' '}
                      {item.hsnSacCode ? `| HSN: ${item.hsnSacCode}` : ''}
                    </div>
                  </td>
                  <td className='px-3 py-2.5 text-center text-gray-900'>
                    {item.invoiceQuantity} {item.uom || ''}
                  </td>
                  <td className='px-3 py-2.5 text-right text-gray-900'>
                    {fmt(item.unitPrice)}
                  </td>
                  <td className='px-3 py-2.5 text-right text-gray-900'>
                    {fmt(item.taxableValue)}
                  </td>
                  <td className='px-3 py-2.5 text-right text-gray-600'>
                    {fmt(item.cgstAmount + item.sgstAmount)}
                    {item.cgstRate > 0 && (
                      <div className='text-xs text-gray-400'>
                        CGST {item.cgstRate}% + SGST {item.sgstRate}%
                      </div>
                    )}
                  </td>
                  <td className='px-3 py-2.5 text-right font-bold text-gray-900'>
                    {fmt(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary + Submit */}
      <div className='flex justify-end'>
        <div className='w-full md:w-1/2'>
          <InvoiceSummaryCard
            totals={totals}
            showSubmitButton
            isPending={isPending}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default StepReview;
