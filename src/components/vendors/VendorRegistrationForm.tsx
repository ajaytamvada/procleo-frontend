import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Check, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/Card';

// Validation schema for vendor registration
const vendorRegistrationSchema = z.object({
  // Company Information
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  taxId: z.string().min(1, 'Tax ID is required'),
  vendorType: z.enum([
    'supplier',
    'service_provider',
    'contractor',
    'consultant',
  ]),

  // Contact Information
  contactPerson: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number'),
  alternatePhone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),

  // Address Information
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),

  // Banking Information
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z.string().min(5, 'Account number is required'),
  routingNumber: z.string().min(5, 'Routing number is required'),

  // Additional Information
  description: z.string().optional(),
  certifications: z.string().optional(),
  productCategories: z.array(z.string()).optional(),
});

type VendorRegistrationData = z.infer<typeof vendorRegistrationSchema>;

export function VendorRegistrationForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = useForm<VendorRegistrationData>({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: {
      vendorType: 'supplier',
      productCategories: [],
    },
  });

  const onSubmit = async (data: VendorRegistrationData) => {
    try {
      // Map form data to API DTO
      const registrationDto = {
        companyName: data.companyName,
        companyCode: data.registrationNumber,
        companyEmail: data.email,
        phone: data.phone,
        mobile: data.alternatePhone,
        website: data.website,
        address1: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pinCode: data.postalCode,
        gst: data.taxId,
        contactFirstName:
          data.contactPerson?.split(' ')[0] || data.contactPerson,
        contactLastName:
          data.contactPerson?.split(' ').slice(1).join(' ') || '',
        contactEmail: data.email,
        contactPhone: data.phone,
        industry: data.vendorType,
        businessDescription: data.description,
      };

      const response = await apiClient.post(
        '/public/vendor/register',
        registrationDto
      );

      if (response.data.success) {
        setRegistrationData(response.data);
        setRegistrationComplete(true);
        toast.success(
          'Registration successful! Check your email for login credentials.'
        );
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Failed to submit vendor registration. Please try again.';
      toast.error(message);
    }
  };

  const nextStep = async () => {
    // Validate current step fields
    let fieldsToValidate: (keyof VendorRegistrationData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          'companyName',
          'registrationNumber',
          'taxId',
          'vendorType',
        ];
        break;
      case 2:
        fieldsToValidate = [
          'contactPerson',
          'email',
          'phone',
          'address',
          'city',
          'state',
          'country',
          'postalCode',
        ];
        break;
      case 3:
        fieldsToValidate = ['bankName', 'accountNumber', 'routingNumber'];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Show success screen after registration
  if (registrationComplete) {
    return (
      <div className='min-h-screen w-full flex items-center justify-center bg-white p-6'>
        <div className='max-w-xl w-full text-center'>
          <div className='mx-auto mb-6 h-20 w-20 rounded-full bg-green-100 flex items-center justify-center'>
            <CheckCircle className='h-10 w-10 text-green-600' />
          </div>
          <h2 className='text-3xl font-semibold text-gray-800 mb-4'>
            Registration Successful!
          </h2>
          <p className='text-gray-600 mb-6'>
            Your vendor account has been created. Login credentials have been
            sent to your email address.
          </p>
          <div className='bg-purple-50 rounded-lg p-6 mb-6 max-w-sm mx-auto text-left'>
            <h3 className='font-semibold text-purple-900 mb-3'>
              Your Account Details:
            </h3>
            <div className='space-y-2 text-sm'>
              <div>
                <span className='text-purple-600'>Vendor Code:</span>
                <span className='ml-2 font-mono font-bold'>
                  {registrationData?.vendorCode}
                </span>
              </div>
              <div>
                <span className='text-purple-600'>Login Email:</span>
                <span className='ml-2 font-mono font-bold'>
                  {registrationData?.loginEmail}
                </span>
              </div>
              <div className='pt-2 border-t border-purple-200 mt-2'>
                <span className='text-purple-700 text-xs'>
                  Password sent to your email
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => navigate('/auth/login')}
            className='h-11 bg-[rgb(103,62,230)] hover:bg-[rgb(83,42,210)] text-white font-semibold rounded-md shadow-sm hover:shadow transition-all px-8'
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Card>
        <div className='p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='mx-auto mb-6'>
              <img
                src={import.meta.env.BASE_URL + 'riditstack-logo.png'}
                alt='RiditStack Logo'
                className='h-16 w-auto mx-auto'
              />
            </div>
            <h2
              className='text-3xl font-bold mb-2'
              style={{ color: '#1a0b2e' }}
            >
              Vendor Registration
            </h2>
            <p className='text-gray-600'>
              Join Autovitica P2P as a trusted vendor
            </p>
          </div>

          {/* Progress Steps */}
          <div className='mb-8'>
            <div className='flex items-center justify-between'>
              {[1, 2, 3, 4].map(step => (
                <React.Fragment key={step}>
                  <div className='flex items-center'>
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold
                        ${
                          currentStep >= step
                            ? 'text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      style={
                        currentStep >= step
                          ? { backgroundColor: '#6366f1' }
                          : {}
                      }
                    >
                      {currentStep > step ? (
                        <Check className='h-5 w-5' />
                      ) : (
                        step
                      )}
                    </div>
                    <span
                      className={`ml-3 font-medium hidden sm:block
                      ${currentStep >= step ? '' : 'text-gray-500'}
                    `}
                      style={currentStep >= step ? { color: '#6366f1' } : {}}
                    >
                      {step === 1 && 'Company Info'}
                      {step === 2 && 'Contact & Address'}
                      {step === 3 && 'Banking Details'}
                      {step === 4 && 'Review & Submit'}
                    </span>
                  </div>
                  {step < 4 && (
                    <div
                      className='flex-1 h-0.5 mx-4'
                      style={{
                        backgroundColor:
                          currentStep > step ? '#6366f1' : '#E5E7EB',
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Company Information
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Company Name
                    </label>
                    <Input
                      {...register('companyName')}
                      placeholder='Enter company name'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.companyName?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Registration Number
                    </label>
                    <Input
                      {...register('registrationNumber')}
                      placeholder='Enter registration number'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.registrationNumber?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Tax ID / VAT Number
                    </label>
                    <Input
                      {...register('taxId')}
                      placeholder='Enter tax ID'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.taxId?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Vendor Type
                    </label>
                    <Select
                      {...register('vendorType')}
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all'
                      error={errors.vendorType?.message}
                    >
                      <option value='supplier'>Supplier</option>
                      <option value='service_provider'>Service Provider</option>
                      <option value='contractor'>Contractor</option>
                      <option value='consultant'>Consultant</option>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Address */}
            {currentStep === 2 && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Contact & Address Information
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Contact Person
                    </label>
                    <Input
                      {...register('contactPerson')}
                      placeholder='Enter contact person name'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.contactPerson?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Email Address
                    </label>
                    <Input
                      {...register('email')}
                      type='email'
                      placeholder='vendor@company.com'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.email?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Phone Number
                    </label>
                    <Input
                      {...register('phone')}
                      placeholder='+1 (555) 123-4567'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.phone?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Website (Optional)
                    </label>
                    <Input
                      {...register('website')}
                      placeholder='https://www.company.com'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.website?.message}
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Address
                    </label>
                    <Textarea
                      {...register('address')}
                      placeholder='Enter street address'
                      className='w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      rows={3}
                      error={errors.address?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      City
                    </label>
                    <Input
                      {...register('city')}
                      placeholder='Enter city'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.city?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      State/Province
                    </label>
                    <Input
                      {...register('state')}
                      placeholder='Enter state'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.state?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Country
                    </label>
                    <Input
                      {...register('country')}
                      placeholder='Enter country'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.country?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Postal Code
                    </label>
                    <Input
                      {...register('postalCode')}
                      placeholder='Enter postal code'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.postalCode?.message}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Banking Details */}
            {currentStep === 3 && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Banking Information
                </h3>

                <Alert variant='info' className='text-sm py-2'>
                  This information is required for payment processing and will
                  be kept confidential.
                </Alert>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='md:col-span-2'>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Bank Name
                    </label>
                    <Input
                      {...register('bankName')}
                      placeholder='Enter bank name'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.bankName?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Account Number
                    </label>
                    <Input
                      {...register('accountNumber')}
                      placeholder='Enter account number'
                      type='password'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.accountNumber?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Routing Number / SWIFT Code
                    </label>
                    <Input
                      {...register('routingNumber')}
                      placeholder='Enter routing number'
                      className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      error={errors.routingNumber?.message}
                    />
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Business Description (Optional)
                    </label>
                    <Textarea
                      {...register('description')}
                      placeholder='Briefly describe your business and services'
                      className='w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className='block text-[13px] font-medium text-gray-600 mb-1.5'>
                      Certifications (Optional)
                    </label>
                    <Textarea
                      {...register('certifications')}
                      placeholder='List any relevant certifications (ISO, Quality, etc.)'
                      className='w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Review Your Information
                </h3>

                <div className='space-y-3'>
                  <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Company Information
                    </h4>
                    <dl className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
                      <div>
                        <dt className='text-gray-600'>Company Name:</dt>
                        <dd className='font-medium'>{watch('companyName')}</dd>
                      </div>
                      <div>
                        <dt className='text-gray-600'>Registration Number:</dt>
                        <dd className='font-medium'>
                          {watch('registrationNumber')}
                        </dd>
                      </div>
                      <div>
                        <dt className='text-gray-600'>Tax ID:</dt>
                        <dd className='font-medium'>{watch('taxId')}</dd>
                      </div>
                      <div>
                        <dt className='text-gray-600'>Vendor Type:</dt>
                        <dd className='font-medium capitalize'>
                          {watch('vendorType')?.replace('_', ' ')}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Contact Information
                    </h4>
                    <dl className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
                      <div>
                        <dt className='text-gray-600'>Contact Person:</dt>
                        <dd className='font-medium'>
                          {watch('contactPerson')}
                        </dd>
                      </div>
                      <div>
                        <dt className='text-gray-600'>Email:</dt>
                        <dd className='font-medium'>{watch('email')}</dd>
                      </div>
                      <div>
                        <dt className='text-gray-600'>Phone:</dt>
                        <dd className='font-medium'>{watch('phone')}</dd>
                      </div>
                      <div>
                        <dt className='text-gray-600'>Address:</dt>
                        <dd className='font-medium'>
                          {watch('address')}, {watch('city')}, {watch('state')}{' '}
                          {watch('postalCode')}, {watch('country')}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Banking Information
                    </h4>
                    <dl className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
                      <div>
                        <dt className='text-gray-600'>Bank Name:</dt>
                        <dd className='font-medium'>{watch('bankName')}</dd>
                      </div>
                      <div>
                        <dt className='text-gray-600'>Account Number:</dt>
                        <dd className='font-medium'>
                          ****{watch('accountNumber')?.slice(-4)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <Alert className='text-sm py-2'>
                  By submitting this form, you agree to our terms and conditions
                  and authorize Procleo to verify the provided information.
                </Alert>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className='flex justify-between pt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={prevStep}
                disabled={currentStep === 1}
                className='h-11 px-6 text-sm font-semibold'
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type='button'
                  onClick={nextStep}
                  className='h-11 px-6 bg-[rgb(103,62,230)] hover:bg-[rgb(83,42,210)] text-white text-sm font-semibold rounded-md shadow-sm hover:shadow transition-all'
                >
                  Next
                </Button>
              ) : (
                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='h-11 px-6 bg-[rgb(103,62,230)] hover:bg-[rgb(83,42,210)] text-white text-sm font-semibold rounded-md shadow-sm hover:shadow transition-all'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Submitting...
                    </>
                  ) : (
                    'Submit Registration'
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default VendorRegistrationForm;
