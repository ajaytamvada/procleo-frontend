import React from 'react';
import { Link } from 'react-router-dom';

interface SettingsCategory {
  title: string;
  items: { name: string; href: string }[];
}

const settingsCategories: SettingsCategory[] = [
  {
    title: 'Company Setup',
    items: [
      { name: 'Company', href: '/master/company' },
      { name: 'Currency', href: '/master/currency' },
      { name: 'Suppliers', href: '/master/suppliers' },
      { name: 'Stock Rooms', href: '/master/stockrooms' },
    ],
  },
  {
    title: 'Geographical Area',
    items: [
      { name: 'Countries', href: '/master/countries' },
      { name: 'States', href: '/master/states' },
      { name: 'Cities', href: '/master/cities' },
      { name: 'Locations', href: '/master/floors' },
    ],
  },
  {
    title: 'Items & Categories',
    items: [
      { name: 'Categories', href: '/master/categories' },
      { name: 'Sub-Categories', href: '/master/subcategories' },
      { name: 'Items', href: '/master/items' },
      { name: 'Unit of Measure', href: '/master/uom' },
    ],
  },
  {
    title: 'Organization Details',
    items: [
      { name: 'Designation', href: '/master/designations' },
      { name: 'Department', href: '/master/departments' },
      { name: 'Cost Center', href: '/master/cost-centers' },
      { name: 'Employee', href: '/master/employees' },
      { name: 'Group', href: '/master/groups' },
    ],
  },
  {
    title: 'Financial Setup',
    items: [
      { name: 'Financial Year', href: '/master/financial-year' },
      { name: 'Budget', href: '/master/budget' },
      { name: 'Tax Setup', href: '/master/tax' },
      { name: 'Payment Terms', href: '/master/payment-terms' },
      { name: 'Terms and Conditions', href: '/master/terms-and-conditions' },
    ],
  },
  {
    title: 'Access Management',
    items: [
      { name: 'User Type', href: '/master/user-types' },
      { name: 'User Permission', href: '/master/user-permissions' },
      { name: 'Login Provision', href: '/master/login-provision' },
    ],
  },
];

const Settings: React.FC = () => {
  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Page Header */}
      <div className=''>
        <div className='lg:px-8 py-2'>
          <h1 className='text-2xl font-bold text-slate-800'>Settings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className='px-6 lg:px-8 py-6'>
        {/* Section Header */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-slate-800 mb-1'>
            Master Configuration
          </h2>
          <p className='text-sm text-slate-500'>
            Personalise product-specific settings.
          </p>
        </div>

        {/* Settings Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {settingsCategories.map(category => (
            <div
              key={category.title}
              className='bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200'
            >
              {/* Category Title */}
              <h3 className='text-base font-semibold text-slate-700 mb-4'>
                {category.title}
              </h3>

              {/* Links */}
              <div className='space-y-3'>
                {category.items.map(item => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Settings Section */}
        {/* <div className='mt-10'>
          <div className='mb-6'>
            <h2 className='text-lg font-semibold text-slate-800 mb-1'>
              Reports & Analytics
            </h2>
            <p className='text-sm text-slate-500'>
              Access various reports and insights.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            <div className='bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200'>
              <h3 className='text-base font-semibold text-slate-700 mb-4'>
                Procurement Reports
              </h3>
              <div className='space-y-3'>
                <Link
                  to='/reports/pr'
                  className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                >
                  PR Reports
                </Link>
                <Link
                  to='/reports/po'
                  className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                >
                  PO Reports
                </Link>
                <Link
                  to='/reports/grn'
                  className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                >
                  GRN Reports
                </Link>
                <Link
                  to='/reports/invoices'
                  className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                >
                  Invoice Reports
                </Link>
              </div>
            </div>

            <div className='bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200'>
              <h3 className='text-base font-semibold text-slate-700 mb-4'>
                Vendor & RFP
              </h3>
              <div className='space-y-3'>
                <Link
                  to='/reports/vendor'
                  className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                >
                  Vendor Reports
                </Link>
                <Link
                  to='/reports/three-way-match'
                  className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                >
                  3-Way Match
                </Link>
                <Link
                  to='/reports/rfp-float'
                  className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                >
                  RFP Float
                </Link>
                <Link
                  to='/reports/rfp-submitted'
                  className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                >
                  RFP Submitted
                </Link>
              </div>
            </div>

            <div className='bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200'>
              <h3 className='text-base font-semibold text-slate-700 mb-4'>
                System
              </h3>
              <div className='space-y-3'>
                <Link
                  to='/settings/profile'
                  className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                >
                  My Profile
                </Link>
                <Link
                  to='/settings/notifications'
                  className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                >
                  Notifications
                </Link>
                <Link
                  to='/settings/preferences'
                  className='block text-sm text-violet-600 hover:text-violet-700 hover:underline transition-colors'
                >
                  Preferences
                </Link>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Settings;
