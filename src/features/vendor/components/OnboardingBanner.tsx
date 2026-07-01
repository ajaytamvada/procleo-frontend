import React from 'react';
import { Clock, ClipboardList, XCircle } from 'lucide-react';
import { useVendorOnboardingStatus } from '../hooks/useVendorOnboardingStatus';
import { labelForField } from '../../vendor-onboarding/constants';

/**
 * Shown at the top of vendor-portal pages until the supplier is APPROVED.
 * - PENDING_REVIEW: account under review.
 * - INFO_REQUESTED: checklist of what the reviewer asked for + resubmit.
 * - REJECTED: rejection notice with remarks.
 */
const OnboardingBanner: React.FC = () => {
  const { data, isLoading } = useVendorOnboardingStatus();

  if (isLoading || !data || data.approved) return null;

  if (data.status === 'REJECTED') {
    return (
      <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4'>
        <div className='flex items-start gap-3'>
          <XCircle className='text-red-600 mt-0.5' size={20} />
          <div>
            <h3 className='font-semibold text-red-900'>
              Your registration was not approved
            </h3>
            {data.remarks && (
              <p className='text-sm text-red-800 mt-1'>{data.remarks}</p>
            )}
            <p className='text-sm text-red-700 mt-1'>
              Please contact the procurement team for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (data.status === 'INFO_REQUESTED') {
    return (
      <div className='mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4'>
        <div className='flex items-start gap-3'>
          <ClipboardList className='text-blue-600 mt-0.5' size={20} />
          <div className='flex-1'>
            <h3 className='font-semibold text-blue-900'>
              Additional details requested
            </h3>
            <p className='text-sm text-blue-800 mt-1'>
              Please complete the following on your{' '}
              <strong>Company Profile</strong>, then submit for review:
            </p>
            {data.requestedFields.length > 0 && (
              <ul className='list-disc ml-5 text-sm text-blue-800 mt-2'>
                {data.requestedFields.map(f => (
                  <li key={f}>{labelForField(f)}</li>
                ))}
              </ul>
            )}
            {data.requestedNote && (
              <p className='text-sm text-blue-800 mt-2'>
                <strong>Note:</strong> {data.requestedNote}
              </p>
            )}
            <p className='text-sm text-blue-700 mt-3'>
              Use the <strong>Complete requested details</strong> form below to
              provide these and submit for review.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // PENDING_REVIEW
  return (
    <div className='mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4'>
      <div className='flex items-start gap-3'>
        <Clock className='text-amber-600 mt-0.5' size={20} />
        <div>
          <h3 className='font-semibold text-amber-900'>
            Your account is pending approval
          </h3>
          <p className='text-sm text-amber-800 mt-1'>
            You can complete your company profile and upload documents now. Full
            portal access (RFPs, purchase orders, invoices) unlocks once your
            account is approved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingBanner;
