import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  FileCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import RecentActivityWidget from '@/components/dashboard/RecentActivityWidget';
import StatusSummaryCard from '@/components/dashboard/StatusSummaryCard';

const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useDashboardData();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <p className='text-gray-600'>Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const {
    stats,
    recentOrders,
    monthlySpend,
    categorySpend,
  } = dashboardData;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statsList = [
    {
      name: 'Total Purchase Orders',
      value: stats.totalPurchaseOrders.toString(),
      change: `${stats.pendingPOs} pending`,
      changeType: 'warning',
      icon: ShoppingCart,
      href: '/purchase-orders',
      color: 'bg-blue-500',
    },
    {
      name: 'Total Vendors',
      value: stats.totalVendors.toString(),
      change: 'Active',
      changeType: 'increase',
      icon: Users,
      href: '/master/suppliers',
      color: 'bg-green-500',
    },
    {
      name: 'Purchase Requests',
      value: stats.totalPurchaseRequests.toString(),
      change: `${stats.pendingPRs} pending`,
      changeType: 'warning',
      icon: FileText,
      href: '/purchase-requisition/manage',
      color: 'bg-yellow-500',
    },
    {
      name: 'Total RFPs',
      value: stats.totalRFPs.toString(),
      change: `${stats.activeRFPs} active`,
      changeType: 'increase',
      icon: TrendingUp,
      href: '/rfp/manage',
      color: 'bg-purple-500',
    },
    {
      name: 'Total GRNs',
      value: stats.totalGRNs.toString(),
      change: 'Received',
      changeType: 'increase',
      icon: Package,
      href: '/grn/list',
      color: 'bg-indigo-500',
    },
    {
      name: 'Overdue POs',
      value: stats.overduePOs.toString(),
      change: 'Action Required',
      changeType: 'decrease',
      icon: AlertCircle,
      href: '/purchase-orders',
      color: 'bg-red-500',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return <Clock className='w-3 h-3' />;
    if (statusLower.includes('approved'))
      return <CheckCircle className='w-3 h-3' />;
    if (statusLower.includes('completed'))
      return <CheckCircle className='w-3 h-3' />;
    return <FileCheck className='w-3 h-3' />;
  };

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          {getGreeting()}, {user?.firstName || 'User'}
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Here's what's happening with your procurement today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {statsList.map(item => (
          <Link
            key={item.name}
            to={item.href}
            className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 group'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-500'>{item.name}</p>
                <p className='text-2xl font-bold text-gray-900 mt-2'>
                  {item.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${item.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                <item.icon className={`w-6 h-6 ${item.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              <span
                className={`text-sm font-medium ${item.changeType === 'increase'
                  ? 'text-green-600'
                  : item.changeType === 'decrease'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                  }`}
              >
                {item.change}
              </span>
              <span className='text-sm text-gray-400 ml-2'>vs last month</span>
            </div>
          </Link>
        ))}
      </div>

      {/* New Widgets Grid: Status Summary & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        <StatusSummaryCard stats={stats} />
        <RecentActivityWidget />
      </div>

      {/* Charts Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Monthly Spend Trend */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Monthly Spend vs Budget
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={monthlySpend}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='month' stroke='#6b7280' />
              <YAxis stroke='#6b7280' />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => [
                  `₹${value.toLocaleString()}`,
                  name === 'spend' ? 'Actual Spend' : 'Budget',
                ]}
              />
              <Legend />
              <Area
                type='monotone'
                dataKey='budget'
                stackId='1'
                stroke='#e5e7eb'
                fill='#f3f4f6'
              />
              <Area
                type='monotone'
                dataKey='spend'
                stackId='2'
                stroke='#6366f1'
                fill='#8b5cf6'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Spend Distribution */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Spend by Category
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={categorySpend}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }: { name: string; percent?: number }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
              >
                {categorySpend.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `₹${value.toLocaleString()}`,
                  'Amount',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Purchase Orders */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Recent Purchase Orders
          </h2>
        </div>
        <div className='p-6 space-y-4'>
          {recentOrders.length > 0 ? (
            <>
              {recentOrders.slice(0, 5).map(order => (
                <div
                  key={order.id}
                  className='flex justify-between items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600'>
                      <ShoppingCart className='w-5 h-5' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {order.poNumber}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {order.supplierName}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <div className='text-right'>
                      <p className='text-sm font-medium text-gray-900'>
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                      <p className='text-xs text-gray-500'>{order.poDate}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className='capitalize'>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className='mt-4 text-center'>
                <Link
                  to='/purchase-orders'
                  className='text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors'
                >
                  View all purchase orders
                </Link>
              </div>
            </>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <p>No recent purchase orders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
