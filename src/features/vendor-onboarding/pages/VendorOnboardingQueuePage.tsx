import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { useOnboardingQueue } from '../hooks/useVendorOnboarding';
import { STATUS_META, type OnboardingStatus } from '../constants';

const TABS: { status: OnboardingStatus; label: string }[] = [
  { status: 'PENDING_REVIEW', label: 'Pending Review' },
  { status: 'INFO_REQUESTED', label: 'Info Requested' },
  { status: 'APPROVED', label: 'Approved' },
  { status: 'REJECTED', label: 'Rejected' },
];

const VendorOnboardingQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] =
    useState<OnboardingStatus>('PENDING_REVIEW');

  const { data: vendors = [], isLoading } = useOnboardingQueue(activeStatus);

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='mb-6'>
        <h1 className='text-xl font-semibold text-gray-900'>
          Vendor Onboarding
        </h1>
        <p className='text-sm text-gray-500 mt-0.5'>
          Review registering suppliers, request details, approve or reject.
        </p>
      </div>

      {/* Status tabs */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <nav className='flex overflow-x-auto bg-[#fafbfc] border-b border-gray-200'>
          {TABS.map(tab => (
            <button
              key={tab.status}
              onClick={() => setActiveStatus(tab.status)}
              className={`py-3.5 px-5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeStatus === tab.status
                  ? 'border-violet-600 text-violet-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>Loading...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <Users className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>
                No suppliers in this status
              </p>
            </div>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 w-16'>
                    S.No
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Supplier
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Code
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Contact
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Email
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Status
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 w-16'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {vendors.map((v, index) => {
                  const meta =
                    STATUS_META[
                      (v.onboardingStatus as OnboardingStatus) || activeStatus
                    ];
                  return (
                    <tr
                      key={v.id}
                      onClick={() =>
                        navigate(`/master/vendor-onboarding/${v.id}`)
                      }
                      className='hover:bg-gray-50 cursor-pointer transition-colors'
                    >
                      <td className='px-4 py-3.5 text-center text-sm text-gray-600'>
                        {index + 1}
                      </td>
                      <td className='px-4 py-3.5 text-sm font-medium text-violet-600'>
                        {v.name}
                        {activeStatus === 'PENDING_REVIEW' &&
                          !!v.requestedInfoFields?.trim() && (
                            <span className='ml-2 inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700'>
                              Resubmitted
                            </span>
                          )}
                      </td>
                      <td className='px-4 py-3.5 text-sm text-gray-700'>
                        {v.code || '-'}
                      </td>
                      <td className='px-4 py-3.5 text-sm text-gray-700'>
                        {v.contactFirstName
                          ? `${v.contactFirstName} ${v.contactLastName || ''}`.trim()
                          : '-'}
                      </td>
                      <td className='px-4 py-3.5 text-sm text-gray-700'>
                        {v.contactEmail || v.email || '-'}
                      </td>
                      <td className='px-4 py-3.5'>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${meta?.className || 'bg-gray-100 text-gray-600'}`}
                        >
                          {meta?.label || v.onboardingStatus}
                        </span>
                      </td>
                      <td className='px-4 py-3.5 text-center'>
                        <ChevronRight className='w-4 h-4 text-gray-400 inline' />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorOnboardingQueuePage;
