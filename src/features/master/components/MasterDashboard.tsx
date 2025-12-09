import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  DollarSign,
  MapPin,
  Users,
  Settings,
  Package,
  TrendingUp,
  Ruler,
  Receipt,
  Briefcase,
  Building,
  Globe,
} from 'lucide-react';

interface MasterStatCard {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  path: string;
}

interface MasterSection {
  sectionTitle: string;
  cards: MasterStatCard[];
}

const masterSections: MasterSection[] = [
  {
    sectionTitle: 'Configuration',
    cards: [
      {
        title: 'Companies',
        count: 12,
        icon: <Building2 size={24} />,
        color: 'blue',
        path: '/master/company',
      },
    ],
  },
  {
    sectionTitle: 'Finance Setup',
    cards: [
      {
        title: 'Currencies',
        count: 8,
        icon: <DollarSign size={24} />,
        color: 'green',
        path: '/master/currency',
      },
      {
        title: 'Tax',
        count: 8,
        icon: <Receipt size={24} />,
        color: 'yellow',
        path: '/master/tax',
      },
      {
        title: 'UOM',
        count: 15,
        icon: <Ruler size={24} />,
        color: 'cyan',
        path: '/master/uom',
      },
      {
        title: 'Suppliers',
        count: 156,
        icon: <Users size={24} />,
        color: 'orange',
        path: '/master/suppliers',
      },
    ],
  },
  {
    sectionTitle: 'Organization Details',
    cards: [
      {
        title: 'Departments',
        count: 23,
        icon: <Settings size={24} />,
        color: 'indigo',
        path: '/master/departments',
      },
      {
        title: 'Designation',
        count: 34,
        icon: <Briefcase size={24} />,
        color: 'pink',
        path: '/master/designation',
      },
    ],
  },
  {
    sectionTitle: 'Geographical Area',
    cards: [
      {
        title: 'Locations',
        count: 45,
        icon: <MapPin size={24} />,
        color: 'purple',
        path: '/master/locations',
      },
      {
        title: 'Buildings',
        count: 12,
        icon: <Building size={24} />,
        color: 'teal',
        path: '/master/building',
      },
      {
        title: 'Countries',
        count: 195,
        icon: <Globe size={24} />,
        color: 'emerald',
        path: '/master/countries',
      },
    ],
  },
];

const MasterDashboard: React.FC = () => {
  const navigate = useNavigate();

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      red: 'bg-red-50 text-red-600',
      cyan: 'bg-cyan-50 text-cyan-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      pink: 'bg-pink-50 text-pink-600',
      teal: 'bg-teal-50 text-teal-600',
      emerald: 'bg-emerald-50 text-emerald-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className='space-y-6'>
      {/* Welcome Section */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>
              Master Configuration Dashboard
            </h1>
            <p className='text-blue-100 mt-2'>
              Manage all system configuration and reference data from one
              central location
            </p>
          </div>
          <div className='text-blue-100'>
            <TrendingUp size={48} />
          </div>
        </div>
      </div>

      {/* Statistics Cards Grouped by Sections */}
      <div className='space-y-8'>
        {masterSections.map(section => (
          <div key={section.sectionTitle}>
            {/* Section Header */}
            <div className='mb-4 pb-2 border-b-2 border-gray-300'>
              <h2 className='text-xl font-semibold text-gray-800'>
                {section.sectionTitle}
              </h2>
            </div>

            {/* Section Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {section.cards.map(stat => (
                <div
                  key={stat.title}
                  className='bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer'
                  onClick={() => navigate(stat.path)}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        {stat.title}
                      </p>
                      <p className='text-3xl font-bold text-gray-900 mt-1'>
                        {stat.count}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-full ${getColorClasses(stat.color)}`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                  <div className='mt-4'>
                    <div className='flex items-center text-sm text-gray-500'>
                      <span>Manage {stat.title.toLowerCase()}</span>
                      <svg
                        className='ml-2 w-4 h-4'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Quick Actions
          </h3>
          <div className='space-y-3'>
            <button className='w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
              <div className='flex items-center'>
                <Building2 size={20} className='text-blue-600 mr-3' />
                <span className='text-sm font-medium text-gray-900'>
                  Add New Company
                </span>
              </div>
              <svg
                className='w-5 h-5 text-gray-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
            <button className='w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
              <div className='flex items-center'>
                <Users size={20} className='text-green-600 mr-3' />
                <span className='text-sm font-medium text-gray-900'>
                  Add New Supplier
                </span>
              </div>
              <svg
                className='w-5 h-5 text-gray-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
            <button className='w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
              <div className='flex items-center'>
                <DollarSign size={20} className='text-purple-600 mr-3' />
                <span className='text-sm font-medium text-gray-900'>
                  Configure Currency
                </span>
              </div>
              <svg
                className='w-5 h-5 text-gray-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Recent Activity
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center text-sm'>
              <div className='w-2 h-2 bg-green-500 rounded-full mr-3'></div>
              <span className='text-gray-600'>
                Company "ABC Corp" was created
              </span>
              <span className='text-gray-400 ml-auto'>2 hours ago</span>
            </div>
            <div className='flex items-center text-sm'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
              <span className='text-gray-600'>Currency "EUR" was updated</span>
              <span className='text-gray-400 ml-auto'>4 hours ago</span>
            </div>
            <div className='flex items-center text-sm'>
              <div className='w-2 h-2 bg-orange-500 rounded-full mr-3'></div>
              <span className='text-gray-600'>
                New department "IT Support" added
              </span>
              <span className='text-gray-400 ml-auto'>1 day ago</span>
            </div>
            <div className='flex items-center text-sm'>
              <div className='w-2 h-2 bg-purple-500 rounded-full mr-3'></div>
              <span className='text-gray-600'>
                Supplier "XYZ Ltd" was activated
              </span>
              <span className='text-gray-400 ml-auto'>2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
