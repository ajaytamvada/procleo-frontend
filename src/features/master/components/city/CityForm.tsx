import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import type { City } from '../../hooks/useCityAPI';
import { useCountries } from '../../hooks/useCountryAPI';
import { useStatesByCountry } from '../../hooks/useStateAPI';

const citySchema = z.object({
  stateId: z.number().min(1, 'State is required'),
  name: z
    .string()
    .min(1, 'City name is required')
    .max(90, 'City name cannot exceed 90 characters'),
  code: z
    .string()
    .min(1, 'City code is required')
    .max(90, 'City code cannot exceed 90 characters'),
});

type CityFormData = z.infer<typeof citySchema>;

interface CityFormProps {
  city?: City;
  onSubmit: (data: CityFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CityForm: React.FC<CityFormProps> = ({
  city,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<number>(
    city?.countryId || 0
  );
  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStatesByCountry(selectedCountryId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CityFormData>({
    resolver: zodResolver(citySchema),
    defaultValues: city || { stateId: 0, name: '', code: '' },
  });

  React.useEffect(() => {
    if (city) {
      reset({ stateId: city.stateId, name: city.name, code: city.code });
      setSelectedCountryId(city.countryId || 0);
    }
  }, [city, reset]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountryId(Number(e.target.value));
    setValue('stateId', 0);
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onCancel}
            className='p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-200 transition-colors'
            disabled={isSubmitting}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              {city?.id ? 'Edit City' : 'New City'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {city?.id ? 'Update city details' : 'Create a new city record'}
            </p>
          </div>
        </div>
        <button
          type='submit'
          form='city-form'
          disabled={isSubmitting}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          <Save size={15} />
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <form id='city-form' onSubmit={handleSubmit(onSubmit)}>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <MapPin size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  City Information
                </h2>
                <p className='text-xs text-gray-500'>
                  Fill in the city details below
                </p>
              </div>
            </div>
          </div>

          <div className='p-6 space-y-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Country <span className='text-red-500'>*</span>
                </label>
                <select
                  value={selectedCountryId}
                  onChange={handleCountryChange}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500'
                  disabled={isSubmitting}
                >
                  <option value={0}>Select a country</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  State <span className='text-red-500'>*</span>
                </label>
                <select
                  {...register('stateId', { valueAsNumber: true })}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.stateId ? 'border-red-500' : 'border-gray-200'}`}
                  disabled={isSubmitting || !selectedCountryId}
                >
                  <option value={0}>
                    {selectedCountryId
                      ? 'Select a state'
                      : 'Select a country first'}
                  </option>
                  {states.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.stateId && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.stateId.message}
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  City Name <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('name')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder='Enter city name'
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  City Code <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('code')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.code ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder='Enter city code'
                  disabled={isSubmitting}
                />
                {errors.code && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.code.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='px-6 py-4 border-t border-gray-100 bg-[#fafbfc] flex items-center justify-end gap-3'>
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:bg-gray-400'
            >
              <Save size={15} />
              {isSubmitting ? 'Saving...' : city?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CityForm;
