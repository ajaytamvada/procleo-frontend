import React from 'react';
import { Send, Loader2 } from 'lucide-react';

interface InvoiceTotals {
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  taxAmount: number;
  grandTotal: number;
}

interface InvoiceSummaryCardProps {
  totals: InvoiceTotals;
  showSubmitButton?: boolean;
  isPending?: boolean;
  onSubmit?: () => void;
}

const InvoiceSummaryCard: React.FC<InvoiceSummaryCardProps> = ({
  totals,
  showSubmitButton = false,
  isPending = false,
  onSubmit,
}) => {
  const fmt = (n: number) =>
    n.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className='w-full bg-white border rounded-lg p-6 space-y-2.5 shadow-sm'>
      <div className='flex justify-between text-sm text-gray-600'>
        <span>Subtotal (Taxable Value)</span>
        <span className='font-medium text-gray-900'>
          ₹ {fmt(totals.subtotal)}
        </span>
      </div>
      {totals.totalCgst > 0 && (
        <div className='flex justify-between text-sm text-gray-500'>
          <span>CGST</span>
          <span>₹ {fmt(totals.totalCgst)}</span>
        </div>
      )}
      {totals.totalSgst > 0 && (
        <div className='flex justify-between text-sm text-gray-500'>
          <span>SGST</span>
          <span>₹ {fmt(totals.totalSgst)}</span>
        </div>
      )}
      {totals.totalIgst > 0 && (
        <div className='flex justify-between text-sm text-gray-500'>
          <span>IGST</span>
          <span>₹ {fmt(totals.totalIgst)}</span>
        </div>
      )}
      <div className='flex justify-between text-sm text-gray-600'>
        <span>Total Tax</span>
        <span className='font-medium text-gray-900'>
          ₹ {fmt(totals.taxAmount)}
        </span>
      </div>
      <div className='pt-3 border-t-2 border-violet-600 flex justify-between font-bold text-lg text-gray-900'>
        <span>Grand Total</span>
        <span className='text-violet-600'>₹ {fmt(totals.grandTotal)}</span>
      </div>

      {showSubmitButton && onSubmit && (
        <button
          type='button'
          onClick={onSubmit}
          disabled={isPending || totals.grandTotal <= 0}
          className='w-full mt-4 bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
        >
          {isPending ? (
            <Loader2 className='w-5 h-5 animate-spin' />
          ) : (
            <Send className='w-5 h-5' />
          )}
          Submit Invoice
        </button>
      )}
    </div>
  );
};

export default InvoiceSummaryCard;
