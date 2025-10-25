import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import type { State } from '../../hooks/useStateAPI';
import { useCountries } from '../../hooks/useCountryAPI';

const stateSchema = z.object({
  countryId: z.number().min(1, 'Country is required'),
  name: z.string().min(1, 'State name is required').max(255, 'State name cannot exceed 255 characters'),
  code: z.string().min(1, 'State code is required').max(50, 'State code cannot exceed 50 characters'),
});

type StateFormData = z.infer<typeof stateSchema>;

interface StateFormProps {
  state?: State;
  onSubmit: (data: StateFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const StateForm: React.FC<StateFormProps> = ({
  state,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { data: countries = [] } = useCountries();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StateFormData>({
    resolver: zodResolver(stateSchema),
    defaultValues: state || {
      countryId: 0,
      name: '',
      code: '',
    },
  });

  React.useEffect(() => {
    if (state) {
      reset(state);
    }
  }, [state, reset]);

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
            {state?.id ? 'Edit State' : 'New State'}
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

          {/* State Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              State Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter state name (e.g., California, Maharashtra)"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* State Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              State Code <span className="text-red-500">*</span>
            </label>
            <input
              {...register('code')}
              type="text"
              id="code"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter state code (e.g., CA, MH)"
              disabled={isSubmitting}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
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

export default StateForm;
