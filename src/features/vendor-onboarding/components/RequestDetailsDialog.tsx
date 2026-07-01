import React, { useMemo, useState } from 'react';
import { X, ClipboardList } from 'lucide-react';
import {
  ONBOARDING_FIELD_OPTIONS,
  type OnboardingFieldOption,
} from '../constants';

interface RequestDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fields: string[], note: string) => void;
  isSubmitting?: boolean;
  /** Pre-checked fields (e.g. re-requesting the same items). */
  initialFields?: string[];
}

const RequestDetailsDialog: React.FC<RequestDetailsDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialFields = [],
}) => {
  const [selected, setSelected] = useState<string[]>(initialFields);
  const [note, setNote] = useState('');

  const grouped = useMemo(() => {
    const map = new Map<string, OnboardingFieldOption[]>();
    ONBOARDING_FIELD_OPTIONS.forEach(opt => {
      if (!map.has(opt.group)) map.set(opt.group, []);
      map.get(opt.group)!.push(opt);
    });
    return Array.from(map.entries());
  }, []);

  if (!isOpen) return null;

  const toggle = (key: string) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    onSubmit(selected, note.trim());
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-2'>
            <ClipboardList className='text-violet-600' size={20} />
            <div>
              <h2 className='text-lg font-bold text-gray-900'>
                Request More Details
              </h2>
              <p className='text-sm text-gray-500'>
                Tick the fields/documents the supplier must provide.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600'
            aria-label='Close'
          >
            <X size={22} />
          </button>
        </div>

        <div className='p-6 space-y-5'>
          {grouped.map(([group, opts]) => (
            <div key={group}>
              <h3 className='text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2'>
                {group}
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {opts.map(opt => (
                  <label
                    key={opt.key}
                    className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={selected.includes(opt.key)}
                      onChange={() => toggle(opt.key)}
                      className='w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500'
                    />
                    <span className='text-sm text-gray-700'>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Note to supplier (optional)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder='e.g. Please ensure the GST certificate matches the registered name.'
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
            />
          </div>
        </div>

        <div className='flex items-center justify-between gap-3 p-6 border-t bg-gray-50'>
          <span className='text-sm text-gray-500'>
            {selected.length} selected
          </span>
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100'
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selected.length === 0 || isSubmitting}
              className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsDialog;
