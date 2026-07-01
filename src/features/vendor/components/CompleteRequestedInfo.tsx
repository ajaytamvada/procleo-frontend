import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { ClipboardList, Upload, Send, FileCheck, Loader2 } from 'lucide-react';
import {
  useVendorOnboardingStatus,
  useSubmitForReview,
} from '../hooks/useVendorOnboardingStatus';
import { labelForField } from '../../vendor-onboarding/constants';

/** Requested field keys that are documents (rendered as file uploads). */
const DOCUMENT_FIELDS = new Set([
  'gstFilePath',
  'panFilePath',
  'tdsFilePath',
  'msmeFilePath',
  'isoFilePath',
  'incorporationFilePath',
]);

/** Requested field keys rendered as a multi-line textarea. */
const TEXTAREA_FIELDS = new Set(['businessDescription']);

/**
 * Maps a requested field key to the property name expected by the
 * PUT /vendor-portal/profile DTO (VendorRegistrationDto). Most keys are
 * identical; a couple differ between the entity and the DTO.
 */
const DTO_KEY: Record<string, string> = {
  mobileNo: 'mobile',
  webLink: 'website',
};
const toDtoKey = (key: string) => DTO_KEY[key] || key;

/**
 * Shown on the supplier's Company Profile page when the reviewer has requested
 * additional information (status INFO_REQUESTED). Renders an input for EXACTLY
 * the fields/documents that were requested, pre-filled with current values, and
 * saves them then resubmits the profile for review.
 */
const CompleteRequestedInfo: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: status } = useVendorOnboardingStatus();
  const submit = useSubmitForReview();

  const { data: profile } = useQuery({
    queryKey: ['vendor', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get('/vendor-portal/profile');
      return response.data;
    },
  });

  const requestedFields = useMemo(
    () => status?.requestedFields ?? [],
    [status]
  );

  // Current value per requested field key (text value, or uploaded filename).
  const [values, setValues] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // Seed the form from the existing profile ONCE both are available. Guarded by
  // a ref so a later background refetch of the profile can't wipe what the user
  // has already typed/uploaded but not yet submitted.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (!profile || requestedFields.length === 0) return;
    const seed: Record<string, string> = {};
    requestedFields.forEach(key => {
      seed[key] = profile[key] ?? '';
    });
    setValues(seed);
    seededRef.current = true;
  }, [profile, requestedFields]);

  const saveMutation = useMutation({
    mutationFn: async (dto: Record<string, string>) => {
      await apiClient.put('/vendor-portal/profile', dto);
    },
  });

  if (status?.status !== 'INFO_REQUESTED' || requestedFields.length === 0) {
    return null;
  }

  const setValue = (key: string, value: string) =>
    setValues(prev => ({ ...prev, [key]: value }));

  const handleUpload = async (key: string, file: File | undefined) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await apiClient.post('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const filename = res.data?.upload_inv;
      if (res.data?.data === 1 && filename && filename !== '-') {
        setValue(key, filename);
        toast.success(`${labelForField(key)} uploaded`);
      } else {
        toast.error(res.data?.message || 'Upload failed');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure every requested field has a value before submitting.
    const missing = requestedFields.filter(
      key => !values[key]?.toString().trim()
    );
    if (missing.length > 0) {
      toast.error(`Please complete: ${missing.map(labelForField).join(', ')}`);
      return;
    }

    const dto: Record<string, string> = {};
    requestedFields.forEach(key => {
      dto[toDtoKey(key)] = values[key];
    });

    try {
      await saveMutation.mutateAsync(dto);
      await submit.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ['vendor', 'profile'] });
      queryClient.invalidateQueries({
        queryKey: ['vendor', 'onboarding-status'],
      });
      toast.success('Details submitted for review');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Could not submit. Please try again.'
      );
    }
  };

  const busy = saveMutation.isPending || submit.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className='bg-white rounded-lg border-2 border-blue-200 overflow-hidden'
    >
      <div className='px-6 py-4 border-b border-blue-100 bg-blue-50 flex items-center gap-2'>
        <ClipboardList className='w-5 h-5 text-blue-600' />
        <div>
          <h2 className='text-base font-semibold text-blue-900'>
            Complete requested details
          </h2>
          <p className='text-sm text-blue-700'>
            The reviewer asked for the following. Fill them in and submit for
            review.
          </p>
        </div>
      </div>

      <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
        {requestedFields.map(key => {
          const label = labelForField(key);
          const isDoc = DOCUMENT_FIELDS.has(key);
          const isTextarea = TEXTAREA_FIELDS.has(key);

          return (
            <div
              key={key}
              className={isTextarea || isDoc ? 'md:col-span-2' : ''}
            >
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                {label} <span className='text-red-500'>*</span>
              </label>

              {isDoc ? (
                <div className='flex items-center gap-3'>
                  <label className='inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-lg cursor-pointer hover:bg-violet-100'>
                    {uploadingKey === key ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      <Upload className='w-4 h-4' />
                    )}
                    {values[key] ? 'Replace file' : 'Upload file'}
                    <input
                      type='file'
                      className='hidden'
                      disabled={uploadingKey === key || busy}
                      onChange={e => handleUpload(key, e.target.files?.[0])}
                    />
                  </label>
                  {values[key] && (
                    <span className='inline-flex items-center gap-1.5 text-sm text-green-700'>
                      <FileCheck className='w-4 h-4' />
                      {values[key]}
                    </span>
                  )}
                </div>
              ) : isTextarea ? (
                <textarea
                  rows={3}
                  value={values[key] || ''}
                  onChange={e => setValue(key, e.target.value)}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none'
                />
              ) : (
                <input
                  type='text'
                  value={values[key] || ''}
                  onChange={e => setValue(key, e.target.value)}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                />
              )}
            </div>
          );
        })}
      </div>

      {status.requestedNote && (
        <div className='px-6 pb-2'>
          <p className='text-sm text-blue-800'>
            <strong>Note from reviewer:</strong> {status.requestedNote}
          </p>
        </div>
      )}

      <div className='px-6 py-4 border-t border-gray-100 bg-[#fafbfc] flex justify-end'>
        <button
          type='submit'
          disabled={busy || uploadingKey !== null}
          className='inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:bg-gray-300'
        >
          <Send size={15} />
          {busy ? 'Submitting...' : 'Save & Submit for Review'}
        </button>
      </div>
    </form>
  );
};

export default CompleteRequestedInfo;
