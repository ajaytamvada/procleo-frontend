import React from 'react';
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVendorDashboard } from '../hooks/useVendorPortal';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  href?: string;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  red: 'bg-red-50 text-red-600 border-red-200',
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  href,
}) => {
  const content = (
    <div
      className={`rounded-xl border p-6 transition-all hover:shadow-md ${colorClasses[color]}`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-500'>{title}</p>
          <p className='text-3xl font-bold mt-1'>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className='block'>
        {content}
      </Link>
    );
  }

  return content;
};

const VendorDashboard: React.FC = () => {
  const { data: dashboard, isLoading, error } = useVendorDashboard();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
        <AlertCircle className='inline-block w-5 h-5 mr-2' />
        Error loading dashboard. Please try again later.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Vendor Dashboard</h1>
          <p className='text-gray-500 mt-1'>
            Welcome back, {dashboard?.vendorName || 'Vendor'}
          </p>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <Building2 className='w-4 h-4' />
          <span>{dashboard?.vendorName}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Active RFP Invitations'
          value={dashboard?.activeRfpInvitations || 0}
          icon={<FileText className='w-6 h-6' />}
          color='blue'
          href='/vendor/rfps'
        />
        <StatCard
          title='Pending Quotations'
          value={dashboard?.pendingQuotations || 0}
          icon={<Clock className='w-6 h-6' />}
          color='yellow'
          href='/vendor/rfps'
        />
        <StatCard
          title='Submitted Quotations'
          value={dashboard?.submittedQuotations || 0}
          icon={<CheckCircle className='w-6 h-6' />}
          color='green'
          href='/vendor/quotations'
        />
        <StatCard
          title='Purchase Orders'
          value={dashboard?.purchaseOrders || 0}
          icon={<ShoppingCart className='w-6 h-6' />}
          color='purple'
          href='/vendor/orders'
        />
      </div>

      {/* Quick Actions */}
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Quick Actions
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Link
            to='/vendor/rfps'
            className='flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'
          >
            <FileText className='w-5 h-5 text-blue-600' />
            <span className='font-medium text-blue-700'>
              View RFP Invitations
            </span>
          </Link>
          <Link
            to='/vendor/quotations'
            className='flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors'
          >
            <TrendingUp className='w-5 h-5 text-green-600' />
            <span className='font-medium text-green-700'>My Quotations</span>
          </Link>
          <Link
            to='/vendor/profile'
            className='flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors'
          >
            <Building2 className='w-5 h-5 text-purple-600' />
            <span className='font-medium text-purple-700'>Company Profile</span>
          </Link>
        </div>
      </div>

      {/* Pending Actions Notice */}
      {(dashboard?.pendingQuotations ?? 0) > 0 && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3'>
          <AlertCircle className='w-5 h-5 text-yellow-600 mt-0.5' />
          <div>
            <p className='font-medium text-yellow-800'>
              You have {dashboard?.pendingQuotations} RFPs waiting for your
              quotation
            </p>
            <p className='text-sm text-yellow-600 mt-1'>
              Submit your quotations before the closing dates to participate in
              the bidding process.
            </p>
            <Link
              to='/vendor/rfps'
              className='inline-block mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-800 underline'
            >
              View pending RFPs →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
