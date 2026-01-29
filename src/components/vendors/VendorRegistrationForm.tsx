import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle,
  Building2,
  FileText,
  Hash,
  Briefcase,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Home,
  Map,
  Flag,
  MapPinned,
  Landmark,
  CreditCard,
  Shield,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { PrimaryButton } from '../common/Buttons/PrimaryButton';
import FormInput from '../common/Form/FormInput';
import FormSelect from '../common/Form/FormSelect';
import FormSection from '../common/Form/FormSection';
import Stepper from '../common/Stepper';
import FormTextarea from '../common/Form/FormTextArea';

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

const STEPS = [
  { number: 1, label: 'Company Info' },
  { number: 2, label: 'Contact & Address' },
  { number: 3, label: 'Review Your Information' },
];

export function VendorRegistrationForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Success Screen
  if (registrationComplete) {
    return (
      <div className='min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6'>
        <div className='max-w-xl w-full text-center'>
          {/* Success Icon with Animation */}
          <div className='mx-auto mb-8 h-24 w-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl animate-bounce-slow'>
            <CheckCircle className='h-14 w-14 text-white' strokeWidth={2.5} />
          </div>

          {/* Success Message */}
          <h2 className='text-4xl font-bold text-gray-900 mb-3'>
            Registration Successful! 🎉
          </h2>
          <p className='text-lg text-gray-600 mb-8'>
            Your vendor account has been created. Login credentials have been
            sent to your email address.
          </p>

          {/* Account Details Card */}
          <div className='bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-2xl p-8 mb-8 max-w-md mx-auto text-left shadow-lg'>
            <h3 className='font-bold text-indigo-900 mb-5 text-lg flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Your Account Details
            </h3>
            <div className='space-y-4'>
              <div className='bg-white rounded-lg p-4 shadow-sm'>
                <span className='text-sm text-indigo-600 font-semibold block mb-1'>
                  Vendor Code
                </span>
                <span className='text-lg font-bold text-gray-900 font-mono'>
                  {registrationData?.vendorCode}
                </span>
              </div>
              <div className='bg-white rounded-lg p-4 shadow-sm'>
                <span className='text-sm text-indigo-600 font-semibold block mb-1'>
                  Login Email
                </span>
                <span className='text-lg font-bold text-gray-900 font-mono break-all'>
                  {registrationData?.loginEmail}
                </span>
              </div>
              <div className='bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-3 flex items-center gap-2'>
                <Mail className='h-4 w-4 text-indigo-700' />
                <span className='text-sm text-indigo-900 font-medium'>
                  Password sent to your email
                </span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <PrimaryButton
            onClick={() => navigate('/auth/login')}
            variant='gradient'
            className='px-12'
          >
            Go to Login
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={currentStep} />

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Step 1: Company Information */}
        {currentStep === 1 && (
          <FormSection
            title='Company Information'
            subtitle='Tell us about your organization'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormInput
                label='Company Name'
                placeholder='Acme Corporation'
                icon={<Building2 className='h-5 w-5' />}
                error={errors.companyName?.message}
                {...register('companyName')}
              />

              <FormInput
                label='Registration Number'
                placeholder='REG-123456'
                icon={<FileText className='h-5 w-5' />}
                error={errors.registrationNumber?.message}
                {...register('registrationNumber')}
              />

              <FormInput
                label='Tax ID / VAT Number'
                placeholder='TAX-789012'
                icon={<Hash className='h-5 w-5' />}
                error={errors.taxId?.message}
                {...register('taxId')}
              />

              <FormSelect
                label='Vendor Type'
                error={errors.vendorType?.message}
                {...register('vendorType')}
              >
                <option value='supplier'>Supplier</option>
                <option value='service_provider'>Service Provider</option>
                <option value='contractor'>Contractor</option>
                <option value='consultant'>Consultant</option>
              </FormSelect>
            </div>
          </FormSection>
        )}

        {/* Step 2: Contact & Address */}
        {currentStep === 2 && (
          <FormSection
            title='Contact & Address Information'
            subtitle='How can we reach you?'
          >
            <div className='space-y-6'>
              {/* Contact Details */}
              <div>
                <h4 className='text-sm font-bold text-gray-700 mb-4 flex items-center gap-2'>
                  <User className='h-4 w-4 text-indigo-600' />
                  Contact Details
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <FormInput
                    label='Contact Person'
                    placeholder='John Doe'
                    icon={<User className='h-5 w-5' />}
                    error={errors.contactPerson?.message}
                    {...register('contactPerson')}
                  />

                  <FormInput
                    label='Email Address'
                    type='email'
                    placeholder='john@company.com'
                    icon={<Mail className='h-5 w-5' />}
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <FormInput
                    label='Phone Number'
                    placeholder='+1 (555) 123-4567'
                    icon={<Phone className='h-5 w-5' />}
                    error={errors.phone?.message}
                    {...register('phone')}
                  />

                  <FormInput
                    label='Website (Optional)'
                    placeholder='https://www.company.com'
                    icon={<Globe className='h-5 w-5' />}
                    error={errors.website?.message}
                    {...register('website')}
                  />
                </div>
              </div>

              {/* Address Details */}
              <div>
                <h4 className='text-sm font-bold text-gray-700 mb-4 flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-indigo-600' />
                  Business Address
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='md:col-span-2'>
                    <FormTextarea
                      label='Street Address'
                      placeholder='123 Business Street, Suite 100'
                      rows={3}
                      error={errors.address?.message}
                      {...register('address')}
                    />
                  </div>

                  <FormInput
                    label='City'
                    placeholder='New York'
                    icon={<Home className='h-5 w-5' />}
                    error={errors.city?.message}
                    {...register('city')}
                  />

                  <FormInput
                    label='State/Province'
                    placeholder='NY'
                    icon={<Map className='h-5 w-5' />}
                    error={errors.state?.message}
                    {...register('state')}
                  />

                  <FormInput
                    label='Country'
                    placeholder='United States'
                    icon={<Flag className='h-5 w-5' />}
                    error={errors.country?.message}
                    {...register('country')}
                  />

                  <FormInput
                    label='Postal Code'
                    placeholder='10001'
                    icon={<MapPinned className='h-5 w-5' />}
                    error={errors.postalCode?.message}
                    {...register('postalCode')}
                  />
                </div>
              </div>
            </div>
          </FormSection>
        )}

        {/* Step 3: Banking & Review */}
        {currentStep === 3 && (
          <div className='space-y-8'>
            {/* <FormSection 
              title='Banking Information'
              subtitle='Secure payment details'
            >
              <Alert variant='info' className='text-sm py-3 mb-6 bg-indigo-50 border-indigo-200 text-indigo-800 flex items-start gap-2'>
                <Shield className='h-5 w-5 flex-shrink-0 mt-0.5' />
                <span>Your banking information is encrypted and will be kept strictly confidential for payment processing only.</span>
              </Alert>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='md:col-span-2'>
                  <FormInput
                    label='Bank Name'
                    placeholder='Chase Bank'
                    icon={<Landmark className='h-5 w-5' />}
                    error={errors.bankName?.message}
                    {...register('bankName')}
                  />
                </div>

                <FormInput
                  label='Account Number'
                  type='password'
                  placeholder='Enter account number'
                  icon={<CreditCard className='h-5 w-5' />}
                  error={errors.accountNumber?.message}
                  {...register('accountNumber')}
                />

                <FormInput
                  label='Routing Number / SWIFT Code'
                  placeholder='Enter routing number'
                  icon={<Hash className='h-5 w-5' />}
                  error={errors.routingNumber?.message}
                  {...register('routingNumber')}
                />
              </div>

              <div className='space-y-6 mt-6 pt-6 border-t border-gray-200'>
                <h4 className='text-sm font-bold text-gray-700 flex items-center gap-2'>
                  <FileCheck className='h-4 w-4 text-indigo-600' />
                  Additional Information (Optional)
                </h4>
                
                <FormTextarea
                  label='Business Description'
                  placeholder='Tell us about your business, products, and services...'
                  rows={4}
                  {...register('description')}
                />

                <FormTextarea
                  label='Certifications'
                  placeholder='ISO 9001:2015, Quality Management, etc.'
                  rows={3}
                  {...register('certifications')}
                />
              </div>
            </FormSection> */}

            {/* Review Section */}
            <FormSection
              title='Review Your Information'
              subtitle='Please verify all details before submitting'
            >
              <div className='space-y-4'>
                {/* Company Info Card */}
                <div className='bg-white border-2 border-gray-100 rounded-xl p-5 hover:border-indigo-100 transition-colors'>
                  <div className='flex items-center gap-2 mb-4'>
                    <Building2 className='h-5 w-5 text-indigo-600' />
                    <h4 className='font-bold text-gray-900'>
                      Company Information
                    </h4>
                  </div>
                  <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <dt className='text-gray-500 mb-1'>Company Name</dt>
                      <dd className='font-semibold text-gray-900'>
                        {watch('companyName')}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-gray-500 mb-1'>
                        Registration Number
                      </dt>
                      <dd className='font-semibold text-gray-900'>
                        {watch('registrationNumber')}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-gray-500 mb-1'>Tax ID</dt>
                      <dd className='font-semibold text-gray-900'>
                        {watch('taxId')}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-gray-500 mb-1'>Vendor Type</dt>
                      <dd className='font-semibold text-gray-900 capitalize'>
                        {watch('vendorType')?.replace('_', ' ')}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Contact Info Card */}
                <div className='bg-white border-2 border-gray-100 rounded-xl p-5 hover:border-indigo-100 transition-colors'>
                  <div className='flex items-center gap-2 mb-4'>
                    <User className='h-5 w-5 text-indigo-600' />
                    <h4 className='font-bold text-gray-900'>
                      Contact Information
                    </h4>
                  </div>
                  <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <dt className='text-gray-500 mb-1'>Contact Person</dt>
                      <dd className='font-semibold text-gray-900'>
                        {watch('contactPerson')}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-gray-500 mb-1'>Email</dt>
                      <dd className='font-semibold text-gray-900'>
                        {watch('email')}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-gray-500 mb-1'>Phone</dt>
                      <dd className='font-semibold text-gray-900'>
                        {watch('phone')}
                      </dd>
                    </div>
                    <div className='sm:col-span-2'>
                      <dt className='text-gray-500 mb-1'>Address</dt>
                      <dd className='font-semibold text-gray-900'>
                        {watch('address')}, {watch('city')}, {watch('state')}{' '}
                        {watch('postalCode')}, {watch('country')}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Banking Info Card */}
                <div className='bg-white border-2 border-gray-100 rounded-xl p-5 hover:border-indigo-100 transition-colors'>
                  <div className='flex items-center gap-2 mb-4'>
                    <Landmark className='h-5 w-5 text-indigo-600' />
                    <h4 className='font-bold text-gray-900'>
                      Banking Information
                    </h4>
                  </div>
                  <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <dt className='text-gray-500 mb-1'>Bank Name</dt>
                      <dd className='font-semibold text-gray-900'>
                        {watch('bankName')}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-gray-500 mb-1'>Account Number</dt>
                      <dd className='font-semibold text-gray-900 font-mono'>
                        ••••{watch('accountNumber')?.slice(-4)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <Alert className='text-sm py-3 mt-6 bg-amber-50 border-amber-200 text-amber-900 flex items-start gap-2'>
                <FileCheck className='h-5 w-5 flex-shrink-0 mt-0.5' />
                <span>
                  By submitting this form, you agree to our{' '}
                  <strong>terms and conditions</strong> and authorize Procleo to
                  verify the provided information.
                </span>
              </Alert>
            </FormSection>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className='flex justify-between items-center pt-8 border-t border-gray-100'>
          <Button
            type='button'
            variant='outline'
            onClick={prevStep}
            disabled={currentStep === 1}
            className='h-12 px-8 text-sm font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Previous
          </Button>

          {currentStep < 3 ? (
            <PrimaryButton type='button' onClick={nextStep}>
              Continue
            </PrimaryButton>
          ) : (
            <PrimaryButton
              type='submit'
              isLoading={isSubmitting}
              loadingText='Submitting...'
              variant='gradient'
            >
              Submit Registration
            </PrimaryButton>
          )}
        </div>
      </form>
    </div>
  );
}

export default VendorRegistrationForm;
