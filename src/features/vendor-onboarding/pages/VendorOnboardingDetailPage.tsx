import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  XCircle,
  ClipboardList,
  Download,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import {
  useOnboardingDetail,
  useApproveVendor,
  useRejectVendor,
  useRequestVendorInfo,
} from '../hooks/useVendorOnboarding';
import {
  STATUS_META,
  labelForField,
  type OnboardingStatus,
} from '../constants';
import RequestDetailsDialog from '../components/RequestDetailsDialog';
import { useSupplierCategories } from '@/features/master/hooks/useSupplierCategoryAPI';

/** Requested-field keys that are documents (downloadable filenames). */
const DOCUMENT_FIELDS: { key: string; label: string }[] = [
  { key: 'gstFilePath', label: 'GST Certificate' },
  { key: 'panFilePath', label: 'PAN Card' },
  { key: 'tdsFilePath', label: 'TDS Declaration' },
  { key: 'msmeFilePath', label: 'MSME Declaration' },
  { key: 'isoFilePath', label: 'ISO Certificate' },
  { key: 'incorporationFilePath', label: 'Incorporation Certificate' },
];
const DOCUMENT_KEYS = new Set(DOCUMENT_FIELDS.map(d => d.key));

/** Authenticated download (a plain link wouldn't carry the JWT header). */
const downloadFile = async (filename: string) => {
  try {
    const res = await apiClient.get(
      `/files/download/${encodeURIComponent(filename)}`,
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch {
    toast.error('Could not download the file');
  }
};

const Field: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <div>
    <div className='text-xs uppercase tracking-wide text-gray-400 mb-0.5'>
      {label}
    </div>
    <div className='text-sm text-gray-900'>{value || '-'}</div>
  </div>
);

const VendorOnboardingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vendorId = Number(id);
  const navigate = useNavigate();

  const { data: vendor, isLoading } = useOnboardingDetail(vendorId);
  const approve = useApproveVendor();
  const reject = useRejectVendor();
  const requestInfo = useRequestVendorInfo();

  const [remarks, setRemarks] = useState('');
  const [supplierCategoryId, setSupplierCategoryId] = useState('');
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data: supplierGroups = [] } = useSupplierCategories();

  const backToQueue = () => navigate('/master/vendor-onboarding');

  const handleApprove = async () => {
    if (!supplierCategoryId) {
      toast.error('Please select a supplier group before approving');
      return;
    }
    try {
      await approve.mutateAsync({
        id: vendorId,
        payload: { remarks, supplierCategoryIds: supplierCategoryId },
      });
      toast.success('Supplier approved');
      backToQueue();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error('Please add a reason in remarks before rejecting');
      return;
    }
    try {
      await reject.mutateAsync({ id: vendorId, payload: { remarks } });
      toast.success('Supplier rejected');
      backToQueue();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to reject');
    }
  };

  const handleRequestInfo = async (fields: string[], note: string) => {
    try {
      await requestInfo.mutateAsync({
        id: vendorId,
        payload: { requestedFields: fields, note },
      });
      toast.success('Details requested from supplier');
      setShowRequestDialog(false);
      backToQueue();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to request details');
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-10 w-10 border-2 border-violet-600 border-t-transparent'></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className='p-6'>
        <p className='text-gray-600'>Supplier not found.</p>
      </div>
    );
  }

  const status =
    (vendor.onboardingStatus as OnboardingStatus) || 'PENDING_REVIEW';
  const meta = STATUS_META[status];
  const isDecided = status === 'APPROVED' || status === 'REJECTED';
  const busy = approve.isPending || reject.isPending || requestInfo.isPending;
  const requestedFields = (vendor.requestedInfoFields || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='flex items-center gap-3 mb-6'>
        <button
          onClick={backToQueue}
          className='p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-200'
        >
          <ArrowLeft size={18} />
        </button>
        <div className='flex-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-xl font-semibold text-gray-900'>
              {vendor.name}
            </h1>
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${meta?.className || 'bg-gray-100 text-gray-600'}`}
            >
              {meta?.label || status}
            </span>
          </div>
          <p className='text-sm text-gray-500 mt-0.5'>
            Code: {vendor.code || '-'}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Details */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4'>
              Company
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              <Field label='Email' value={vendor.email} />
              <Field label='Industry' value={vendor.industry} />
              <Field label='Website' value={vendor.webLink} />
              <Field label='Phone' value={vendor.phone} />
              <Field label='Mobile' value={vendor.mobileNo} />
              <Field label='Legal form' value={vendor.legalForm} />
              <div className='col-span-2'>
                <Field
                  label='Business description'
                  value={vendor.businessDescription}
                />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4'>
              Statutory & Address
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              <Field label='GSTIN' value={vendor.gst} />
              <Field label='PAN' value={vendor.pan} />
              <Field label='CIN' value={vendor.cin} />
              <Field label='DUNS' value={vendor.dunsNo} />
              <Field label='Address' value={vendor.address1} />
              <Field label='State' value={vendor.state} />
              <Field label='Pin code' value={vendor.pinCode} />
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4'>
              Contact Person
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              <Field
                label='Name'
                value={`${vendor.contactFirstName || ''} ${vendor.contactLastName || ''}`.trim()}
              />
              <Field label='Designation' value={vendor.contactDesignation} />
              <Field label='Email' value={vendor.contactEmail} />
              <Field label='Phone' value={vendor.contactPhone} />
            </div>
          </div>

          {DOCUMENT_FIELDS.some(d => !!vendor[d.key]) && (
            <div className='bg-white rounded-lg border border-gray-200 p-6'>
              <h2 className='text-base font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <FileText size={18} className='text-gray-400' /> Documents
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {DOCUMENT_FIELDS.filter(d => !!vendor[d.key]).map(d => (
                  <div
                    key={d.key}
                    className='flex items-center justify-between gap-3 border border-gray-100 rounded-lg px-4 py-3'
                  >
                    <div className='min-w-0'>
                      <p className='text-sm font-medium text-gray-700'>
                        {d.label}
                      </p>
                      <p className='text-xs text-gray-500 truncate'>
                        {String(vendor[d.key])}
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => downloadFile(String(vendor[d.key]))}
                      className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 shrink-0'
                    >
                      <Download className='w-3.5 h-3.5' /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(requestedFields.length > 0 || vendor.requestedInfoNote) && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
              <h2 className='text-base font-semibold text-blue-900 mb-3 flex items-center gap-2'>
                <ClipboardList size={18} /> Details requested from supplier
              </h2>
              {requestedFields.length > 0 && (
                <ul className='space-y-2'>
                  {requestedFields.map(f => {
                    const val = vendor[f];
                    const provided = !!val && String(val).trim() !== '';
                    const isDoc = DOCUMENT_KEYS.has(f);
                    return (
                      <li
                        key={f}
                        className='flex items-start justify-between gap-3 text-sm border-b border-blue-100 pb-2 last:border-0'
                      >
                        <span className='text-blue-900 font-medium'>
                          {labelForField(f)}
                        </span>
                        {provided ? (
                          isDoc ? (
                            <button
                              type='button'
                              onClick={() => downloadFile(String(val))}
                              className='inline-flex items-center gap-1 text-violet-700 hover:underline break-all text-right'
                            >
                              <Download className='w-3.5 h-3.5 shrink-0' />{' '}
                              {String(val)}
                            </button>
                          ) : (
                            <span className='text-gray-900 text-right break-words'>
                              {String(val)}
                            </span>
                          )
                        ) : (
                          <span className='text-red-600 font-medium shrink-0'>
                            Not provided
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {vendor.requestedInfoNote && (
                <p className='text-sm text-blue-800 mt-3'>
                  <strong>Note:</strong> {vendor.requestedInfoNote}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action panel */}
        <div className='space-y-4'>
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-3'>
              Review Decision
            </h2>

            {isDecided ? (
              <div className='text-sm text-gray-600'>
                <p>
                  This supplier has been{' '}
                  <span className='font-semibold'>{meta?.label}</span>.
                </p>
                {vendor.approvalRemarks && (
                  <p className='mt-2'>
                    <strong>Remarks:</strong> {vendor.approvalRemarks}
                  </p>
                )}
              </div>
            ) : (
              <>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Supplier Group <span className='text-red-500'>*</span>
                </label>
                <select
                  value={supplierCategoryId}
                  onChange={e => setSupplierCategoryId(e.target.value)}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4'
                >
                  <option value=''>Select a group…</option>
                  {supplierGroups.map(g => (
                    <option key={g.id} value={String(g.id)}>
                      {g.name}
                    </option>
                  ))}
                </select>

                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={3}
                  placeholder='Required when rejecting; optional when approving'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4'
                />

                <div className='space-y-2'>
                  <button
                    onClick={handleApprove}
                    disabled={busy || !supplierCategoryId}
                    title={
                      !supplierCategoryId
                        ? 'Select a supplier group to enable approval'
                        : undefined
                    }
                    className='w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300'
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    onClick={() => setShowRequestDialog(true)}
                    disabled={busy}
                    className='w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 disabled:opacity-50'
                  >
                    <ClipboardList size={16} /> Request More Details
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={busy}
                    className='w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50'
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <RequestDetailsDialog
        isOpen={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        onSubmit={handleRequestInfo}
        isSubmitting={requestInfo.isPending}
        initialFields={requestedFields}
      />
    </div>
  );
};

export default VendorOnboardingDetailPage;
