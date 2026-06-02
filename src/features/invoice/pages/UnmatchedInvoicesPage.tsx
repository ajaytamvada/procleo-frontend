import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getUnmatchedInvoices,
  getPOCandidates,
  linkInvoiceToPO,
} from '../api/invoiceApi';
import type { Invoice, POCandidate } from '../types';

export default function UnmatchedInvoicesPage() {
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [candidates, setCandidates] = useState<POCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', 'unmatched'],
    queryFn: getUnmatchedInvoices,
  });

  const linkMutation = useMutation({
    mutationFn: ({ invoiceId, poId }: { invoiceId: number; poId: number }) =>
      linkInvoiceToPO(invoiceId, poId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'unmatched'] });
      toast.success('Invoice linked to PO successfully');
      setSelectedInvoice(null);
      setCandidates([]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to link invoice to PO');
    },
  });

  const handleShowCandidates = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setLoadingCandidates(true);
    try {
      const result = await getPOCandidates(invoice.id);
      setCandidates(result);
    } catch {
      toast.error('Failed to load PO candidates');
    } finally {
      setLoadingCandidates(false);
    }
  };

  const matchStatusBadge = (status?: string) => {
    const colors: Record<string, string> = {
      NO_MATCH: 'bg-red-100 text-red-800',
      MULTIPLE_MATCHES: 'bg-yellow-100 text-yellow-800',
      AUTO_MATCHED: 'bg-green-100 text-green-800',
      MANUALLY_MATCHED: 'bg-blue-100 text-blue-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status || ''] || 'bg-gray-100'}`}
      >
        {status?.replace('_', ' ') || 'Unknown'}
      </span>
    );
  };

  if (isLoading) {
    return <div className='p-6'>Loading unmatched invoices...</div>;
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Unmatched Email Invoices</h1>
      <p className='text-gray-600 mb-4'>
        These email-ingested invoices need to be linked to a Purchase Order.
      </p>

      {invoices.length === 0 ? (
        <div className='text-center py-12 text-gray-500 border rounded-lg'>
          No unmatched invoices
        </div>
      ) : (
        <div className='border rounded-lg overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-left font-medium'>Invoice #</th>
                <th className='px-4 py-3 text-left font-medium'>Supplier</th>
                <th className='px-4 py-3 text-right font-medium'>Amount</th>
                <th className='px-4 py-3 text-left font-medium'>
                  Match Status
                </th>
                <th className='px-4 py-3 text-left font-medium'>
                  OCR Confidence
                </th>
                <th className='px-4 py-3 text-left font-medium'>Date</th>
                <th className='px-4 py-3 text-left font-medium'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {invoices.map(invoice => (
                <tr key={invoice.id} className='hover:bg-gray-50'>
                  <td className='px-4 py-3 font-medium'>
                    {invoice.invoiceNumber}
                  </td>
                  <td className='px-4 py-3'>{invoice.supplierName}</td>
                  <td className='px-4 py-3 text-right'>
                    ₹{invoice.grandTotal?.toLocaleString()}
                  </td>
                  <td className='px-4 py-3'>
                    {matchStatusBadge(invoice.poMatchStatus)}
                  </td>
                  <td className='px-4 py-3'>
                    {invoice.ocrConfidenceScore != null
                      ? `${invoice.ocrConfidenceScore}%`
                      : '-'}
                  </td>
                  <td className='px-4 py-3'>{invoice.invoiceDate}</td>
                  <td className='px-4 py-3'>
                    <button
                      className='text-blue-600 hover:underline'
                      onClick={() => handleShowCandidates(invoice)}
                    >
                      Link to PO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PO Candidates Modal */}
      {selectedInvoice && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto'>
            <h2 className='text-lg font-bold mb-2'>
              Link Invoice {selectedInvoice.invoiceNumber} to PO
            </h2>
            <p className='text-sm text-gray-600 mb-4'>
              Supplier: {selectedInvoice.supplierName} | Amount: ₹
              {selectedInvoice.grandTotal?.toLocaleString()}
            </p>

            {loadingCandidates ? (
              <div className='py-8 text-center'>Loading candidates...</div>
            ) : candidates.length === 0 ? (
              <div className='py-8 text-center text-gray-500'>
                No matching POs found for this supplier
              </div>
            ) : (
              <table className='w-full text-sm border'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-3 py-2 text-left'>PO Number</th>
                    <th className='px-3 py-2 text-left'>Date</th>
                    <th className='px-3 py-2 text-right'>Amount</th>
                    <th className='px-3 py-2 text-left'>Reason</th>
                    <th className='px-3 py-2 text-left'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {candidates.map(c => (
                    <tr key={c.poId} className='hover:bg-gray-50'>
                      <td className='px-3 py-2 font-medium'>{c.poNumber}</td>
                      <td className='px-3 py-2'>{c.poDate}</td>
                      <td className='px-3 py-2 text-right'>
                        ₹{c.grandTotal?.toLocaleString()}
                      </td>
                      <td className='px-3 py-2 text-xs text-gray-500'>
                        {c.matchReason}
                      </td>
                      <td className='px-3 py-2'>
                        <button
                          className='px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700'
                          onClick={() =>
                            linkMutation.mutate({
                              invoiceId: selectedInvoice.id,
                              poId: c.poId,
                            })
                          }
                          disabled={linkMutation.isPending}
                        >
                          Link
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className='flex justify-end mt-4'>
              <button
                className='px-4 py-2 border rounded hover:bg-gray-50'
                onClick={() => {
                  setSelectedInvoice(null);
                  setCandidates([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
