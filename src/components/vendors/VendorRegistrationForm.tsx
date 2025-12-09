import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Globe,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

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
      // TODO: Implement vendor registration API call
      console.log('Vendor registration data:', data);

      toast.success(
        'Vendor registration submitted successfully! We will review your application.'
      );
      navigate('/vendors');
    } catch (error) {
      toast.error('Failed to submit vendor registration. Please try again.');
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

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Card>
        <div className='p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='mx-auto mb-6'>
              <img
                src='/riditstack-logo.png'
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

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className='space-y-6'>
                <h3 className='text-xl font-semibold mb-4'>
                  Company Information
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Company Name
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Building className='h-5 w-5 text-gray-400' />
                      </div>
                      <Input
                        {...register('companyName')}
                        placeholder='Enter company name'
                        className='pl-10'
                        error={errors.companyName?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Registration Number
                    </label>
                    <Input
                      {...register('registrationNumber')}
                      placeholder='Enter registration number'
                      error={errors.registrationNumber?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Tax ID / VAT Number
                    </label>
                    <Input
                      {...register('taxId')}
                      placeholder='Enter tax ID'
                      error={errors.taxId?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Vendor Type
                    </label>
                    <Select
                      {...register('vendorType')}
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
              <div className='space-y-6'>
                <h3 className='text-xl font-semibold mb-4'>
                  Contact & Address Information
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Contact Person
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <User className='h-5 w-5 text-gray-400' />
                      </div>
                      <Input
                        {...register('contactPerson')}
                        placeholder='Enter contact person name'
                        className='pl-10'
                        error={errors.contactPerson?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Address
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Mail className='h-5 w-5 text-gray-400' />
                      </div>
                      <Input
                        {...register('email')}
                        type='email'
                        placeholder='vendor@company.com'
                        className='pl-10'
                        error={errors.email?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Phone Number
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Phone className='h-5 w-5 text-gray-400' />
                      </div>
                      <Input
                        {...register('phone')}
                        placeholder='+1 (555) 123-4567'
                        className='pl-10'
                        error={errors.phone?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Website (Optional)
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Globe className='h-5 w-5 text-gray-400' />
                      </div>
                      <Input
                        {...register('website')}
                        placeholder='https://www.company.com'
                        className='pl-10'
                        error={errors.website?.message}
                      />
                    </div>
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Address
                    </label>
                    <div className='relative'>
                      <div className='absolute top-3 left-3 pointer-events-none'>
                        <MapPin className='h-5 w-5 text-gray-400' />
                      </div>
                      <Textarea
                        {...register('address')}
                        placeholder='Enter street address'
                        className='pl-10'
                        rows={3}
                        error={errors.address?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      City
                    </label>
                    <Input
                      {...register('city')}
                      placeholder='Enter city'
                      error={errors.city?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      State/Province
                    </label>
                    <Input
                      {...register('state')}
                      placeholder='Enter state'
                      error={errors.state?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Country
                    </label>
                    <Input
                      {...register('country')}
                      placeholder='Enter country'
                      error={errors.country?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Postal Code
                    </label>
                    <Input
                      {...register('postalCode')}
                      placeholder='Enter postal code'
                      error={errors.postalCode?.message}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Banking Details */}
            {currentStep === 3 && (
              <div className='space-y-6'>
                <h3 className='text-xl font-semibold mb-4'>
                  Banking Information
                </h3>

                <Alert variant='info'>
                  This information is required for payment processing and will
                  be kept confidential.
                </Alert>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Bank Name
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <CreditCard className='h-5 w-5 text-gray-400' />
                      </div>
                      <Input
                        {...register('bankName')}
                        placeholder='Enter bank name'
                        className='pl-10'
                        error={errors.bankName?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Account Number
                    </label>
                    <Input
                      {...register('accountNumber')}
                      placeholder='Enter account number'
                      type='password'
                      error={errors.accountNumber?.message}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Routing Number / SWIFT Code
                    </label>
                    <Input
                      {...register('routingNumber')}
                      placeholder='Enter routing number'
                      error={errors.routingNumber?.message}
                    />
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Business Description (Optional)
                    </label>
                    <Textarea
                      {...register('description')}
                      placeholder='Briefly describe your business and services'
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Certifications (Optional)
                    </label>
                    <Textarea
                      {...register('certifications')}
                      placeholder='List any relevant certifications (ISO, Quality, etc.)'
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className='space-y-6'>
                <h3 className='text-xl font-semibold mb-4'>
                  Review Your Information
                </h3>

                <div className='space-y-4'>
                  <Card className='p-4'>
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
                  </Card>

                  <Card className='p-4'>
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
                  </Card>

                  <Card className='p-4'>
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
                  </Card>
                </div>

                <Alert>
                  By submitting this form, you agree to our terms and conditions
                  and authorize Autovitica to verify the provided information.
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
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button type='button' onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type='submit' disabled={isSubmitting}>
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
