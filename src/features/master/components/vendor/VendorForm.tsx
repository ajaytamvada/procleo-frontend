import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import type { Vendor } from '../../hooks/useVendorAPI';
import { FileUpload } from '@/components/ui/FileUpload';
import { useCategories } from '../../../master/hooks/useCategoryAPI';
import { useSubCategories } from '../../../master/hooks/useSubCategoryAPI';
import { useCountries } from '../../../master/hooks/useCountryAPI';
import { useStatesByCountry } from '../../../master/hooks/useStateAPI';
import { useCitiesByState } from '../../../master/hooks/useCityAPI';

const vendorSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(150),
  code: z.string().max(50).optional().or(z.literal('')),
  legalForm: z.string().max(255).optional().or(z.literal('')),
  webLink: z.string().max(255).optional().or(z.literal('')),
  gst: z.string().max(255).optional().or(z.literal('')),
  pan: z.string().max(50).optional().or(z.literal('')),
  cin: z.string().max(50).optional().or(z.literal('')),
  dunsNo: z.string().max(255).optional().or(z.literal('')),
  industry: z.string().max(255).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  businessDescription: z.string().optional().or(z.literal('')),

  // Address fields
  address1: z.string().max(150).optional().or(z.literal('')),
  address2: z.string().max(150).optional().or(z.literal('')),
  pinCode: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  mobileNo: z.string().max(100).optional().or(z.literal('')),
  countryIds: z.string().optional().or(z.literal('')),
  stateIds: z.string().optional().or(z.literal('')),
  cityId: z.number().optional().nullable(),

  // Contact person
  contactFirstName: z.string().max(100).optional().or(z.literal('')),
  contactLastName: z.string().max(255).optional().or(z.literal('')),
  contactDesignation: z.string().max(100).optional().or(z.literal('')),
  contactPhone: z.string().max(100).optional().or(z.literal('')),
  contactMobile: z.string().max(100).optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().max(500).optional().or(z.literal('')),

  // Categories
  categoryIds: z.string().optional().or(z.literal('')),
  subCategoryIds: z.string().optional().or(z.literal('')),

  // Certificate file paths
  gstFilePath: z.string().optional().or(z.literal('')),
  panFilePath: z.string().optional().or(z.literal('')),
  tdsFilePath: z.string().optional().or(z.literal('')),
  msmeFilePath: z.string().optional().or(z.literal('')),
  isoFilePath: z.string().optional().or(z.literal('')),
  incorporationFilePath: z.string().optional().or(z.literal('')),
  otherFilePath: z.string().optional().or(z.literal('')),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  vendor?: Vendor;
  onSubmit: (data: VendorFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const COMPANY_TYPES = [
  { value: '', label: 'Select' },
  { value: 'Pvt Ltd', label: 'Pvt Ltd' },
  { value: 'Public Ltd', label: 'Public Ltd' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'Proprietorship', label: 'Proprietorship' },
  { value: 'LLP', label: 'LLP' },
  { value: 'Others', label: 'Others' },
];

const VendorForm: React.FC<VendorFormProps> = ({
  vendor,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<number[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<number | null>(null);

  const { data: categories = [] } = useCategories();
  const { data: allSubCategories = [] } = useSubCategories();
  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStatesByCountry(selectedCountry || 0);
  const { data: cities = [] } = useCitiesByState(selectedState || 0);

  // Filter subcategories based on selected categories
  const filteredSubCategories = allSubCategories.filter(
    (sub) => selectedCategories.includes(sub.categoryId)
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: vendor || {
      name: '',
      code: '',
      legalForm: '',
      webLink: '',
      gst: '',
      pan: '',
      cin: '',
      dunsNo: '',
      industry: '',
      email: '',
      businessDescription: '',
      address1: '',
      address2: '',
      pinCode: '',
      state: '',
      phone: '',
      mobileNo: '',
      countryIds: '',
      stateIds: '',
      cityId: null,
      contactFirstName: '',
      contactLastName: '',
      contactDesignation: '',
      contactPhone: '',
      contactMobile: '',
      contactEmail: '',
      password: '',
      categoryIds: '',
      subCategoryIds: '',
      gstFilePath: '',
      panFilePath: '',
      tdsFilePath: '',
      msmeFilePath: '',
      isoFilePath: '',
      incorporationFilePath: '',
      otherFilePath: '',
    },
  });

  useEffect(() => {
    if (vendor) {
      reset(vendor);
      if (vendor.categoryIds) {
        const catIds = vendor.categoryIds.split(',').map(Number).filter(Boolean);
        setSelectedCategories(catIds);
      }
      if (vendor.subCategoryIds) {
        const subCatIds = vendor.subCategoryIds.split(',').map(Number).filter(Boolean);
        setSelectedSubCategories(subCatIds);
      }
      if (vendor.countryIds) {
        const countryId = Number(vendor.countryIds.split(',')[0]);
        setSelectedCountry(countryId);
      }
      if (vendor.stateIds) {
        const stateId = Number(vendor.stateIds.split(',')[0]);
        setSelectedState(stateId);
      }
    }
  }, [vendor, reset]);

  const handleCategoryToggle = (categoryId: number) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newSelected);
    setValue('categoryIds', newSelected.join(','));

    // Clear subcategories if parent category is deselected
    if (!newSelected.includes(categoryId)) {
      const updatedSubCategories = selectedSubCategories.filter(subId => {
        const subCat = allSubCategories.find(s => s.id === subId);
        return subCat && newSelected.includes(subCat.categoryId);
      });
      setSelectedSubCategories(updatedSubCategories);
      setValue('subCategoryIds', updatedSubCategories.join(','));
    }
  };

  const handleSubCategoryToggle = (subCategoryId: number) => {
    const newSelected = selectedSubCategories.includes(subCategoryId)
      ? selectedSubCategories.filter(id => id !== subCategoryId)
      : [...selectedSubCategories, subCategoryId];

    setSelectedSubCategories(newSelected);
    setValue('subCategoryIds', newSelected.join(','));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = Number(e.target.value);
    setSelectedCountry(countryId || null);
    setValue('countryIds', e.target.value);
    setValue('stateIds', '');
    setValue('cityId', null);
    setSelectedState(null);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = Number(e.target.value);
    setSelectedState(stateId || null);
    setValue('stateIds', e.target.value);
    setValue('cityId', null);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = Number(e.target.value);
    setValue('cityId', cityId || null);
  };

  const tabs = [
    { id: 0, name: 'Registered Address' },
    { id: 1, name: 'Contact Information' },
    { id: 2, name: 'Category' },
    { id: 3, name: 'Certificate Document' },
  ];

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onCancel} className="text-gray-600 hover:text-gray-800 transition-colors" disabled={isSubmitting}>
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Supplier Details</h2>
          </div>
          <button
            type="submit"
            form="vendor-form"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            Update
          </button>
        </div>
      </div>

      <form id="vendor-form" onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Main Section - Always Visible (Basic Information) */}
        <div className="mb-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Supplier Name
              </label>
              <input {...register('name')} className={inputClass(!!errors.name)} disabled={isSubmitting} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Supplier Code
              </label>
              <input {...register('code')} className={inputClass(!!errors.code)} disabled={isSubmitting} />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Type</label>
              <select {...register('legalForm')} className={inputClass(!!errors.legalForm)} disabled={isSubmitting}>
                {COMPANY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.legalForm && <p className="mt-1 text-sm text-red-600">{errors.legalForm.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Email Id
              </label>
              <input {...register('email')} type="email" className={inputClass(!!errors.email)} disabled={isSubmitting} />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website Link</label>
              <input {...register('webLink')} className={inputClass(!!errors.webLink)} disabled={isSubmitting} />
              {errors.webLink && <p className="mt-1 text-sm text-red-600">{errors.webLink.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CIN No.</label>
              <input {...register('cin')} className={inputClass(!!errors.cin)} disabled={isSubmitting} />
              {errors.cin && <p className="mt-1 text-sm text-red-600">{errors.cin.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN No.</label>
              <input {...register('gst')} className={inputClass(!!errors.gst)} disabled={isSubmitting} />
              {errors.gst && <p className="mt-1 text-sm text-red-600">{errors.gst.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DUNS No.</label>
              <input {...register('dunsNo')} className={inputClass(!!errors.dunsNo)} disabled={isSubmitting} />
              {errors.dunsNo && <p className="mt-1 text-sm text-red-600">{errors.dunsNo.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PAN No.</label>
              <input {...register('pan')} className={inputClass(!!errors.pan)} disabled={isSubmitting} />
              {errors.pan && <p className="mt-1 text-sm text-red-600">{errors.pan.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <input {...register('industry')} className={inputClass(!!errors.industry)} disabled={isSubmitting} />
              {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
              <textarea {...register('businessDescription')} rows={3} className={inputClass(!!errors.businessDescription)} disabled={isSubmitting} />
              {errors.businessDescription && <p className="mt-1 text-sm text-red-600">{errors.businessDescription.message}</p>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6 space-y-6">
          {/* Tab 0: Registered Address */}
          {activeTab === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Building Address</label>
                <input {...register('address1')} className={inputClass(!!errors.address1)} disabled={isSubmitting} />
                {errors.address1 && <p className="mt-1 text-sm text-red-600">{errors.address1.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area/Street/Locality</label>
                <input {...register('address2')} className={inputClass(!!errors.address2)} disabled={isSubmitting} />
                {errors.address2 && <p className="mt-1 text-sm text-red-600">{errors.address2.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select onChange={handleCountryChange} value={selectedCountry || ''} className={inputClass(false)} disabled={isSubmitting}>
                  <option value="">Select</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select onChange={handleStateChange} value={selectedState || ''} className={inputClass(false)} disabled={isSubmitting || !selectedCountry}>
                  <option value="">Select</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select onChange={handleCityChange} defaultValue={vendor?.cityId || ''} className={inputClass(false)} disabled={isSubmitting || !selectedState}>
                  <option value="">Select</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pin Code</label>
                <input {...register('pinCode')} className={inputClass(!!errors.pinCode)} disabled={isSubmitting} />
                {errors.pinCode && <p className="mt-1 text-sm text-red-600">{errors.pinCode.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telephone No.</label>
                <input {...register('phone')} className={inputClass(!!errors.phone)} disabled={isSubmitting} />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile No.</label>
                <input {...register('mobileNo')} className={inputClass(!!errors.mobileNo)} disabled={isSubmitting} />
                {errors.mobileNo && <p className="mt-1 text-sm text-red-600">{errors.mobileNo.message}</p>}
              </div>
            </div>
          )}

          {/* Tab 1: Contact Information */}
          {activeTab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input {...register('contactFirstName')} className={inputClass(!!errors.contactFirstName)} disabled={isSubmitting} />
                {errors.contactFirstName && <p className="mt-1 text-sm text-red-600">{errors.contactFirstName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input {...register('contactLastName')} className={inputClass(!!errors.contactLastName)} disabled={isSubmitting} />
                {errors.contactLastName && <p className="mt-1 text-sm text-red-600">{errors.contactLastName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telephone Number</label>
                <input {...register('contactPhone')} className={inputClass(!!errors.contactPhone)} disabled={isSubmitting} />
                {errors.contactPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input {...register('contactMobile')} className={inputClass(!!errors.contactMobile)} disabled={isSubmitting} />
                {errors.contactMobile && <p className="mt-1 text-sm text-red-600">{errors.contactMobile.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                <input {...register('contactDesignation')} className={inputClass(!!errors.contactDesignation)} disabled={isSubmitting} />
                {errors.contactDesignation && <p className="mt-1 text-sm text-red-600">{errors.contactDesignation.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Id</label>
                <input {...register('contactEmail')} type="email" className={inputClass(!!errors.contactEmail)} disabled={isSubmitting} />
                {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input {...register('password')} type="password" className={inputClass(!!errors.password)} disabled={isSubmitting} />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
            </div>
          )}

          {/* Tab 2: Category - Hierarchical Tree View */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Select Categories and Sub-Categories</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected, {selectedSubCategories.length} sub-{selectedSubCategories.length === 1 ? 'category' : 'categories'} selected
                  </p>
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No categories available</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                  {categories.map((category) => {
                    const categorySubCategories = allSubCategories.filter(
                      (sub) => sub.categoryId === category.id
                    );
                    const isCategorySelected = selectedCategories.includes(category.id);

                    return (
                      <div key={category.id} className="bg-white">
                        {/* Category Header */}
                        <div
                          className={`p-4 transition-colors ${
                            isCategorySelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isCategorySelected}
                              onChange={() => handleCategoryToggle(category.id)}
                              disabled={isSubmitting}
                              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{category.name}</span>
                                {categorySubCategories.length > 0 && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {categorySubCategories.length} sub-{categorySubCategories.length === 1 ? 'category' : 'categories'}
                                  </span>
                                )}
                              </div>
                              {category.code && (
                                <span className="text-xs text-gray-500">Code: {category.code}</span>
                              )}
                            </div>
                          </label>
                        </div>

                        {/* Sub-Categories (shown only when category is selected) */}
                        {isCategorySelected && categorySubCategories.length > 0 && (
                          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                            <div className="ml-8 space-y-2">
                              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                                Sub-Categories for {category.name}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {categorySubCategories.map((subCat) => (
                                  <label
                                    key={subCat.id}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedSubCategories.includes(subCat.id)}
                                      onChange={() => handleSubCategoryToggle(subCat.id)}
                                      disabled={isSubmitting}
                                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{subCat.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* No Sub-Categories Message */}
                        {isCategorySelected && categorySubCategories.length === 0 && (
                          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                            <p className="ml-8 text-sm text-gray-500 italic">No sub-categories available for this category</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Summary Section */}
              {(selectedCategories.length > 0 || selectedSubCategories.length > 0) && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Selection Summary</h4>
                  <div className="space-y-2 text-sm">
                    {selectedCategories.length > 0 && (
                      <div>
                        <span className="font-medium text-blue-800">Categories: </span>
                        <span className="text-blue-700">
                          {categories
                            .filter((cat) => selectedCategories.includes(cat.id))
                            .map((cat) => cat.name)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {selectedSubCategories.length > 0 && (
                      <div>
                        <span className="font-medium text-blue-800">Sub-Categories: </span>
                        <span className="text-blue-700">
                          {allSubCategories
                            .filter((sub) => selectedSubCategories.includes(sub.id))
                            .map((sub) => sub.name)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Certificate Document */}
          {activeTab === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller name="gstFilePath" control={control} render={({ field }) => (
                <FileUpload label="GST Certificate" value={field.value} onChange={field.onChange} disabled={isSubmitting} multiple />
              )} />

              <Controller name="panFilePath" control={control} render={({ field }) => (
                <FileUpload label="PAN Card" value={field.value} onChange={field.onChange} disabled={isSubmitting} multiple />
              )} />

              <Controller name="tdsFilePath" control={control} render={({ field }) => (
                <FileUpload label="TDS Letter for ITR-206AB" value={field.value} onChange={field.onChange} disabled={isSubmitting} multiple />
              )} />

              <Controller name="msmeFilePath" control={control} render={({ field }) => (
                <FileUpload label="MSME Declaration" value={field.value} onChange={field.onChange} disabled={isSubmitting} multiple />
              )} />

              <Controller name="isoFilePath" control={control} render={({ field }) => (
                <FileUpload label="ISO Certificates" value={field.value} onChange={field.onChange} disabled={isSubmitting} multiple />
              )} />

              <Controller name="otherFilePath" control={control} render={({ field }) => (
                <FileUpload label="Others" value={field.value} onChange={field.onChange} disabled={isSubmitting} multiple />
              )} />

              <Controller name="incorporationFilePath" control={control} render={({ field }) => (
                <FileUpload label="Incorporation Certificate" value={field.value} onChange={field.onChange} disabled={isSubmitting} multiple />
              )} />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default VendorForm;
