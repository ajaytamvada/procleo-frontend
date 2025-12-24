import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import type { Floor } from '../../hooks/useFloorAPI';
import { useCountries } from '../../hooks/useCountryAPI';
import { useStatesByCountry } from '../../hooks/useStateAPI';
import { useCitiesByState } from '../../hooks/useCityAPI';
import { useBuildings } from '../../hooks/useBuildingAPI';

const floorSchema = z.object({
  buildingId: z.number().min(1, 'Building is required'),
  name: z
    .string()
    .min(1, 'Floor name is required')
    .max(255, 'Floor name cannot exceed 255 characters'),
  code: z
    .string()
    .max(50, 'Floor code cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  zipCode: z.number().optional(),
});

type FloorFormData = z.infer<typeof floorSchema>;

interface FloorFormProps {
  floor?: Floor;
  onSubmit: (data: FloorFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const FloorForm: React.FC<FloorFormProps> = ({
  floor,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<number>(0);
  const [selectedStateId, setSelectedStateId] = useState<number>(0);
  const [selectedCityId, setSelectedCityId] = useState<number>(0);

  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStatesByCountry(selectedCountryId);
  const { data: cities = [] } = useCitiesByState(selectedStateId);
  const { data: buildings = [] } = useBuildings();

  // Filter buildings by city if a city is selected
  const filteredBuildings = selectedCityId
    ? buildings.filter((b: { cityId?: number }) => b.cityId === selectedCityId)
    : buildings;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FloorFormData>({
    resolver: zodResolver(floorSchema),
    defaultValues: floor || {
      buildingId: 0,
      name: '',
      code: '',
      zipCode: undefined,
    },
  });

  React.useEffect(() => {
    if (floor) {
      reset({
        buildingId: floor.buildingId,
        name: floor.name,
        code: floor.code,
      });
    }
  }, [floor, reset]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = Number(e.target.value);
    setSelectedCountryId(countryId);
    setSelectedStateId(0);
    setSelectedCityId(0);
    setValue('buildingId', 0);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = Number(e.target.value);
    setSelectedStateId(stateId);
    setSelectedCityId(0);
    setValue('buildingId', 0);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = Number(e.target.value);
    setSelectedCityId(cityId);
    setValue('buildingId', 0);
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
            {floor?.id ? 'Edit Floor' : 'New Floor'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='p-6'>
        <div className='space-y-6 max-w-2xl'>
          {/* Country Selection (filter only) */}
          <div>
            <label
              htmlFor='countryId'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Country
            </label>
            <select
              id='countryId'
              value={selectedCountryId}
              onChange={handleCountryChange}
              className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300'
              disabled={isSubmitting}
            >
              <option value={0}>Select a country (optional filter)</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* State Selection (filter only) */}
          <div>
            <label
              htmlFor='stateId'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              State
            </label>
            <select
              id='stateId'
              value={selectedStateId}
              onChange={handleStateChange}
              className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300'
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
          </div>

          {/* City Selection (filter only) */}
          <div>
            <label
              htmlFor='cityId'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              City
            </label>
            <select
              id='cityId'
              value={selectedCityId}
              onChange={handleCityChange}
              className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300'
              disabled={isSubmitting || !selectedStateId}
            >
              <option value={0}>
                {selectedStateId ? 'Select a city' : 'Select a state first'}
              </option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Building Selection */}
          <div>
            <label
              htmlFor='buildingId'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Building <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('buildingId', { valueAsNumber: true })}
              id='buildingId'
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.buildingId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value={0}>Select a building</option>
              {filteredBuildings.map(
                (building: { id?: number; name: string }) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                )
              )}
            </select>
            {errors.buildingId && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.buildingId.message}
              </p>
            )}
          </div>

          {/* Floor Name */}
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Floor Name <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('name')}
              type='text'
              id='name'
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter floor name (e.g., Floor 1, Ground Floor)'
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
            )}
          </div>

          {/* Floor Code */}
          <div>
            <label
              htmlFor='code'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Floor Code
            </label>
            <input
              {...register('code')}
              type='text'
              id='code'
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter floor code (optional)'
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

export default FloorForm;
