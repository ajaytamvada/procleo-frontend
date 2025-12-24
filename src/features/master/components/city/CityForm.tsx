import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
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
    defaultValues: city || {
      stateId: 0,
      name: '',
      code: '',
    },
  });

  React.useEffect(() => {
    if (city) {
      reset({ stateId: city.stateId, name: city.name, code: city.code });
      setSelectedCountryId(city.countryId || 0);
    }
  }, [city, reset]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = Number(e.target.value);
    setSelectedCountryId(countryId);
    setValue('stateId', 0); // Reset state when country changes
  };

  return (
    <div className='bg-white rounded-lg shadow-md'>
      <div className='border-b border-gray-200 p-6'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onCancel}
            className='text-gray-600 hover:text-gray-800 transition-colors'
            disabled={isSubmitting}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className='text-2xl font-bold text-gray-800'>
            {city?.id ? 'Edit City' : 'New City'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='p-6'>
        <div className='space-y-6 max-w-2xl'>
          {/* Country Selection (for filtering states) */}
          <div>
            <label
              htmlFor='countryId'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Country <span className='text-red-500'>*</span>
            </label>
            <select
              id='countryId'
              value={selectedCountryId}
              onChange={handleCountryChange}
              className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300'
              disabled={isSubmitting}
            >
              <option value={0}>Select a country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* State Selection */}
          <div>
            <label
              htmlFor='stateId'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              State <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('stateId', { valueAsNumber: true })}
              id='stateId'
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.stateId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting || !selectedCountryId}
            >
              <option value={0}>
                {selectedCountryId
                  ? 'Select a state'
                  : 'Select a country first'}
              </option>
              {states.map(state => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.stateId && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.stateId.message}
              </p>
            )}
          </div>

          {/* City Name */}
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              City Name <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('name')}
              type='text'
              id='name'
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter city name (e.g., Los Angeles, Mumbai)'
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
            )}
          </div>

          {/* City Code */}
          <div>
            <label
              htmlFor='code'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              City Code <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('code')}
              type='text'
              id='code'
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter city code (e.g., LA, MUM)'
              disabled={isSubmitting}
            />
            {errors.code && (
              <p className='mt-1 text-sm text-red-600'>{errors.code.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex gap-4 pt-4'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              <Save size={20} />
              <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed'
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CityForm;
