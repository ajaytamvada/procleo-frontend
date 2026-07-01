import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle,
  Building2,
  FileText,
  Hash,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Home,
  Map,
  Flag,
  MapPinned,
  Shield,
  Briefcase,
  IdCard,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { PrimaryButton } from '../common/Buttons/PrimaryButton';
import FormInput from '../common/Form/FormInput';
import FormSelect from '../common/Form/FormSelect';
import FormSection from '../common/Form/FormSection';
import FormTextarea from '../common/Form/FormTextArea';

// Validation schema for vendor registration.
// Only the fields the backend genuinely requires are mandatory; the rest are
// optional here and can be completed later from the supplier portal screen.
const vendorRegistrationSchema = z.object({
  // Company Information
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyEmail: z.string().email('Invalid company email address'),
  companyCode: z.string().optional(),
  gst: z.string().optional(),
  pan: z.string().optional(),
  vendorType: z.enum([
    'supplier',
    'service_provider',
    'contractor',
    'consultant',
  ]),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),

  // Primary Contact (used to create the vendor login)
  contactFirstName: z.string().min(2, 'Contact first name is required'),
  contactLastName: z.string().optional(),
  contactDesignation: z.string().optional(),
  contactEmail: z.string().email('Invalid contact email address'),
  contactPhone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),

  // Address Information (optional at registration)
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),

  // Additional Information
  description: z.string().optional(),
});

type VendorRegistrationData = z.infer<typeof vendorRegistrationSchema>;

export function VendorRegistrationForm() {
  const navigate = useNavigate();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VendorRegistrationData>({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: {
      vendorType: 'supplier',
    },
  });

  const onSubmit = async (data: VendorRegistrationData) => {
    try {
      // Map form data to the backend VendorRegistrationDto.
      const registrationDto = {
        companyName: data.companyName,
        companyCode: data.companyCode || undefined,
        companyEmail: data.companyEmail,
        phone: data.phone || undefined,
        website: data.website || undefined,
        address1: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
        pinCode: data.postalCode || undefined,
        gst: data.gst || undefined,
        pan: data.pan || undefined,
        contactFirstName: data.contactFirstName,
        contactLastName: data.contactLastName || undefined,
        contactDesignation: data.contactDesignation || undefined,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || undefined,
        industry: data.vendorType,
        businessDescription: data.description || undefined,
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

  // Surface validation problems so the submit button never silently no-ops.
  const onInvalid = () => {
    toast.error('Please fill in all required fields highlighted in red.');
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
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className='space-y-10'>
        {/* Company Information */}
        <FormSection
          title='Company Information'
          subtitle='Tell us about your organization'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormInput
              label='Company Name'
              required
              placeholder='Acme Corporation'
              icon={<Building2 className='h-5 w-5' />}
              error={errors.companyName?.message}
              {...register('companyName')}
            />

            <FormInput
              label='Company Email'
              required
              type='email'
              placeholder='info@company.com'
              icon={<Mail className='h-5 w-5' />}
              error={errors.companyEmail?.message}
              {...register('companyEmail')}
            />

            <FormInput
              label='Registration / Company Code'
              placeholder='REG-123456'
              icon={<FileText className='h-5 w-5' />}
              error={errors.companyCode?.message}
              {...register('companyCode')}
            />

            <FormSelect
              label='Vendor Type'
              required
              error={errors.vendorType?.message}
              {...register('vendorType')}
            >
              <option value='supplier'>Supplier</option>
              <option value='service_provider'>Service Provider</option>
              <option value='contractor'>Contractor</option>
              <option value='consultant'>Consultant</option>
            </FormSelect>

            <FormInput
              label='GST Number'
              placeholder='22AAAAA0000A1Z5'
              icon={<Hash className='h-5 w-5' />}
              error={errors.gst?.message}
              {...register('gst')}
            />

            <FormInput
              label='PAN Number'
              placeholder='AAAAA0000A'
              icon={<IdCard className='h-5 w-5' />}
              error={errors.pan?.message}
              {...register('pan')}
            />

            <FormInput
              label='Phone Number'
              placeholder='+91 98765 43210'
              icon={<Phone className='h-5 w-5' />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <FormInput
              label='Website'
              placeholder='https://www.company.com'
              icon={<Globe className='h-5 w-5' />}
              error={errors.website?.message}
              {...register('website')}
            />
          </div>
        </FormSection>

        {/* Primary Contact */}
        <FormSection
          title='Primary Contact'
          subtitle='This person will receive the vendor portal login'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormInput
              label='First Name'
              required
              placeholder='John'
              icon={<User className='h-5 w-5' />}
              error={errors.contactFirstName?.message}
              {...register('contactFirstName')}
            />

            <FormInput
              label='Last Name'
              placeholder='Doe'
              icon={<User className='h-5 w-5' />}
              error={errors.contactLastName?.message}
              {...register('contactLastName')}
            />

            <FormInput
              label='Designation'
              placeholder='Procurement Manager'
              icon={<Briefcase className='h-5 w-5' />}
              error={errors.contactDesignation?.message}
              {...register('contactDesignation')}
            />

            <FormInput
              label='Contact Email (Login)'
              required
              type='email'
              placeholder='john@company.com'
              icon={<Mail className='h-5 w-5' />}
              error={errors.contactEmail?.message}
              {...register('contactEmail')}
            />

            <FormInput
              label='Contact Phone'
              placeholder='+91 98765 43210'
              icon={<Phone className='h-5 w-5' />}
              error={errors.contactPhone?.message}
              {...register('contactPhone')}
            />
          </div>
        </FormSection>

        {/* Business Address */}
        <FormSection
          title='Business Address'
          subtitle='Optional — you can complete this later from your portal'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='md:col-span-2'>
              <FormTextarea
                label='Street Address'
                placeholder='123 Business Street, Suite 100'
                rows={2}
                error={errors.address?.message}
                {...register('address')}
              />
            </div>

            <FormInput
              label='City'
              placeholder='Mumbai'
              icon={<Home className='h-5 w-5' />}
              error={errors.city?.message}
              {...register('city')}
            />

            <FormInput
              label='State / Province'
              placeholder='Maharashtra'
              icon={<Map className='h-5 w-5' />}
              error={errors.state?.message}
              {...register('state')}
            />

            <FormInput
              label='Country'
              placeholder='India'
              icon={<Flag className='h-5 w-5' />}
              error={errors.country?.message}
              {...register('country')}
            />

            <FormInput
              label='Postal Code'
              placeholder='400001'
              icon={<MapPinned className='h-5 w-5' />}
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
          </div>
        </FormSection>

        {/* Additional Information */}
        <FormSection
          title='Additional Information'
          subtitle='Help us understand your business'
        >
          <FormTextarea
            label='Business Description'
            placeholder='Tell us about your business, products, and services...'
            rows={4}
            error={errors.description?.message}
            {...register('description')}
          />
        </FormSection>

        <Alert className='text-sm py-3 bg-amber-50 border-amber-200 text-amber-900 flex items-start gap-2'>
          <MapPin className='h-5 w-5 flex-shrink-0 mt-0.5' />
          <span>
            By submitting this form, you agree to our{' '}
            <strong>terms and conditions</strong> and authorize Procleo to
            verify the provided information.
          </span>
        </Alert>

        {/* Submit */}
        <div className='flex justify-end items-center pt-6 border-t border-gray-100'>
          <PrimaryButton
            type='submit'
            isLoading={isSubmitting}
            loadingText='Submitting...'
            variant='gradient'
            className='px-12'
          >
            Submit Registration
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

export default VendorRegistrationForm;
