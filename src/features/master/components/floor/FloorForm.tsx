import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import type { Floor } from '../../hooks/useFloorAPI';
import { useCountries } from '../../hooks/useCountryAPI';
import { useStatesByCountry } from '../../hooks/useStateAPI';
import { useCitiesByState } from '../../hooks/useCityAPI';

const floorSchema = z.object({
  countryId: z.number().min(1, 'Country is required'),
  stateId: z.number().min(1, 'State is required'),
  cityId: z.number().min(1, 'City is required'),
  name: z.string().min(1, 'Location name is required').max(255, 'Location name cannot exceed 255 characters'),
  code: z.string().max(50, 'Location code cannot exceed 50 characters').optional().or(z.literal('')),
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
  const [selectedCountryId, setSelectedCountryId] = useState<number>(floor?.countryId || 0);
  const [selectedStateId, setSelectedStateId] = useState<number>(floor?.stateId || 0);

  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStatesByCountry(selectedCountryId);
  const { data: cities = [] } = useCitiesByState(selectedStateId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FloorFormData>({
    resolver: zodResolver(floorSchema),
    defaultValues: floor || {
      countryId: 0,
      stateId: 0,
      cityId: 0,
      name: '',
      code: '',
      zipCode: undefined,
    },
  });

  React.useEffect(() => {
    if (floor) {
      reset(floor);
      setSelectedCountryId(floor.countryId);
      setSelectedStateId(floor.stateId);
    }
  }, [floor, reset]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = Number(e.target.value);
    setSelectedCountryId(countryId);
    setSelectedStateId(0);
    setValue('countryId', countryId);
    setValue('stateId', 0);
    setValue('cityId', 0);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = Number(e.target.value);
    setSelectedStateId(stateId);
    setValue('stateId', stateId);
    setValue('cityId', 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {floor?.id ? 'Edit Location' : 'New Location'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="space-y-6 max-w-2xl">
          {/* Country Selection */}
          <div>
            <label htmlFor="countryId" className="block text-sm font-medium text-gray-700 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              {...register('countryId', { valueAsNumber: true })}
              id="countryId"
              onChange={handleCountryChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.countryId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value={0}>Select a country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.countryId && (
              <p className="mt-1 text-sm text-red-600">{errors.countryId.message}</p>
            )}
          </div>

          {/* State Selection */}
          <div>
            <label htmlFor="stateId" className="block text-sm font-medium text-gray-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <select
              {...register('stateId', { valueAsNumber: true })}
              id="stateId"
              onChange={handleStateChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.stateId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting || !selectedCountryId}
            >
              <option value={0}>
                {selectedCountryId ? 'Select a state' : 'Select a country first'}
              </option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.stateId && (
              <p className="mt-1 text-sm text-red-600">{errors.stateId.message}</p>
            )}
          </div>

          {/* City Selection */}
          <div>
            <label htmlFor="cityId" className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <select
              {...register('cityId', { valueAsNumber: true })}
              id="cityId"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cityId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting || !selectedStateId}
            >
              <option value={0}>
                {selectedStateId ? 'Select a city' : 'Select a state first'}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {errors.cityId && (
              <p className="mt-1 text-sm text-red-600">{errors.cityId.message}</p>
            )}
          </div>

          {/* Location Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Location Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter location name (e.g., Main Office, Floor 1)"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Location Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Location Code
            </label>
            <input
              {...register('code')}
              type="text"
              id="code"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter location code (optional)"
              disabled={isSubmitting}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          {/* Zip Code */}
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
              Zip Code
            </label>
            <input
              {...register('zipCode', { valueAsNumber: true })}
              type="number"
              id="zipCode"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.zipCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter zip code (optional)"
              disabled={isSubmitting}
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
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
